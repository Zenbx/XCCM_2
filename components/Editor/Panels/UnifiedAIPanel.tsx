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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { socraticService, SocraticAuditResult } from '@/services/socraticService';
import { authService } from '@/services/authService';
import { structureService } from '@/services/structureService';
import { exerciseService } from '@/services/exerciseService';
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
    analyzeContent: (content: string) => Promise<void>;
    onDismissFeedback: (id: string) => void;
  };
  onStructureChanged?: () => void; // Callback pour rafraîchir la structure après action IA
  onContentChanged?: (content: string) => void; // Callback pour mettre à jour le contenu éditeur
  project?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AIAction[];
  isActionExecuted?: boolean;
}

interface AIAction {
  type: 'create_structure' | 'write_content' | 'create_exercise' | 'suggest_improvements';
  data: any;
  status?: 'pending' | 'executing' | 'done' | 'error';
  error?: string;
}

const UnifiedAIPanel: React.FC<UnifiedAIPanelProps> = ({ 
  currentContext, 
  editorContent,
  socraticData,
  onStructureChanged,
  onContentChanged,
  project,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'audit'>('chat');
  const [showScores, setShowScores] = useState(true);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // ═══════ MANUAL CHAT STATE ═══════
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: isAdmin 
      ? "Bonjour ! Je suis votre assistant IA. Je peux vous aider à structurer vos cours, écrire du contenu, générer des exercices ou répondre à vos questions. Essayez : *\"Crée une structure de cours sur...\"*"
      : "Bonjour ! Je suis votre coach pédagogique XCCM. Je vous accompagne dans votre apprentissage via une approche socratique. Que souhaitez-vous approfondir aujourd'hui ?"
  }]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // ═══════ MANUAL STREAMING CHAT ═══════
  const sendChatMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

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

    // Determine which endpoint to use
    const isEditorMode = isAdmin && currentContext?.projectName;
    const endpoint = isEditorMode 
      ? `${API_BASE_URL}/api/ai/editor`
      : `${API_BASE_URL}/api/ai/socratic`;

    try {
      abortControllerRef.current = new AbortController();

      const chatHistory = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: userText.trim() });

      const body: any = {
        messages: chatHistory,
        context: {
          notionContent: editorContent,
          partTitle: currentContext?.partTitle,
          chapterTitle: currentContext?.chapterTitle,
          paraName: currentContext?.paraName,
          notionName: currentContext?.notionName,
          projectName: currentContext?.projectName,
        },
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

      // ═══ HANDLE JSON RESPONSE (Editor mode with actions) ═══
      if (contentType.includes('application/json')) {
        const data = await response.json();
        const aiContent = data.text || data.message || '';
        const actions: AIAction[] = data.actions || [];
        
        setMessages(prev => prev.map(m => 
          m.id === assistantMessage.id 
            ? { ...m, content: aiContent, actions: actions.length > 0 ? actions : undefined }
            : m
        ));
      }
      // ═══ HANDLE STREAM RESPONSE (Socratic mode) ═══
      else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          setMessages(prev => prev.map(m => 
            m.id === assistantMessage.id ? { ...m, content: fullText } : m
          ));
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, content: `❌ Erreur : ${error.message}. Vérifiez que le serveur est bien démarré.` }
          : m
      ));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, isStreaming, isAdmin, currentContext, editorContent]);

  // ═══════ EXECUTE AI ACTIONS ═══════
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
      const projectName = currentContext?.projectName;
      if (!projectName) throw new Error("Aucun projet actif");

      switch (action.type) {
        case 'create_structure': {
          const { parts } = action.data;
          for (let pi = 0; pi < parts.length; pi++) {
            const part = parts[pi];
            try {
              await structureService.createPart(projectName, {
                part_title: part.title,
                part_number: pi + 1,
                part_intro: part.intro || '',
              });
              
              if (part.chapters) {
                for (let ci = 0; ci < part.chapters.length; ci++) {
                  const ch = part.chapters[ci];
                  try {
                    await structureService.createChapter(projectName, part.title, {
                      chapter_title: ch.title,
                      chapter_number: ci + 1,
                      chapter_intro: ch.intro || '',
                    });

                    if (ch.paragraphs) {
                      for (let pai = 0; pai < ch.paragraphs.length; pai++) {
                        const para = ch.paragraphs[pai];
                        try {
                          await structureService.createParagraph(projectName, part.title, ch.title, {
                            para_name: para.title,
                            para_number: pai + 1,
                            para_intro: para.intro || '',
                          });

                          if (para.notions) {
                            for (let ni = 0; ni < para.notions.length; ni++) {
                              const notion = para.notions[ni];
                              try {
                                await structureService.createNotion(projectName, part.title, ch.title, para.title, {
                                  notion_name: notion.title,
                                  notion_content: notion.content || '',
                                  notion_number: ni + 1,
                                });
                              } catch (e) { console.warn('Notion skip:', e); }
                            }
                          }
                        } catch (e) { console.warn('Para skip:', e); }
                      }
                    }
                  } catch (e) { console.warn('Chapter skip:', e); }
                }
              }
            } catch (e) { console.warn('Part skip:', e); }
          }
          onStructureChanged?.();
          toast.success(`Structure créée : ${parts.length} partie(s)`);
          break;
        }

        case 'write_content': {
          const { content, target } = action.data;
          if (target === 'current' && onContentChanged) {
            onContentChanged(content);
            toast.success("Contenu injecté dans l'éditeur");
          } else if (target === 'notion' && action.data.notionPath) {
            const p = action.data.notionPath;
            try {
              await structureService.updateNotion(
                projectName, p.partTitle, p.chapterTitle, p.paraName, p.notionName,
                { notion_content: content }
              );
              onStructureChanged?.();
              toast.success(`Contenu écrit dans : ${p.notionName}`);
            } catch (e: any) {
              throw new Error(`Impossible d'écrire dans ${p.notionName}: ${e.message}`);
            }
          }
          break;
        }

        case 'create_exercise': {
          const ex = action.data;
          await exerciseService.createExercise(ex);
          toast.success(`Exercice créé : ${ex.title}`);
          break;
        }

        default:
          break;
      }

      // Mark as done
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId || !m.actions) return m;
        const newActions = [...m.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], status: 'done' };
        return { ...m, actions: newActions, isActionExecuted: true };
      }));
    } catch (error: any) {
      console.error('Action execution error:', error);
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId || !m.actions) return m;
        const newActions = [...m.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], status: 'error', error: error.message };
        return { ...m, actions: newActions };
      }));
      toast.error(error.message);
    }
  }, [messages, currentContext, onStructureChanged, onContentChanged]);

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim() || isStreaming) return;
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
    await socraticData.analyzeContent(editorContent);
    
    setMessages(prev => [...prev, {
      id: `audit-${Date.now()}`,
      role: 'assistant',
      content: "J'ai terminé l'analyse de votre contenu. Vous pouvez voir les scores et les suggestions dans l'onglet 'Audit'. Souhaitez-vous que je vous explique certains points ?"  
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
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chat' 
              ? 'bg-white dark:bg-gray-700 text-[#99334C] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={16} />
          Chat {isAdmin && '+ IA'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'audit' 
              ? 'bg-white dark:bg-gray-700 text-[#99334C] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Brain size={16} />
          Audit
        </button>
      </div>

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant' ? 'bg-[#99334C] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className="max-w-[85%] space-y-2">
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#99334C] text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-tl-none text-gray-800 dark:text-gray-200'
                      }`}>
                        {renderContent(msg.content)}
                      </div>
                      {/* AI Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.actions.map((action, i) => (
                            <ActionButton key={i} action={action} messageId={msg.id} index={i} />
                          ))}
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
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => handleSendRequest("Crée une structure de cours complète sur le sujet de la notion actuelle")}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      🏗️ Créer structure
                    </button>
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
                  placeholder={isAdmin ? "Demandez à l'IA de créer, écrire, générer..." : "Posez une question à l'IA..."}
                  className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C] outline-none text-sm transition-all shadow-sm"
                  disabled={isStreaming}
                />
                <button 
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-[#99334C] text-white rounded-lg hover:bg-[#802a3f] transition-colors disabled:opacity-50"
                >
                  {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
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

              <button 
                onClick={handleAudit}
                disabled={socraticData.isAnalyzing}
                className="mt-8 w-full py-3 bg-[#99334C] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#99334C]/20 hover:bg-[#802a3f] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {socraticData.isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Relancer l&apos;Analyse
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Highlights indicator */}
      {socraticData.feedback.length > 0 && (
        <div className="px-4 py-2 bg-[#99334C]/5 border-t border-[#99334C]/10 flex items-center justify-between">
          <span className="text-[10px] font-medium text-[#99334C] flex items-center gap-1">
            <AlertCircle size={12} />
            {socraticData.feedback.length} zones d&apos;amélioration détectées
          </span>
          <button 
            onClick={() => setActiveTab('audit')}
            className="text-[10px] font-bold text-[#99334C] underline"
          >
            Voir
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedAIPanel;
