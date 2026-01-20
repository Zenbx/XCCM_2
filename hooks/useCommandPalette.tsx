import { create } from 'zustand';

export interface Command {
    id: string;
    label: string;
    category: 'navigation' | 'editor' | 'settings' | 'help';
    icon?: React.ReactNode;
    keywords: string[];
    action: () => void;
    shortcut?: string;
}

interface CommandPaletteStore {
    isOpen: boolean;
    commands: Command[];
    recentCommands: string[];
    open: () => void;
    close: () => void;
    toggle: () => void;
    registerCommand: (command: Command) => void;
    unregisterCommand: (id: string) => void;
    addToRecent: (commandId: string) => void;
}

export const useCommandPalette = create<CommandPaletteStore>((set, get) => ({
    isOpen: false,
    commands: [],
    recentCommands: [],

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),

    registerCommand: (command) =>
        set((state) => ({
            commands: [...state.commands.filter((c) => c.id !== command.id), command],
        })),

    unregisterCommand: (id) =>
        set((state) => ({
            commands: state.commands.filter((c) => c.id !== id),
        })),

    addToRecent: (commandId) =>
        set((state) => {
            const recent = [commandId, ...state.recentCommands.filter((id) => id !== commandId)].slice(0, 5);
            return { recentCommands: recent };
        }),
}));

// Fuzzy search helper
export function fuzzySearch(query: string, text: string): boolean {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
            queryIndex++;
        }
    }

    return queryIndex === queryLower.length;
}

// Filter commands based on search query
export function filterCommands(commands: Command[], query: string): Command[] {
    if (!query.trim()) return commands;

    return commands.filter((command) => {
        const searchText = `${command.label} ${command.keywords.join(' ')}`;
        return fuzzySearch(query, searchText);
    });
}
