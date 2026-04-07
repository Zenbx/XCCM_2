"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { socraticService, SocraticAuditResult } from '@/services/socraticService';
import { useChat } from '@ai-sdk/react';
import { authService } from '@/services/authService';
import { DefaultChatTransport } from 'ai';
import toast from 'react-hot-toast';

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
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const UnifiedAIPanel: React.FC<UnifiedAIPanelProps> = ({ 
  currentContext, 
  editorContent,
  socraticData
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'audit'>('chat');
  const [showScores, setShowScores] = useState(true);
  const [input, setInput] = useState('');

  // Vercel AI SDK - useChat Integration
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai/socratic`,
      headers: {
        Authorization: `Bearer ${authService.getAuthToken() || ''}`,
      },
      body: {
        context: {
          notionContent: editorContent,
          partTitle: currentContext?.partTitle,
          chapterTitle: currentContext?.chapterTitle,
          paraName: currentContext?.paraName,
          notionName: currentContext?.notionName,
        }
      }
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ 
          type: 'text', 
          text: isAdmin 
            ? "Bonjour ! Je suis votre assistant de conception pédagogique. Je peux vous aider à structurer vos cours, clarifier vos notions ou générer des évaluations. Comment puis-je vous assister ?"
            : "Bonjour ! Je suis votre coach pédagogique XCCM. Je vous accompagne dans votre apprentissage via une approche socratique. Que souhaitez-vous approfondir aujourd'hui ?"
        }]
      }
    ],
    onError: (error: Error) => {
      console.error("AI Chat Error:", error);
      toast.error("Une erreur est survenue lors de la discussion.");
    }
  });

  const isStreaming = status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim() || isStreaming) return;
    
    const currentInput = input;
    setInput('');
    // @ts-ignore
    await sendMessage({ text: currentInput });
  };

  const isTyping = isStreaming;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleAudit = async () => {
    if (!editorContent) {
      toast.error("Le contenu est vide !");
      return;
    }
    setActiveTab('audit');
    await socraticData.analyzeContent(editorContent);
    
    // Add a message in chat about the audit
    setMessages((prev: any[]) => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      parts: [{ 
        type: 'text', 
        text: "J'ai terminé l'analyse de votre contenu. Vous pouvez voir les scores et les suggestions dans l'onglet 'Audit'. Souhaitez-vous que je vous explique certains points ?" 
      }]
    }]);
  };

  const handleSendRequest = (customInput?: string) => {
    // If customInput is provided, we send that message directly
    if (customInput) {
      // @ts-ignore
      sendMessage({ text: customInput });
    } else {
      handleSubmit();
    }
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
          Chat
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
                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant' ? 'bg-[#99334C] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-[#99334C] text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-tl-none'
                    }`}>
                      {msg.parts?.map((part: any, i: number) => (
                        part.type === 'text' ? <React.Fragment key={i}>{part.text}</React.Fragment> : null
                      ))}
                    </div>
                  </div>
                ))}
                {isTyping && (
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

              {/* Suggestions chips mapping */}
              <div className="flex flex-wrap gap-2 mt-4">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => handleSendRequest("Peux-tu optimiser la clarté de ce paragraphe ?")}
                      className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ✨ Optimiser clarté
                    </button>
                    <button 
                      onClick={() => handleSendRequest("Génère 3 questions de quiz pour cette notion")}
                      className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ❓ Créer Quiz
                    </button>
                    <button 
                      onClick={() => handleSendRequest("Suggère une analogie concrète pour expliquer ce concept")}
                      className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      💡 Analogie
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleSendRequest("Peux-tu simplifier ce texte ?")}
                      className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      ✨ Simplifier
                    </button>
                    <button 
                      onClick={() => handleSendRequest("Explique-moi ce concept étape par étape")}
                      className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                    >
                      📝 Expliquer
                    </button>
                  </>
                )}
                <button 
                  onClick={handleAudit}
                  className="text-[10px] px-2 py-1 bg-white border border-gray-100 rounded-full hover:border-[#99334C] transition-colors"
                >
                  🔍 Auditer pedagogy
                </button>
              </div>

              {/* Chat Input */}
                <form onSubmit={handleSubmit} className="mt-4 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Posez une question à l'IA..."
                    className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C] outline-none text-sm transition-all shadow-sm"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-[#99334C] text-white rounded-lg hover:bg-[#802a3f] transition-colors"
                  >
                    <Send size={16} />
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
                Suggestions de l'IA
              </h4>
              
              <div className="space-y-3">
                {socraticData.bloomScore?.suggestions?.map((s: string, idx: number) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-amber-400 shadow-sm text-xs italic text-gray-600 leading-relaxed">
                    "{s}"
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
                Relancer l'Analyse
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
            {socraticData.feedback.length} zones d'amélioration détectées
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
