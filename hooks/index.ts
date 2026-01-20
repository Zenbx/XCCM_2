// Hooks barrel export file

// Performance hooks
export { useDebounce, useDebouncedCallback, useDebouncedState } from './useDebounce';
export { useThrottle, useThrottledCallback, useThrottledState, useAnimationFrame } from './useThrottle';

// Keyboard shortcuts
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useGlobalKeyboardShortcuts } from './useGlobalKeyboardShortcuts';

// Synapse Sync Engine (Y.js / CRDT)
export { useSynapseSync, type SynapseSyncOptions, type SynapseSyncResult, type UserPresence } from './useSynapseSync';
export { useCollaborativeEditor, getCollaborationExtensionsConfig, type CollaborationUser, type CollaborationConfig } from './useCollaborativeEditor';

// Realtime & Optimistic updates
export { useRealtimeSync } from './useRealtimeSync';
export { useOptimisticUpdate } from './useOptimisticUpdate';
