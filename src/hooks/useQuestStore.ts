import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'arc_raiders_quest_progress';
const EVENT_KEY = 'quest-local-update';

export function useQuestStore() {
    // Always initialize with empty Set to avoid SSR hydration mismatch
    const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set());

    // Load from localStorage after hydration
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setCompletedQuestIds(new Set(JSON.parse(stored)));
                }
            } catch (e) {
                console.error("Failed to load quest progress", e);
            }
        }
    }, []); // Run once on mount

    // Helper to persist to localStorage and dispatch event
    const persist = (newSet: Set<string>) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)));
            window.dispatchEvent(new Event(EVENT_KEY));
        } catch (e) {
            console.error("Failed to save quest progress", e);
        }
    };

    // Toggle a quest completion status
    const toggleQuest = useCallback((questId: string) => {
        setCompletedQuestIds(prev => {
            const next = new Set(prev);
            if (next.has(questId)) {
                next.delete(questId);
            } else {
                next.add(questId);
            }
            persist(next);
            return next;
        });
    }, []);

    useEffect(() => {
        // Sync with other components on the same page
        const handleLocalUpdate = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCompletedQuestIds(new Set(JSON.parse(stored)));
            }
        };

        // Sync with other tabs
        const handleStorageUpdate = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setCompletedQuestIds(new Set(JSON.parse(e.newValue)));
            }
        };

        window.addEventListener(EVENT_KEY, handleLocalUpdate);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(EVENT_KEY, handleLocalUpdate);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    return {
        completedQuestIds,
        toggleQuest,
        isCompleted: (id: string) => completedQuestIds.has(id)
    };
}
