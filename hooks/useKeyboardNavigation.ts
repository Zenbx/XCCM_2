import { useEffect, useCallback, useState, useRef } from 'react';

interface FlatItem {
    id: string;
    type: 'part' | 'chapter' | 'paragraph' | 'notion';
    depth: number;
    data: any;
}

interface UseKeyboardNavigationProps {
    items: FlatItem[];
    expandedItems: Record<string, boolean>;
    onSelect: (item: FlatItem) => void;
    onToggleExpand: (id: string) => void;
    onRename?: (item: FlatItem) => void;
    onDelete?: (item: FlatItem) => void;
    enabled?: boolean;
}

export function useKeyboardNavigation({
    items,
    expandedItems,
    onSelect,
    onToggleExpand,
    onRename,
    onDelete,
    enabled = true
}: UseKeyboardNavigationProps) {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [isTOCFocused, setIsTOCFocused] = useState(false);
    const tocRef = useRef<HTMLElement | null>(null);

    // Scroll to focused item
    const scrollToFocusedItem = useCallback((index: number) => {
        const element = document.querySelector(`[data-toc-index="${index}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    // Check if current item can be expanded
    const canExpand = useCallback((item: FlatItem) => {
        if (item.type === 'notion') return false;

        const hasChildren =
            (item.type === 'part' && item.data.chapters?.length > 0) ||
            (item.type === 'chapter' && item.data.paragraphs?.length > 0) ||
            (item.type === 'paragraph' && item.data.notions?.length > 0);

        return hasChildren;
    }, []);

    // Get expand key for item
    const getExpandKey = useCallback((item: FlatItem) => {
        return `${item.type}-${item.id}`;
    }, []);

    // Handle keyboard events
    useEffect(() => {
        if (!enabled || !isTOCFocused || items.length === 0) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const currentItem = items[focusedIndex];
            if (!currentItem) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = Math.min(focusedIndex + 1, items.length - 1);
                    setFocusedIndex(nextIndex);
                    scrollToFocusedItem(nextIndex);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = Math.max(focusedIndex - 1, 0);
                    setFocusedIndex(prevIndex);
                    scrollToFocusedItem(prevIndex);
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    const expandKey = getExpandKey(currentItem);
                    if (canExpand(currentItem) && !expandedItems[expandKey]) {
                        onToggleExpand(expandKey);
                    }
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    const collapseKey = getExpandKey(currentItem);
                    if (expandedItems[collapseKey]) {
                        onToggleExpand(collapseKey);
                    }
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (currentItem.type === 'notion' || currentItem.type === 'part') {
                        onSelect(currentItem);
                    } else {
                        // Toggle expand for non-editable items
                        const toggleKey = getExpandKey(currentItem);
                        if (canExpand(currentItem)) {
                            onToggleExpand(toggleKey);
                        }
                    }
                    break;

                case 'F2':
                    e.preventDefault();
                    if (onRename) {
                        onRename(currentItem);
                    }
                    break;

                case 'Delete':
                    e.preventDefault();
                    if (onDelete) {
                        onDelete(currentItem);
                    }
                    break;

                case 'Home':
                    e.preventDefault();
                    setFocusedIndex(0);
                    scrollToFocusedItem(0);
                    break;

                case 'End':
                    e.preventDefault();
                    const lastIndex = items.length - 1;
                    setFocusedIndex(lastIndex);
                    scrollToFocusedItem(lastIndex);
                    break;

                case 'Escape':
                    e.preventDefault();
                    // Blur TOC, focus returns to editor
                    if (tocRef.current) {
                        (tocRef.current as HTMLElement).blur();
                        setIsTOCFocused(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        enabled,
        isTOCFocused,
        focusedIndex,
        items,
        expandedItems,
        canExpand,
        getExpandKey,
        onSelect,
        onToggleExpand,
        onRename,
        onDelete,
        scrollToFocusedItem
    ]);

    // Focus management
    const handleTOCFocus = useCallback(() => {
        setIsTOCFocused(true);
    }, []);

    const handleTOCBlur = useCallback((e: React.FocusEvent) => {
        // Only blur if focus is moving outside TOC
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsTOCFocused(false);
        }
    }, []);

    return {
        focusedIndex,
        setFocusedIndex,
        isTOCFocused,
        tocRef,
        handleTOCFocus,
        handleTOCBlur,
        scrollToFocusedItem
    };
}
