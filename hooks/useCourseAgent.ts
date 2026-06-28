'use client';

import { useCallback, useRef, useState } from 'react';
import { authService } from '@/services/authService';
import {
  AIAction,
  AgentProgress,
  executeAllActions,
  normalizeStructurePayload,
} from '@/services/courseAgentExecutor';
import {
  buildStructurePreviewSteps,
  extractStructureParts,
  formatAgentLiveMessage,
} from '@/lib/agentUxHelpers';

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
  onAgentRunningChange?: (running: boolean) => void;
}

export interface RunFullAgentOptions {
  /** Met à jour le contenu de la bulle assistant en direct */
  onLiveMessage?: (content: string) => void;
}

export function useCourseAgent(options: UseCourseAgentOptions) {
  const { project, onStructureChanged, onContentChanged, onAgentRunningChange } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stepsRef = useRef<string[]>([]);

  const pushLiveStep = useCallback((
    line: string,
    onLiveMessage?: (content: string) => void,
    replaceLast = false
  ) => {
    if (replaceLast && stepsRef.current.length > 0) {
      stepsRef.current[stepsRef.current.length - 1] = line;
    } else {
      stepsRef.current.push(line);
    }
    const content = formatAgentLiveMessage(stepsRef.current);
    setProgress({ phase: 'planning', message: line, steps: [...stepsRef.current] });
    onLiveMessage?.(content);
  }, []);

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
    projectName: string,
    onLiveMessage?: (content: string) => void
  ) => {
    if (!actions.length) return { succeeded: 0, failed: 0, summaries: [] as string[] };

    setIsRunning(true);

    try {
      const result = await executeAllActions(
        actions,
        projectName,
        project,
        {
          onProgress: (p) => {
            setProgress(p);
            if (p.steps?.length) {
              stepsRef.current = p.steps;
              onLiveMessage?.(formatAgentLiveMessage(p.steps));
            } else if (p.message) {
              pushLiveStep(p.message, onLiveMessage);
            }
          },
          onContentChanged,
          signal: abortRef.current?.signal,
        }
      );

      onStructureChanged?.();
      return result;
    } finally {
      setIsRunning(false);
    }
  }, [project, onStructureChanged, onContentChanged, pushLiveStep]);

  const runFullAgent = useCallback(async (
    userPrompt: string,
    chatHistory: Array<{ role: string; content: string }>,
    context: AgentContext,
    agentOptions: RunFullAgentOptions = {}
  ) => {
    const { onLiveMessage } = agentOptions;
    abortRef.current = new AbortController();
    setIsRunning(true);
    onAgentRunningChange?.(true);
    stepsRef.current = [];

    pushLiveStep('⏳ Analyse de votre demande…', onLiveMessage);

    try {
      pushLiveStep('⏳ Génération de la structure avec Mistral (parties, chapitres, intros, contenus)…', onLiveMessage, true);

      const { text, plan, actions } = await runAgent(userPrompt, chatHistory, context, 'agent');

      pushLiveStep('✅ Réponse Mistral reçue', onLiveMessage);

      if (!actions.length) {
        pushLiveStep('⚠️ Aucune structure générée — précisez le sujet du cours', onLiveMessage);
        return { text, plan, actions, execution: null };
      }

      const structureAction = actions.find((a) => a.type === 'create_structure');
      if (structureAction) {
        const parts = extractStructureParts(structureAction.data as Record<string, unknown>);
        const previewSteps = buildStructurePreviewSteps(parts);
        for (const line of previewSteps) {
          pushLiveStep(line, onLiveMessage);
        }
      } else {
        const normalized = normalizeStructurePayload(
          actions[0]?.data as Record<string, unknown>
        );
        if (normalized.length) {
          for (const line of buildStructurePreviewSteps(normalized)) {
            pushLiveStep(line, onLiveMessage);
          }
        }
      }

      const projectName = context.projectName;
      if (!projectName) throw new Error('Aucun projet actif');

      pushLiveStep('⏳ Injection dans le projet…', onLiveMessage);

      const execution = await executeActions(actions, projectName, onLiveMessage);

      pushLiveStep(
        `✅ **Terminé** — ${execution.succeeded} action(s) réussie(s)${execution.failed ? `, ${execution.failed} échec(s)` : ''}`,
        onLiveMessage
      );

      return { text, plan, actions, execution };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { text: '', actions: [], execution: null, aborted: true };
      }
      const msg = error instanceof Error ? error.message : 'Erreur agent';
      pushLiveStep(`❌ ${msg}`, onLiveMessage);
      setProgress({ phase: 'error', message: msg });
      throw error;
    } finally {
      setIsRunning(false);
      onAgentRunningChange?.(false);
      abortRef.current = null;
    }
  }, [runAgent, executeActions, pushLiveStep, onAgentRunningChange]);

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
