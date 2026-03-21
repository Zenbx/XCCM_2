/**
 * OnboardingService
 * Tracks which onboarding flows have been seen by the user via localStorage.
 */

const STORAGE_KEY = 'xccm2_onboarding';

interface OnboardingState {
    [flowId: string]: boolean; // true = already seen
}

class OnboardingService {
    private getState(): OnboardingState {
        if (typeof window === 'undefined') return {};
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    private setState(state: OnboardingState) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    /** Check if a flow has been completed */
    hasSeenFlow(flowId: string): boolean {
        return this.getState()[flowId] === true;
    }

    /** Mark a flow as completed */
    markFlowSeen(flowId: string) {
        const state = this.getState();
        state[flowId] = true;
        this.setState(state);
    }

    /** Reset a specific flow (for testing) */
    resetFlow(flowId: string) {
        const state = this.getState();
        delete state[flowId];
        this.setState(state);
    }

    /** Reset all flows */
    resetAll() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const onboardingService = new OnboardingService();
