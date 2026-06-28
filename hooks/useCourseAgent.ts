'use client';

import { useCallback, useRef, useState } from 'react';
import { authService } from '@/services/authService';
import {
  AIAction,
  AgentProgress,
  executeAllActions,
} from '@/services/courseAgentExecutor';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export type PanelMode = 'chat' | 'agent';

export interface AgentContext {
  projectName?: string;
  partTitle?: string;
  chapterTitle?: string;
  paraName?: string;
  notionName?: string;
  notionContent?: string;
}

export interface UseCourseAgentOptions {
  project?: { pr_id?: string };
  onStructureChanged?: () => void;
  onContentChanged?: (content: string) => void;
}

export function useCourseAgent(options: UseCourseAgentOptions) {
  const { project, onStructureChanged, onContentChanged } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsRunning(false);
    setProgress({ phase: 'error', message: 'Agent interrompu' });
  }, []);

  const runAgent = useCallback(async (
    userPrompt: string,
    chatHistory: Array<{ role: string; content: string }>,
    context: AgentContext,
    mode: PanelMode
  ): Promise<{ text: string; plan?: string; actions: AIAction[] }> => {
    const endpoint = mode === 'agent'
      ? `${API_BASE_URL}/api/ai/agent`
      : `${API_BASE_URL}/api/ai/editor`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authService.getAuthToken() || ''}`,
      },
      body: JSON.stringify({
        messages: [...chatHistory, { role: 'user', content: userPrompt }],
        context,
      }),
      signal: abortRef.current?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
      if (response.status === 504) {
        throw new Error(
          errorData.error
            || 'Délai dépassé (504). La génération Mistral est trop longue — essayez une structure plus petite.'
        );
      }
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      plan: data.plan,
      actions: (data.actions || []).map((a: AIAction) => ({ ...a, status: 'pending' as const })),
    };
  }, []);

  const executeActions = useCallback(async (
    actions: AIAction[],
    projectName: string
  ) => {
    if (!actions.length) return { succeeded: 0, failed: 0, summaries: [] as string[] };

    setIsRunning(true);
    setProgress({ phase: 'structure', message: 'Exécution des actions…' });

    try {
      const result = await executeAllActions(
        actions,
        projectName,
        project,
        {
          onProgress: setProgress,
          onContentChanged,
          signal: abortRef.current?.signal,
        }
      );

      onStructureChanged?.();
      return result;
    } finally {
      setIsRunning(false);
    }
  }, [project, onStructureChanged, onContentChanged]);

  const runFullAgent = useCallback(async (
    userPrompt: string,
    chatHistory: Array<{ role: string; content: string }>,
    context: AgentContext
  ) => {
    abortRef.current = new AbortController();
    setIsRunning(true);
    setProgress({ phase: 'planning', message: 'Planification du cours…' });

    try {
      const { text, plan, actions } = await runAgent(userPrompt, chatHistory, context, 'agent');

      if (!actions.length) {
        setProgress({ phase: 'done', message: 'Aucune action à exécuter' });
        return { text, plan, actions, execution: null };
      }

      const projectName = context.projectName;
      if (!projectName) throw new Error('Aucun projet actif');

      const execution = await executeActions(actions, projectName);
      return { text, plan, actions, execution };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { text: '', actions: [], execution: null, aborted: true };
      }
      setProgress({
        phase: 'error',
        message: error instanceof Error ? error.message : 'Erreur agent',
      });
      throw error;
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [runAgent, executeActions]);

  return {
    isRunning,
    progress,
    stop,
    runAgent,
    executeActions,
    runFullAgent,
    startAbortController: () => {
      abortRef.current = new AbortController();
      return abortRef.current;
    },
  };
}
