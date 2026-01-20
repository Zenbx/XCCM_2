import { useEffect, useCallback, useRef } from 'react';

type ModifierKey = 'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta';
type KeyCombo = string; // e.g., "cmd+k", "ctrl+shift+s", "esc"

interface ShortcutHandler {
    (): void;
}

interface ShortcutConfig {
    handler: ShortcutHandler;
    enabled?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    description?: string;
}

type ShortcutMap = Record<KeyCombo, ShortcutHandler | ShortcutConfig>;

interface UseKeyboardShortcutsOptions {
    enabled?: boolean;
    target?: 'window' | 'document' | React.RefObject<HTMLElement>;
    ignoreInputs?: boolean; // Ignore shortcuts when focused on inputs
    ignoreContentEditable?: boolean;
}

/**
 * Parse a key combo string into its parts
 * Examples: "cmd+k" -> { modifiers: ['cmd'], key: 'k' }
 *           "ctrl+shift+s" -> { modifiers: ['ctrl', 'shift'], key: 's' }
 */
function parseKeyCombo(combo: string): { modifiers: ModifierKey[]; key: string } {
    const parts = combo.toLowerCase().split('+');
    const key = parts.pop() || '';
    const modifiers = parts as ModifierKey[];
    return { modifiers, key };
}

/**
 * Check if the keyboard event matches the key combo
 */
function matchesKeyCombo(
    event: KeyboardEvent,
    combo: { modifiers: ModifierKey[]; key: string }
): boolean {
    const { modifiers, key } = combo;

    // Check the main key
    const eventKey = event.key.toLowerCase();
    const eventCode = event.code.toLowerCase();

    // Handle special keys
    const keyMatches =
        eventKey === key ||
        eventCode === key ||
        (key === 'esc' && eventKey === 'escape') ||
        (key === 'space' && eventKey === ' ') ||
        (key === 'enter' && eventKey === 'enter') ||
        (key === 'tab' && eventKey === 'tab') ||
        (key === 'backspace' && eventKey === 'backspace') ||
        (key === 'delete' && eventKey === 'delete') ||
        (key === 'up' && eventKey === 'arrowup') ||
        (key === 'down' && eventKey === 'arrowdown') ||
        (key === 'left' && eventKey === 'arrowleft') ||
        (key === 'right' && eventKey === 'arrowright');

    if (!keyMatches) return false;

    // Check modifiers - handle cmd/ctrl platform differences
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    const hasCtrl = modifiers.includes('ctrl');
    const hasCmd = modifiers.includes('cmd');
    const hasAlt = modifiers.includes('alt');
    const hasShift = modifiers.includes('shift');
    const hasMeta = modifiers.includes('meta');

    // cmd maps to metaKey on Mac, ctrlKey on Windows/Linux
    const cmdPressed = hasCmd && (isMac ? event.metaKey : event.ctrlKey);
    const ctrlPressed = hasCtrl && event.ctrlKey;
    const altPressed = hasAlt && event.altKey;
    const shiftPressed = hasShift && event.shiftKey;
    const metaPressed = hasMeta && event.metaKey;

    // All required modifiers must be pressed
    const requiredModifiersPressed =
        (!hasCmd || cmdPressed) &&
        (!hasCtrl || ctrlPressed) &&
        (!hasAlt || altPressed) &&
        (!hasShift || shiftPressed) &&
        (!hasMeta || metaPressed);

    // No extra modifiers should be pressed (except for platform differences)
    const noExtraModifiers =
        (event.ctrlKey === (hasCtrl || (hasCmd && !isMac))) &&
        (event.metaKey === (hasMeta || (hasCmd && isMac))) &&
        (event.altKey === hasAlt) &&
        (event.shiftKey === hasShift);

    return requiredModifiersPressed && noExtraModifiers;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(element: EventTarget | null): boolean {
    if (!element || !(element instanceof HTMLElement)) return false;

    const tagName = element.tagName.toLowerCase();
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        element.isContentEditable
    );
}

