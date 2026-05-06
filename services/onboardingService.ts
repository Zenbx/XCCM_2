/**
 * OnboardingService
 *
 * Tracks which onboarding flows and feature discoveries have been seen.
 * - Primary store: localStorage (instant, offline)
 * - Secondary store: server via /api/user/settings (persists across devices)
 *
 * Server sync is debounced: changes are written locally immediately,
 * then synced to the server after 1.5s of inactivity.
 */

const STORAGE_KEY = 'xccm2_onboarding';
const DISCOVERY_KEY = 'xccm2_discoveries';
const SYNC_DEBOUNCE = 1500; // ms

interface OnboardingState {
    [flowId: string]: boolean;
}

interface DiscoveryState {
    [featureId: string]: boolean;
}

class OnboardingService {
    private syncTimer: ReturnType<typeof setTimeout> | null = null;
    private authTokenGetter: (() => string | null) | null = null;

    // ── Registration ──────────────────────────────────────────────────────────

    /** Call once on app init to wire up server sync. */
    registerAuthTokenGetter(getter: () => string | null): void {
        this.authTokenGetter = getter;
    }

    // ── localStorage helpers ──────────────────────────────────────────────────

    private getFlowState(): OnboardingState {
        if (typeof window === 'undefined') return {};
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    private setFlowState(state: OnboardingState): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    private getDiscoveryState(): DiscoveryState {
        if (typeof window === 'undefined') return {};
        try {
            const raw = localStorage.getItem(DISCOVERY_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    private setDiscoveryState(state: DiscoveryState): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(DISCOVERY_KEY, JSON.stringify(state));
    }

    // ── Flow API ──────────────────────────────────────────────────────────────

    hasSeenFlow(flowId: string): boolean {
        return this.getFlowState()[flowId] === true;
    }

    markFlowSeen(flowId: string): void {
        const state = this.getFlowState();
        state[flowId] = true;
        this.setFlowState(state);
        this.scheduleSyncToServer();
    }

    resetFlow(flowId: string): void {
        const state = this.getFlowState();
        delete state[flowId];
        this.setFlowState(state);
    }

    resetAllFlows(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
    }

    // ── Discovery API ─────────────────────────────────────────────────────────

    hasDiscovered(featureId: string): boolean {
        return this.getDiscoveryState()[featureId] === true;
    }

    markDiscovered(featureId: string): void {
        const state = this.getDiscoveryState();
        state[featureId] = true;
        this.setDiscoveryState(state);
        this.scheduleSyncToServer();
    }

    resetDiscovery(featureId: string): void {
        const state = this.getDiscoveryState();
        delete state[featureId];
        this.setDiscoveryState(state);
    }

    resetAllDiscoveries(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(DISCOVERY_KEY);
    }

    // ── Server Sync ───────────────────────────────────────────────────────────

    /**
     * Load onboarding state from server on login.
     * Server state is authoritative: it overrides local state if present.
     */
    async loadFromServer(token: string): Promise<void> {
        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').trim();
            const res = await fetch(`${apiBase}/api/user/settings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;

            const json = await res.json();
            const serverState = json?.data?.settings?.onboarding_state;
            if (!serverState) return;

            // Merge server → local (server wins on seen flows)
            if (serverState.flows) {
                const localFlows = this.getFlowState();
                const merged = { ...localFlows, ...serverState.flows };
                this.setFlowState(merged);
            }

            if (serverState.discoveries) {
                const localDisc = this.getDiscoveryState();
                const merged = { ...localDisc, ...serverState.discoveries };
                this.setDiscoveryState(merged);
            }
        } catch {
            // Fail silently — local state is the fallback
        }
    }

    /**
     * Push current local onboarding state to server (fire-and-forget).
     */
    async syncToServer(): Promise<void> {
        const token = this.authTokenGetter?.();
        if (!token) return;

        try {
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').trim();
            const body = {
                onboarding_state: {
                    flows: this.getFlowState(),
                    discoveries: this.getDiscoveryState(),
                },
            };
            await fetch(`${apiBase}/api/user/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
        } catch {
            // Fail silently
        }
    }

    private scheduleSyncToServer(): void {
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncToServer(), SYNC_DEBOUNCE);
    }
}

export const onboardingService = new OnboardingService();
