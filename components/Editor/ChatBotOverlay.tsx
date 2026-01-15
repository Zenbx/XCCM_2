import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Copy, Check } from 'lucide-react';
import { chatbotService } from '@/services/chatbotService';
import toast from 'react-hot-toast';

interface ChatBotOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    currentContext: {
        projectName: string;
        partTitle: string;
        chapterTitle: string;
        paraName: string;
        notionName: string;
    } | null;
    editorContent: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isTyping?: boolean;
}

const ChatBotOverlay: React.FC<ChatBotOverlayProps> = ({ isOpen, onClose, currentContext, editorContent }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Bonjour ! Je peux reformuler votre notion. Dites-moi quel style vous préférez : "simple", "formal", "summary", "detailed", "french" ou "english".'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleCopy = (text: string, id: string) => {
        // Fallback function for older browsers or non-secure contexts
        const fallbackCopy = (text: string) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Ensure textarea is not visible but part of DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopiedId(id);
                    toast.success("Copié !");
                    setTimeout(() => setCopiedId(null), 2000);
                } else {
                    toast.error("Échec de la copie");
                }
            } catch (err) {
                console.error('Fallback copy failed', err);
                toast.error("Impossible de copier");
            }

            document.body.removeChild(textArea);
        };

        // Try modern API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopiedId(id);
                    toast.success("Copié !");
                    setTimeout(() => setCopiedId(null), 2000);
                })
                .catch(err => {
                    console.error('Clipboard API failed, trying fallback', err);
                    fallbackCopy(text);
                });
        } else {
            // Use fallback if API not available
            fallbackCopy(text);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Détection simple du style basée sur les mots-clés
        const lowerInput = input.toLowerCase();
        let style = 'simple'; // Défaut
        if (lowerInput.includes('formal')) style = 'formal';
        else if (lowerInput.includes('summary') || lowerInput.includes('resume') || lowerInput.includes('résumé')) style = 'summary';
        else if (lowerInput.includes('detailed') || lowerInput.includes('detail') || lowerInput.includes('détail')) style = 'detailed';
        else if (lowerInput.includes('french') || lowerInput.includes('francais') || lowerInput.includes('français')) style = 'french';
        else if (lowerInput.includes('english') || lowerInput.includes('anglais')) style = 'english';

        // Si aucun contexte, on ne peut pas reformuler via l'API (pour l'instant)
        if (!currentContext) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Veuillez sélectionner une notion pour que je puisse la reformuler."
                }]);
                setIsTyping(false);
            }, 500);
            return;
        }

        try {
            const result = await chatbotService.rephraseNotion(
                currentContext.projectName,
                currentContext.partTitle,
                currentContext.chapterTitle,
                currentContext.paraName,
                currentContext.notionName,
                style,
                editorContent
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.rephrased_content
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error("Erreur Chatbot:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Désolé, je n'ai pas pu reformuler le contenu. Erreur: ${error.message}`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-10 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#99334C] to-[#C0392B] p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Bot size={16} />
                    </div>
                    <div>
                        <span className="font-semibold block text-sm">Assistant Pédagogique</span>
                        <span className="text-xs opacity-80 block">{currentContext ? currentContext.notionName : 'Aucune notion sélectionnée'}</span>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-[#99334C] text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`relative group max-w-[85%] ${msg.role === 'assistant' ? 'w-full' : ''}`}>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                                ? 'bg-[#99334C] text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' // Enlevé pr-10
                                }`}>
                                {msg.content}

                                {/* Bouton Copier en bas du message pour l'assistant */}
                                {msg.role === 'assistant' && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleCopy(msg.content, msg.id)}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#99334C] transition-colors p-1 rounded-md hover:bg-gray-50"
                                            title="Copier le texte"
                                        >
                                            {copiedId === msg.id ? (
                                                <>
                                                    <Check size={14} className="text-green-600" />
                                                    <span className="text-green-600">Copié</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span>Copier</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#99334C] text-white flex items-center justify-center flex-shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={currentContext ? "Ex: 'Je veux un style formal' ou 'simple'..." : "Sélectionnez une notion d'abord"}
                        disabled={isTyping}
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-1.5 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBotOverlay;
