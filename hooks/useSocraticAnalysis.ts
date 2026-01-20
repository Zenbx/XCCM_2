import { useState, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce'; // Load optimized version
import toast from 'react-hot-toast';
import { socraticService } from '@/services/socraticService';

export interface PedagogicalFeedback {
    id: string;
    sentenceStart: number;
    sentenceEnd: number;
    text: string;
    highlightColor: 'yellow' | 'orange' | 'red';
    severity: 'info' | 'warning' | 'error';
    category: string;
    comment: string;
    suggestions: string[];
}

export interface BloomScore {
    remember: number;
    understand: number;
    apply: number;
    analyze: number;
    evaluate: number;
    create: number;
    dominant: string;
    recommendation: string;
}

export function useSocraticAnalysis(notionId?: string | null) {
    const [feedback, setFeedback] = useState<PedagogicalFeedback[]>([]);
    const [bloomScore, setBloomScore] = useState<BloomScore | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalyzedText, setLastAnalyzedText] = useState<string>('');

    const abortControllerRef = useRef<AbortController | null>(null);

    const analyzeContent = useCallback(
        async (text: string, force = false) => {
            // Avoid analyzing empty or too short text
            if (!text || text.length < 50) {
                setFeedback([]);
                setBloomScore(null);
                return;
            }

            // Avoid re-analyzing same text unless forced
            if (!force && text === lastAnalyzedText) return;

            // Cancel previous request if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsAnalyzing(true);

            let analysisResult;
            try {
                // Use the centralized service that points to the correct backend Port (3001)
                const result = await socraticService.auditContent(text);

                // Map the new service result format to the hook's expected format
                if (result) {
                    // Create a dummy feedback for now if service returns different structure
                    // Ideally we should align types, but for now let's make it work without 404
                    const mappedFeedback: PedagogicalFeedback[] = result.suggestions.map((s, i) => ({
                        id: `sug-${i}-${Date.now()}`,
                        sentenceStart: 0,
                        sentenceEnd: 0,
                        text: text.substring(0, 10) + '...', // Dummy range
                        highlightColor: 'yellow',
                        severity: 'info',
                        category: 'Socratic',
                        comment: s,
                        suggestions: []
                    }));

                    setFeedback(mappedFeedback);
                    setBloomScore({
                        remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0, // Mock scores
                        dominant: result.bloomLevel,
                        recommendation: result.suggestions[0] || ''
                    });
                    setLastAnalyzedText(text);
                }

            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Analysis error:", error);
                }
            } finally {
                setIsAnalyzing(false);
            }
        },
        [notionId, lastAnalyzedText]
    );

    // Debounced version for auto-analysis while typing
    const analyzeDebounced = useCallback(
        debounce((text: string) => {
            analyzeContent(text);
        }, 2500), // 2.5s delay after typing stops
        [analyzeContent]
    );

    return {
        feedback,
        bloomScore,
        isAnalyzing,
        analyzeContent,        // Direct call
        analyzeDebounced,      // Auto call
        setFeedback            // Allow manual updates (e.g. removing fixed items)
    };
}