/**
 * useKeyboardShortcuts - Centralized keyboard shortcut management
 *
 * @param shortcuts - Map of key combos to handlers
 * @param options - Configuration options
 *
 * @example
 * useKeyboardShortcuts({
 *   'cmd+k': openCommandPalette,
 *   'cmd+s': () => saveDocument(),
 *   'esc': closeModals,
 *   'ctrl+shift+p': {
 *     handler: () => togglePreview(),
 *     description: 'Toggle preview mode',
 *     preventDefault: true,
 *   },
 * });
 */
export function useKeyboardShortcuts(
    shortcuts: ShortcutMap,
    options: UseKeyboardShortcutsOptions = {}
): void {
    const {
        enabled = true,
        target = 'window',
        ignoreInputs = true,
        ignoreContentEditable = true,
    } = options;

    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Check if we should ignore this event
            if (ignoreInputs && isInputElement(event.target)) {
                // Still allow certain shortcuts in inputs (like cmd+s for save)
                const allowedInInputs = ['cmd+s', 'ctrl+s', 'esc'];
                const currentCombo = Object.keys(shortcutsRef.current).find((combo) => {
                    const parsed = parseKeyCombo(combo);
                    return matchesKeyCombo(event, parsed);
                });

                if (!currentCombo || !allowedInInputs.some((allowed) =>
                    currentCombo.toLowerCase().includes(allowed.replace('cmd', 'ctrl'))
                )) {
                    return;
                }
            }

            // Find matching shortcut
            for (const [combo, configOrHandler] of Object.entries(shortcutsRef.current)) {
                const parsed = parseKeyCombo(combo);

                if (matchesKeyCombo(event, parsed)) {
                    const config: ShortcutConfig =
                        typeof configOrHandler === 'function'
                            ? { handler: configOrHandler }
                            : configOrHandler;

                    if (config.enabled === false) continue;

                    if (config.preventDefault !== false) {
                        event.preventDefault();
                    }

                    if (config.stopPropagation) {
                        event.stopPropagation();
                    }

                    config.handler();
                    break;
                }
            }
        },
        [enabled, ignoreInputs, ignoreContentEditable]
    );

    useEffect(() => {
        if (!enabled) return;

        let targetElement: Window | Document | HTMLElement | null = null;

        if (target === 'window') {
            targetElement = window;
        } else if (target === 'document') {
            targetElement = document;
        } else if (target && 'current' in target) {
            targetElement = target.current;
        }

        if (!targetElement) return;

        targetElement.addEventListener('keydown', handleKeyDown as EventListener);

        return () => {
            targetElement?.removeEventListener('keydown', handleKeyDown as EventListener);
        };
    }, [enabled, target, handleKeyDown]);
}

/**
 * Helper to get a human-readable shortcut string
 */
export function formatShortcut(combo: string): string {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return combo
        .split('+')
        .map((part) => {
            switch (part.toLowerCase()) {
                case 'cmd':
                    return isMac ? '⌘' : 'Ctrl';
                case 'ctrl':
                    return isMac ? '⌃' : 'Ctrl';
                case 'alt':
                    return isMac ? '⌥' : 'Alt';
                case 'shift':
                    return isMac ? '⇧' : 'Shift';
                case 'meta':
                    return isMac ? '⌘' : 'Win';
                case 'esc':
                    return 'Esc';
                case 'enter':
                    return '↵';
                case 'backspace':
                    return '⌫';
                case 'delete':
                    return 'Del';
                case 'up':
                    return '↑';
                case 'down':
                    return '↓';
                case 'left':
                    return '←';
                case 'right':
                    return '→';
                case 'space':
                    return 'Space';
                default:
                    return part.toUpperCase();
            }
        })
        .join(isMac ? '' : '+');
}

/**
 * ShortcutDisplay component helper
 */
export function getShortcutParts(combo: string): string[] {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return combo.split('+').map((part) => {
        switch (part.toLowerCase()) {
            case 'cmd':
                return isMac ? '⌘' : 'Ctrl';
            case 'ctrl':
                return isMac ? '⌃' : 'Ctrl';
            case 'alt':
                return isMac ? '⌥' : 'Alt';
            case 'shift':
                return isMac ? '⇧' : 'Shift';
            case 'esc':
                return 'Esc';
            default:
                return part.toUpperCase();
        }
    });
}

export default useKeyboardShortcuts;
