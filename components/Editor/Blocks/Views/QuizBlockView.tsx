import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export const QuizBlockView: React.FC<NodeViewProps> = (props) => {
    const { node, updateAttributes } = props;
    const { question, options, correctIndex } = node.attrs;
    const [isEditing, setIsEditing] = useState(false);

    const handleAddOption = () => {
        updateAttributes({
            options: [...options, 'Nouvelle option'],
        });
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_: any, i: number) => i !== index);
        updateAttributes({
            options: newOptions,
            correctIndex: correctIndex === index ? 0 : correctIndex > index ? correctIndex - 1 : correctIndex,
        });
    };

    const handleUpdateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        updateAttributes({ options: newOptions });
    };

    return (
        <NodeViewWrapper className="quiz-block-wrapper my-8">
            <div className={`p-6 rounded-xl border-2 transition-all ${isEditing ? 'border-[#99334C] bg-white' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#99334C] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Quiz</span>
                        <span className="text-gray-400 text-xs font-medium italic">Auto-évaluation</span>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs font-semibold text-[#99334C] hover:underline"
                    >
                        {isEditing ? 'Terminer' : 'Modifier le Quiz'}
                    </button>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Question</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => updateAttributes({ question: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#99334C] outline-none text-sm"
                                placeholder="Votre question ici..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Options de réponse</label>
                            {options.map((opt: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateAttributes({ correctIndex: idx })}
                                        className={`p-1 rounded-full transition-colors ${correctIndex === idx ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-gray-400'}`}
                                    >
                                        {correctIndex === idx ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </button>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                                        className="flex-1 p-2 border border-gray-100 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-gray-200 outline-none"
                                    />
                                    <button
                                        onClick={() => handleRemoveOption(idx)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddOption}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#99334C] transition-colors mt-2"
                            >
                                <Plus size={14} /> Ajouter une option
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-4">{question || 'Question non définie'}</h3>
                        <div className="space-y-2">
                            {options.map((opt: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="p-3 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-3 cursor-default hover:bg-white hover:border-[#99334C22]"
                                >
                                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    {opt}
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] text-gray-400 italic font-medium">
                            * Les apprenants pourront tester leurs connaissances ici.
                        </p>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
