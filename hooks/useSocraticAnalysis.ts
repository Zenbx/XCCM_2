import { useState, useCallback, useRef, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { socraticService, AuditContext } from '@/services/socraticService';

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
    // Audit fields
    clarityScore?: number;
    engagementScore?: number;
    bloomLevel?: string;
    suggestions?: string[];
    recommendedBlocks?: string[];
    improvedContent?: string;
    suggestedGranules?: import('@/services/socraticService').SuggestedGranule[];
}

export function useSocraticAnalysis(notionId?: string | null) {
    const [feedback, setFeedback] = useState<PedagogicalFeedback[]>([]);
    const [bloomScore, setBloomScore] = useState<BloomScore | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    // Ref instead of state so tracking last-analyzed text doesn't recreate the callback
    const lastAnalyzedTextRef = useRef<string>('');

    const analyzeContent = useCallback(
        async (text: string, context?: AuditContext, force = false) => {
            if (!text || text.length < 50) {
                setFeedback([]);
                setBloomScore(null);
                return;
            }

            if (!force && text === lastAnalyzedTextRef.current) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsAnalyzing(true);

            try {
                const result = await socraticService.auditContent(text, context);

                if (result) {
                    const mappedFeedback: PedagogicalFeedback[] = result.suggestions.map((s, i) => ({
                        id: `sug-${i}-${Date.now()}`,
                        sentenceStart: 0,
                        sentenceEnd: 0,
                        text: text.substring(0, 10) + '...',
                        highlightColor: 'yellow',
                        severity: 'info',
                        category: 'Socratic',
                        comment: s,
                        suggestions: []
                    }));

                    setFeedback(mappedFeedback);
                    setBloomScore({
                        remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0,
                        dominant: result.bloomLevel,
                        recommendation: result.suggestions?.[0] || '',
                        // Extended audit fields
                        clarityScore: result.clarityScore,
                        engagementScore: result.engagementScore,
                        bloomLevel: result.bloomLevel,
                        suggestions: result.suggestions,
                        recommendedBlocks: result.recommendedBlocks,
                        improvedContent: result.improvedContent,
                        suggestedGranules: result.suggestedGranules,
                    });
                    lastAnalyzedTextRef.current = text;
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Analysis error:", error);
                }
            } finally {
                setIsAnalyzing(false);
            }
        },
        [notionId]
    );

    // useMemo so the debounce timer instance is only recreated when notionId changes.
    // analyzeContent is stable (only depends on notionId), so the ref capture is safe.
    const analyzeContentRef = useRef(analyzeContent);
    analyzeContentRef.current = analyzeContent;

    const analyzeDebounced = useMemo(
        () => debounce((text: string) => analyzeContentRef.current(text), 2500),
        [notionId] // recreate only when switching notions
    );

    return {
        feedback,
        bloomScore,
        isAnalyzing,
        analyzeContent,
        analyzeDebounced,
        setFeedback
    };
}
