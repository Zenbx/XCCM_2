"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  MessageSquare,
  Brain,
  RefreshCw,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Loader2,
  CheckCircle,
  X,
  Copy,
  Check,
  Square,
  Zap,
  ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { socraticService } from '@/services/socraticService';
import { authService } from '@/services/authService';
import { executeAIAction, type AIAction } from '@/services/courseAgentExecutor';
import { useCourseAgent, type PanelMode } from '@/hooks/useCourseAgent';
import toast from 'react-hot-toast';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

interface UnifiedAIPanelProps {
  currentContext: {
    projectName: string;
    partTitle: string;
    chapterTitle: string;
    paraName: string;
    notionName: string;
    notion?: any;
    type?: string;
  } | null;
  editorContent: string;
  socraticData: {
    feedback: any[];
    bloomScore: any;
    isAnalyzing: boolean;
    analyzeContent: (content: string, context?: any) => Promise<void>;
    onDismissFeedback: (id: string) => void;
  };
  onStructureChanged?: () => void; // Callback pour rafraîchir la structure après action IA
  onContentChanged?: (content: string) => void; // Callback pour mettre à jour le contenu éditeur
  project?: any;
  /** Nom du projet (URL) — disponible même sans granule sélectionné */
  authorProjectName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AIAction[];
  plan?: string;
  isActionExecuted?: boolean;
}

