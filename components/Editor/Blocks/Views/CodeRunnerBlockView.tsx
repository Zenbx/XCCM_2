import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState } from 'react';
import { Play, RotateCcw, Code, ChevronRight } from 'lucide-react';

export const CodeRunnerBlockView: React.FC<NodeViewProps> = (props) => {
    const { node, updateAttributes } = props;
    const { code, language, output } = node.attrs;
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = () => {
        setIsRunning(true);
        // Simulation d'exécution
        setTimeout(() => {
            let simulatedOutput = `> [${language}] Exécution réussie.\n`;
            if (language === 'javascript') {
                simulatedOutput += `Résultat: Hello World!`;
            } else {
                simulatedOutput += `Environnement ${language} prêt.`;
            }
            updateAttributes({ output: simulatedOutput });
            setIsRunning(false);
        }, 800);
    };

    const handleReset = () => {
        updateAttributes({ output: '' });
    };

    return (
        <NodeViewWrapper className="code-runner-block-wrapper my-8">
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-[#1e1e1e]">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                    <div className="flex items-center gap-2">
                        <Code size={14} className="text-[#99334C]" />
                        <select
                            value={language}
                            onChange={(e) => updateAttributes({ language: e.target.value })}
                            className="bg-transparent text-[10px] font-bold text-gray-300 uppercase outline-none cursor-pointer"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Réinitialiser"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${isRunning ? 'bg-gray-600 text-gray-400' : 'bg-[#99334C] text-white hover:bg-[#b33d5a]'
                                }`}
                        >
                            {isRunning ? '...' : <><Play size={12} /> Run</>}
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="p-0">
                    <textarea
                        value={code}
                        onChange={(e) => updateAttributes({ code: e.target.value })}
                        className="w-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 outline-none resize-none min-h-[120px]"
                        spellCheck={false}
                        placeholder="// Tapez votre code ici..."
                    />
                </div>

                {/* Output Area */}
                <AnimatePresence>
                    {output && (
                        <div className="bg-[#121212] border-t border-[#3d3d3d] p-3 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1 border-b border-gray-800 pb-1">
                                <ChevronRight size={12} /> <span>Console Output</span>
                            </div>
                            <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </NodeViewWrapper>
    );
};

// Simple support pour AnimatePresence si nécessaire (framer-motion est déjà utilisé ailleurs)
import { AnimatePresence } from 'framer-motion';
