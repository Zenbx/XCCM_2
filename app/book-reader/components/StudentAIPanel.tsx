"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '@/services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
import {
    X, Send, Sparkles, User,
    Bot, Loader2, Maximize2, Minimize2
} from 'lucide-react';

interface StudentAIPanelProps {
    isOpen: boolean;
    onClose: () => void;
    docId: string;
    context: {
        docName: string;
        activeSectionName: string;
        activeSectionContent: string;
    };
}

const StudentAIPanel: React.FC<StudentAIPanelProps> = ({ isOpen, onClose, docId, context }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [messages, setMessages] = useState<any[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Bonjour ! Je suis ton assistant d'apprentissage XCCM2. Comment puis-je t'aider à explorer "**${context.activeSectionName || context.docName}**" aujourd'hui ?`
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendChatMessage = useCallback(async (userText: string) => {
        if (!userText.trim() || isLoading) return;

        const userMsg = { id: `u-${Date.now()}`, role: 'user', content: userText.trim() };
        const assistantMsg = { id: `a-${Date.now()}`, role: 'assistant', content: '' };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setIsLoading(true);

        try {
            abortControllerRef.current = new AbortController();

            const chatHistory = messages.filter(m => m.id !== 'welcome').map(m => ({
                role: m.role,
                content: m.content
            }));
            chatHistory.push({ role: 'user', content: userText.trim() });

            const response = await fetch(`${API_BASE_URL}/api/ai/socratic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getAuthToken() || ''}`,
                },
                body: JSON.stringify({
                    messages: chatHistory,
                    context: {
                        docId,
                        docName: context.docName,
                        paraName: context.activeSectionName,
                        notionContent: context.activeSectionContent
                    }
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Erreur serveur (${response.status}): ${errText}`);
            }

            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // toTextStreamResponse might send raw text chunks, but some Vercel AI SDK versions might prefix them.
                    fullText += chunk;

                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsg.id ? { ...m, content: fullText } : m
                    ));
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Socratic UI Error:', error);
            setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: `❌ Erreur : ${error.message}` } : m
            ));
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [messages, isLoading, context, docId]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-[73px] bottom-0 z-50 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl transition-all duration-300 ${isMaximized ? 'w-full lg:w-[600px]' : 'w-full lg:w-[400px]'}`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#99334C]/5 to-white dark:from-[#99334C]/10 dark:to-gray-950">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#99334C] rounded-lg flex items-center justify-center text-white">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Assistant Socratique</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Mode Apprentissage</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hidden lg:block"
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Context Banner */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Sujet :</span>
                <span className="text-xs text-[#99334C] font-semibold truncate">
                    {context.activeSectionName || context.docName}
                </span>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
            >
                {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-[#99334C]/10 text-[#99334C]'}`}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-[#99334C] text-white rounded-tr-none'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-none'
                                }`}>
                                {m.content || m.parts?.map((p: any) => p.text).join('\n')}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#99334C]/10 text-[#99334C] flex items-center justify-center">
                                <Bot size={14} />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-gray-400">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-xs italic">Réflexion socratique...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!input.trim() || isLoading) return;
                        const currentInput = input;
                        setInput('');
                        await sendChatMessage(currentInput);
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez une question sur le cours..."
                        className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#99334C] dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-11 h-11 bg-[#99334C] text-white rounded-xl flex items-center justify-center hover:bg-[#7a283d] transition-colors disabled:opacity-50 disabled:hover:bg-[#99334C]"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-3 text-center">
                    L'IA peut faire des erreurs. Vérifiez le contenu du cours.
                </p>
            </div>
        </motion.div>
    );
};

export default StudentAIPanel;