const UnifiedAIPanel: React.FC<UnifiedAIPanelProps> = ({
  currentContext,
  editorContent,
  socraticData,
  onStructureChanged,
  onContentChanged,
  project,
  authorProjectName,
}) => {
  const { isAuthenticated } = useAuth();

  // Projet résolu : URL > projectData > granule sélectionné
  const resolvedProjectName =
    authorProjectName ||
    project?.pr_name ||
    currentContext?.projectName ||
    '';

  // Panneau monté uniquement dans l'éditeur auteur → toujours mode auteur si projet ou session
  const isAuthorMode =
    !!resolvedProjectName ||
    isAuthenticated ||
    !!authService.getAuthToken();
  const [activeTab, setActiveTab] = useState<'chat' | 'audit'>('chat');
  const [panelMode, setPanelMode] = useState<PanelMode>('chat');
  const [showScores, setShowScores] = useState(true);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const {
    isRunning: isAgentRunning,
    progress: agentProgress,
    stop: stopAgent,
    runFullAgent,
    startAbortController,
  } = useCourseAgent({
    project,
    onStructureChanged,
    onContentChanged,
  });

  // ═══════ MANUAL CHAT STATE ═══════
  const authorWelcome =
    "Bonjour ! Je suis votre assistant IA XCCM. **Mode Chat** : je propose des actions à valider. **Mode Agent** : je construis le cours automatiquement. Essayez : *« Construis un cours complet sur… »*";
  const studentWelcome =
    "Bonjour ! Je suis votre coach pédagogique XCCM. Je vous accompagne dans votre apprentissage via une approche socratique. Que souhaitez-vous approfondir aujourd'hui ?";

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: authorWelcome,
  }]);

  // Met à jour le message d'accueil si le mode auteur devient actif (ex. chargement projet)
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome'
        ? { ...m, content: isAuthorMode ? authorWelcome : studentWelcome }
        : m
    ));
  }, [isAuthorMode]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // ═══════ STOP GENERATION ═══════
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopAgent();
    setIsStreaming(false);
    toast.success('Génération arrêtée');
  }, [stopAgent]);

  // ═══════ COPY MESSAGE ═══════
  const handleCopy = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  }, []);

  // ═══════ CHAT / AGENT ═══════
  const sendChatMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isStreaming || isAgentRunning) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    const isEditorMode = true; // UnifiedAIPanel = éditeur auteur uniquement (jamais tuteur étudiant)
    const useAgent = panelMode === 'agent' && !!resolvedProjectName;

    const chatHistory = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role,
      content: m.content,
    }));

    const context = {
      notionContent: editorContent,
      partTitle: currentContext?.partTitle,
      chapterTitle: currentContext?.chapterTitle,
      paraName: currentContext?.paraName,
      notionName: currentContext?.notionName,
      projectName: resolvedProjectName || currentContext?.projectName,
    };

    try {
      abortControllerRef.current = startAbortController();

      if (useAgent) {
        const result = await runFullAgent(userText.trim(), chatHistory, context);

        if (result.aborted) return;

        const execSummary = result.execution
          ? `\n\n${result.execution.failed ? '⚠️' : '✅'} **Agent terminé** — ${result.execution.succeeded} action(s) réussie(s)${result.execution.failed ? `, ${result.execution.failed} échec(s)` : ''}.${result.execution.summaries?.length ? `\n${result.execution.summaries.map(s => `• ${s}`).join('\n')}` : ''}`
          : (result.actions.length === 0
            ? '\n\n⚠️ Plan généré mais aucune action exécutable. Réessayez avec « Construis le cours complet ».'
            : '');

        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: (result.text || result.plan || 'Plan exécuté.') + execSummary,
                plan: result.plan,
                actions: result.actions.map((a, i) => ({
                  ...a,
                  status: result.execution && i < result.execution.succeeded ? 'done' as const : result.execution?.failed ? 'error' as const : 'done' as const,
                })),
                isActionExecuted: true,
              }
            : m
        ));

        if (result.execution?.succeeded) {
          toast.success(`Cours construit : ${result.execution.succeeded} action(s)`);
        } else if (result.execution?.failed) {
          toast.error(result.execution.summaries?.find(s => s.includes('Erreur') || s.includes('Impossible')) || 'Échec de construction du cours');
        }
        return;
      }

      const endpoint = isEditorMode
        ? `${API_BASE_URL}/api/ai/editor`
        : `${API_BASE_URL}/api/ai/socratic`;

      const body: Record<string, unknown> = {
        messages: [...chatHistory, { role: 'user', content: userText.trim() }],
        context,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAuthToken() || ''}`,
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        const aiContent = data.text || data.message || '';
        const actions: AIAction[] = data.actions || [];

        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: aiContent, actions: actions.length > 0 ? actions : undefined }
            : m
        ));
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setMessages(prev => prev.map(m =>
            m.id === assistantMessage.id ? { ...m, content: fullText } : m
          ));
        }
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m =>
        m.id === assistantMessage.id
          ? { ...m, content: `❌ Erreur : ${msg}. Vérifiez que le serveur est bien démarré.` }
          : m
      ));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, isStreaming, isAgentRunning, isAuthorMode, resolvedProjectName, currentContext, editorContent, panelMode, runFullAgent, startAbortController]);

  // ═══════ EXECUTE AI ACTIONS (mode Chat — manuel) ═══════
  const executeAction = useCallback(async (messageId: string, actionIndex: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId || !m.actions) return m;
      const newActions = [...m.actions];
      newActions[actionIndex] = { ...newActions[actionIndex], status: 'executing' };
      return { ...m, actions: newActions };
    }));

    try {
      const msg = messages.find(m => m.id === messageId);
      if (!msg?.actions) return;
      const action = msg.actions[actionIndex];
      const projectName = resolvedProjectName || currentContext?.projectName;
      if (!projectName) throw new Error('Aucun projet actif');

      await executeAIAction(action, projectName, project, { onContentChanged });
      onStructureChanged?.();

      setMessages(prev => prev.map(m => {
        if (m.id !== messageId || !m.actions) return m;
        const newActions = [...m.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], status: 'done' };
        return { ...m, actions: newActions, isActionExecuted: true };
      }));
      toast.success('Action exécutée');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Erreur';
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId || !m.actions) return m;
        const newActions = [...m.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], status: 'error', error: errMsg };
        return { ...m, actions: newActions };
      }));
      toast.error(errMsg);
    }
  }, [messages, resolvedProjectName, currentContext, onStructureChanged, onContentChanged, project]);

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim() || isStreaming || isAgentRunning) return;
    const currentInput = input;
    setInput('');
    await sendChatMessage(currentInput);
  };

  const handleSendRequest = (customInput: string) => {
    sendChatMessage(customInput);
  };

  const handleAudit = async () => {
    if (!editorContent) {
      toast.error("Le contenu est vide !");
      return;
    }
    setActiveTab('audit');
    const context = currentContext ? {
      projectName: currentContext.projectName,
      partTitle: currentContext.partTitle,
      chapterTitle: currentContext.chapterTitle,
      paraName: currentContext.paraName,
      notionName: currentContext.notionName,
    } : undefined;
    await socraticData.analyzeContent(editorContent, context);

    setMessages(prev => [...prev, {
      id: `audit-${Date.now()}`,
      role: 'assistant',
      content: "J'ai terminé l'analyse. Consultez l'onglet **Audit** pour voir les scores, la version améliorée et les granules suggérés."
    }]);
  };

  // ═══════ ACTION BUTTON RENDERER ═══════
  const ActionButton = ({ action, messageId, index }: { action: AIAction; messageId: string; index: number }) => {
    const labels: Record<string, string> = {
      create_structure: '🏗️ Créer la structure',
      write_content: '✍️ Écrire le contenu',
      create_exercise: '📝 Créer l\'exercice',
      suggest_improvements: '💡 Appliquer les suggestions',
    };

    if (action.status === 'done') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Exécuté
        </div>
      );
    }
    if (action.status === 'error') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
          <X className="w-3.5 h-3.5" /> {action.error || 'Erreur'}
        </div>
      );
    }
    if (action.status === 'executing') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Exécution...
        </div>
      );
    }

    return (
      <button
        onClick={() => executeAction(messageId, index)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#99334C]/10 text-[#99334C] hover:bg-[#99334C] hover:text-white rounded-lg text-xs font-bold transition-all active:scale-95"
      >
        <Wand2 className="w-3.5 h-3.5" />
        {labels[action.type] || 'Exécuter'}
      </button>
    );
  };

  const ScoreCard = ({ label, score, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{score}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color.replace('/10', '')}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  // ═══════ RENDER MARKDOWN-LIKE CONTENT ═══════
  const renderContent = (content: string) => {
    if (!content) return null;
    // Simple markdown: bold, italic, code
    const html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-950/50">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl mx-4 mt-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat'
              ? 'bg-white dark:bg-gray-700 text-[#99334C] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <MessageSquare size={16} />
          Chat {isAuthorMode && '+ IA'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit'
              ? 'bg-white dark:bg-gray-700 text-[#99334C] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Brain size={16} />
          Audit
        </button>
      </div>

      {/* Mode Chat / Agent (auteurs uniquement) */}
      {isAuthorMode && activeTab === 'chat' && (
        <div className="flex gap-1 mx-4 mt-2 p-0.5 bg-gray-100 dark:bg-gray-800/80 rounded-lg">
          <button
            type="button"
            onClick={() => setPanelMode('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              panelMode === 'chat'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={14} />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setPanelMode('agent')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              panelMode === 'agent'
                ? 'bg-[#99334C] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap size={14} />
            Agent
          </button>
        </div>
      )}

      {/* Progression Agent */}
      {isAgentRunning && agentProgress && (
        <div className="mx-4 mt-2 p-3 bg-[#99334C]/5 border border-[#99334C]/20 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#99334C]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {agentProgress.message}
            {agentProgress.current != null && agentProgress.total != null && (
              <span className="text-gray-400">({agentProgress.current}/{agentProgress.total})</span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col h-full p-4"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-[#99334C] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      {msg.role === 'assistant' ? <Bot size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className="max-w-[85%] space-y-2">
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed relative group ${msg.role === 'user'
                          ? 'bg-[#99334C] text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-tl-none text-gray-800 dark:text-gray-200'
                        }`}>
                        {renderContent(msg.content)}
                        {/* Copy button */}
                        {msg.role === 'assistant' && msg.content && msg.id !== 'welcome' && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-gray-100/80 dark:bg-gray-700/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                            title="Copier"
                          >
                            {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                      {/* Actions manuelles (mode Chat) */}
                      {panelMode === 'chat' && msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.actions.map((action, i) => (
                            <ActionButton key={i} action={action} messageId={msg.id} index={i} />
                          ))}
                        </div>
                      )}
                      {/* Badge actions exécutées (mode Agent) */}
                      {panelMode === 'agent' && msg.actions && msg.actions.length > 0 && msg.isActionExecuted && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                          <ListChecks className="w-3.5 h-3.5" />
                          {msg.actions.length} action(s) exécutée(s) par l&apos;agent
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#99334C] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {isAuthorMode ? (
                  <>
                    {panelMode === 'agent' && (
                      <button
                        onClick={() => handleSendRequest("Construis un cours complet sur le sujet du projet : 2 à 3 parties, contenu pédagogique dans chaque notion, et 1 QCM par chapitre")}
                        className="text-[10px] px-2 py-1 bg-[#99334C]/10 border border-[#99334C]/30 text-[#99334C] rounded-full hover:bg-[#99334C] hover:text-white transition-colors font-bold"
                      >
                        🤖 Construire le cours
                      </button>
                    )}
                    {panelMode === 'chat' && (
                      <button
                        onClick={() => handleSendRequest("Crée une structure de cours complète sur le sujet de la notion actuelle")}
                        className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                      >
                        🏗️ Créer structure
                      </button>
                    )}
                    <button
                      onClick={() => handleSendRequest("Génère un QCM de 4 questions sur cette notion")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ❓ Créer QCM
                    </button>
                    <button
                      onClick={() => handleSendRequest("Écris le contenu pédagogique pour cette notion")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ✍️ Écrire contenu
                    </button>
                    <button
                      onClick={() => handleSendRequest("Peux-tu optimiser la clarté de ce paragraphe ?")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ✨ Optimiser
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleSendRequest("Peux-tu simplifier ce texte ?")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ✨ Simplifier
                    </button>
                    <button
                      onClick={() => handleSendRequest("Explique-moi ce concept étape par étape")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      📝 Expliquer
                    </button>
                  </>
                )}
                <button
                  onClick={handleAudit}
                  className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                >
                  🔍 Auditer
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="mt-4 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAuthorMode
                    ? (panelMode === 'agent'
                      ? "Décrivez le cours à construire (l'agent exécutera automatiquement)…"
                      : "Demandez à l'IA de créer, écrire, générer…")
                    : "Posez une question à l'IA…"}
                  className="w-full pl-4 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C] outline-none text-sm transition-all shadow-sm"
                  disabled={isStreaming || isAgentRunning}
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  {isStreaming || isAgentRunning ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Arrêter la génération"
                    >
                      <Square size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-1.5 bg-[#99334C] text-white rounded-lg hover:bg-[#802a3f] transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="audit"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#99334C]" />
                  Scores Pédagogiques
                </h4>
                <button
                  onClick={() => setShowScores(!showScores)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showScores ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showScores && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <ScoreCard
                    label="Clarté"
                    score={socraticData.bloomScore?.clarityScore || 0}
                    icon={Sparkles}
                    color="bg-blue-500"
                  />
                  <ScoreCard
                    label="Engagement"
                    score={socraticData.bloomScore?.engagementScore || 0}
                    icon={Lightbulb}
                    color="bg-amber-500"
                  />
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Bloom :</span>
                    <span className="text-sm font-bold text-[#99334C]">{socraticData.bloomScore?.bloomLevel || '—'}</span>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-[#99334C]" />
                Suggestions de l&apos;IA
              </h4>

              <div className="space-y-3">
                {socraticData.bloomScore?.suggestions?.map((s: string, idx: number) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-amber-400 shadow-sm text-xs italic text-gray-600 leading-relaxed">
                    &quot;{s}&quot;
                  </div>
                ))}

                {(!socraticData.bloomScore?.suggestions || socraticData.bloomScore.suggestions.length === 0) && (
                  <div className="text-center py-8 opacity-40">
                    <RefreshCw size={32} className="mx-auto mb-2 animate-spin-slow" />
                    <p className="text-xs">Lancez un audit pour voir les suggestions.</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#99334C]" />
                  Blocs recommandés
                </h4>
                <div className="flex flex-wrap gap-2">
                  {socraticData.bloomScore?.recommendedBlocks?.map((b: string) => (
                    <span key={b} className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Version améliorée ── */}
              {socraticData.bloomScore?.improvedContent && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Wand2 size={16} className="text-[#99334C]" />
                    Version améliorée
                  </h4>
                  <div
                    className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 max-h-48 overflow-y-auto prose prose-xs dark:prose-invert shadow-sm"
                    dangerouslySetInnerHTML={{ __html: socraticData.bloomScore.improvedContent }}
                  />
                  {onContentChanged && (
                    <button
                      onClick={() => onContentChanged(socraticData.bloomScore.improvedContent)}
                      className="mt-2 w-full py-2 bg-[#99334C]/10 hover:bg-[#99334C] text-[#99334C] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      Appliquer cette version
                    </button>
                  )}
                </div>
              )}

              {/* ── Granules suggérés ── */}
              {socraticData.bloomScore?.suggestedGranules?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-[#99334C]" />
                    Granules suggérés
                  </h4>
                  <div className="space-y-2">
                    {socraticData.bloomScore.suggestedGranules.map((g: any, idx: number) => {
                      const typeLabels: Record<string, string> = {
                        part: 'Partie', chapter: 'Chapitre', paragraph: 'Paragraphe', notion: 'Notion'
                      };
                      const typeColors: Record<string, string> = {
                        part: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                        chapter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                        paragraph: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                        notion: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
                      };
                      return (
                        <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeColors[g.type] || typeColors.notion}`}>
                                {typeLabels[g.type] || g.type}
                              </span>
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{g.title}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 leading-relaxed">{g.description}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic mb-2">{g.rationale}</p>
                          <button
                            onClick={() => {
                              setActiveTab('chat');
                              sendChatMessage(`Crée ${typeLabels[g.type]?.toLowerCase() || 'une notion'} intitulé(e) "${g.title}" : ${g.description}`);
                            }}
                            className="w-full py-1.5 bg-[#99334C]/8 hover:bg-[#99334C] text-[#99334C] hover:text-white border border-[#99334C]/20 hover:border-[#99334C] rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Wand2 size={11} />
                            Créer via l'IA
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleAudit}
                disabled={socraticData.isAnalyzing}
                className="mt-6 w-full py-3 bg-[#99334C] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#99334C]/20 hover:bg-[#802a3f] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {socraticData.isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Relancer l&apos;Analyse
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Highlights indicator — shrink-0 pour ne jamais être écrasé par le flex-1 */}
      {socraticData.feedback.length > 0 && (
        <div className="shrink-0 px-4 py-2 bg-[#99334C]/5 border-t border-[#99334C]/10 flex items-center justify-between">
          <span className="text-[10px] font-medium text-[#99334C] flex items-center gap-1">
            <AlertCircle size={12} />
            {socraticData.feedback.length} zones d&apos;amélioration détectées
          </span>
          <button
            onClick={() => {
              setActiveTab('audit');
              // Lancer l'audit si pas encore fait
              if (!socraticData.bloomScore && editorContent) {
                handleAudit();
              }
            }}
            className="text-[10px] font-bold text-[#99334C] underline hover:text-[#802a3f] transition-colors"
          >
            Voir
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedAIPanel;
