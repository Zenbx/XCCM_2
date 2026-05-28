import { useEffect, useRef, useCallback, useState } from 'react';
import { Realtime } from 'ably';
import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface ProjectMember {
    clientId: string;
    userId: string;
    userName: string;
    userColor: string;
    granuleId: string;   // e.g. "notion-abc123" or "part-abc123" or ""
    granuleName: string; // Display name shown in tooltip
}

export interface PresenceData {
    userId: string;
    userName: string;
    userColor: string;
    granuleId: string;
    granuleName: string;
}

interface UseRealtimeSyncOptions {
    projectName: string;
    onStructureChange: (event: string, data: any) => void;
    onPresenceChange?: (count: number, members: any[]) => void;
    presenceData?: PresenceData;
    enabled?: boolean;
}

interface UseRealtimeSyncResult {
    projectMembers: ProjectMember[];
}

export function useRealtimeSync({
    projectName,
    onStructureChange,
    onPresenceChange,
    presenceData,
    enabled = true,
}: UseRealtimeSyncOptions): UseRealtimeSyncResult {
    const ablyRef = useRef<Realtime | null>(null);
    const isConnectedRef = useRef(false);
    const channelRef = useRef<any>(null);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

    // Always-fresh references for callbacks and presenceData
    const callbackRef = useRef(onStructureChange);
    useEffect(() => { callbackRef.current = onStructureChange; }, [onStructureChange]);

    const presenceDataRef = useRef(presenceData);
    useEffect(() => { presenceDataRef.current = presenceData; });

    useEffect(() => {
        if (!enabled || !projectName) return;

        const setupRealtime = async () => {
            try {
                console.log('🔌 Setting up Ably realtime connection...');

                const response = await fetch(`${API_BASE_URL}/api/realtime/auth`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    console.error('❌ Failed to get Ably token:', response.status);
                    return;
                }

                const { data } = await response.json();
                const tokenRequest = data.tokenRequest;

                console.log('✅ Ably token received');

                const ably = new Realtime({
                    authCallback: (tokenParams, callback) => {
                        callback(null, tokenRequest);
                    },
                });

                ablyRef.current = ably;

                ably.connection.on('connected', () => {
                    console.log('✅ Ably connected!');
                    isConnectedRef.current = true;
                });
                ably.connection.on('failed', (stateChange) => {
                    console.error('❌ Ably connection failed:', stateChange.reason);
                });
                ably.connection.on('disconnected', () => {
                    console.log('🔌 Ably disconnected');
                    isConnectedRef.current = false;
                });

                const channel = ably.channels.get(`project:${projectName}`);
                channelRef.current = channel;

                channel.subscribe((message: any) => {
                    callbackRef.current(message.name, message.data);
                });
                console.log(`✅ Subscribed to channel: project:${projectName}`);

                // Presence management
                const presence = channel.presence;

                const updatePresence = async () => {
                    const members = await presence.get();

                    const mapped: ProjectMember[] = members
                        .filter((m: any) => m.data?.userId)
                        .map((m: any) => ({
                            clientId: m.clientId || '',
                            userId: m.data.userId,
                            userName: m.data.userName || 'Anonyme',
                            userColor: m.data.userColor || '#99334C',
                            granuleId: m.data.granuleId || '',
                            granuleName: m.data.granuleName || '',
                        }));

                    setProjectMembers(mapped);
                    onPresenceChange?.(members.length, members);
                };

                presence.subscribe('enter', updatePresence);
                presence.subscribe('leave', updatePresence);
                presence.subscribe('update', updatePresence);

                // Enter with current user data (or empty object if not yet available)
                await presence.enter(presenceDataRef.current || {});
                updatePresence();
            } catch (error) {
                console.error('❌ Error setting up realtime sync:', error);
            }
        };

        setupRealtime();

        return () => {
            console.log('🧹 Cleaning up Ably connection...');
            if (channelRef.current) {
                try { channelRef.current.unsubscribe(); } catch {}
            }
            if (ablyRef.current && isConnectedRef.current) {
                try { ablyRef.current.close(); } catch {}
            }
            channelRef.current = null;
            ablyRef.current = null;
            setProjectMembers([]);
        };
    }, [projectName, enabled]);

    // Update Ably presence when the user navigates to a different granule
    useEffect(() => {
        if (!channelRef.current || !presenceData?.userId) return;
        channelRef.current.presence.update(presenceData).catch(() => {});
    }, [
        presenceData?.userId,
        presenceData?.granuleId,
        presenceData?.granuleName,
        presenceData?.userName,
        presenceData?.userColor,
    ]);

    return { projectMembers };
}
