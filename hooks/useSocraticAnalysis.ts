import { useState, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce'; // Load optimized version
import toast from 'react-hot-toast';

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

            try {
                const response = await fetch('/api/ai/analyze-pedagogical', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, notionId }),
                    signal: abortControllerRef.current.signal
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Erreur AI (${response.status})`);
                }

                const result = await response.json();

                if (result.success) {
                    setFeedback(result.data.feedback || []);
                    setBloomScore(result.data.bloomScore || null);
                    setLastAnalyzedText(text);
                }

            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Analysis error:", error);
                    // Optional: toast.error("Erreur analyse AI");
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
