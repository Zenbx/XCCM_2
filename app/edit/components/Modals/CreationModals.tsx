import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface CreationModalsProps {
    showPartModal: boolean;
    setShowPartModal: (show: boolean) => void;
    showChapterModal: boolean;
    setShowChapterModal: (show: boolean) => void;
    showParagraphModal: boolean;
    setShowParagraphModal: (show: boolean) => void;
    showNotionModal: boolean;
    setShowNotionModal: (show: boolean) => void;

    modalContext: any;

    partFormData: any;
    setPartFormData: (data: any) => void;
    chapterFormData: any;
    setChapterFormData: (data: any) => void;
    paragraphFormData: any;
    setParagraphFormData: (data: any) => void;
    notionFormData: any;
    setNotionFormData: (data: any) => void;

    isCreatingPart: boolean;
    isCreatingChapter: boolean;
    isCreatingParagraph: boolean;
    isCreatingNotion: boolean;

    confirmCreatePart: () => void;
    confirmCreateChapter: () => void;
    confirmCreateParagraph: () => void;
    confirmCreateNotion: () => void;
}

const CreationModals: React.FC<CreationModalsProps> = ({
    showPartModal, setShowPartModal,
    showChapterModal, setShowChapterModal,
    showParagraphModal, setShowParagraphModal,
    showNotionModal, setShowNotionModal,
    modalContext,
    partFormData, setPartFormData,
    chapterFormData, setChapterFormData,
    paragraphFormData, setParagraphFormData,
    notionFormData, setNotionFormData,
    isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion,
    confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion
}) => {
    return (
        <>
            {/* MODALE PARTIE */}
            {showPartModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Nouvelle Partie</h3>
                            <button onClick={() => setShowPartModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la partie</label>
                                <input
                                    type="text"
                                    value={partFormData.title}
                                    onChange={(e) => setPartFormData({ ...partFormData, title: e.target.value })}
                                    placeholder="Ex: Introduction"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                                <input
                                    type="number"
                                    value={partFormData.number}
                                    onChange={(e) => setPartFormData({ ...partFormData, number: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowPartModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Annuler</button>
                            <button onClick={confirmCreatePart} disabled={isCreatingPart || partFormData.title.length < 3} className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2">
                                {isCreatingPart && <Loader2 className="w-4 h-4 animate-spin" />} Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE CHAPITRE */}
            {showChapterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Nouveau Chapitre</h3>
                            <button onClick={() => setShowChapterModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-3 text-sm text-gray-600">Dans la partie : <span className="font-semibold text-[#99334C]">{modalContext.partTitle}</span></div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du chapitre</label>
                                <input
                                    type="text"
                                    value={chapterFormData.title}
                                    onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                                    placeholder="Ex: Concepts fondamentaux"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                                <input
                                    type="number"
                                    value={chapterFormData.number}
                                    onChange={(e) => setChapterFormData({ ...chapterFormData, number: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowChapterModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Annuler</button>
                            <button onClick={confirmCreateChapter} disabled={isCreatingChapter || chapterFormData.title.length < 3} className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2">
                                {isCreatingChapter && <Loader2 className="w-4 h-4 animate-spin" />} Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE PARAGRAPHE */}
            {showParagraphModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Nouveau Paragraphe</h3>
                            <button onClick={() => setShowParagraphModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-3 text-sm text-gray-600">Dans : <span className="font-semibold text-[#99334C]">{modalContext.partTitle} / {modalContext.chapterTitle}</span></div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du paragraphe</label>
                                <input
                                    type="text"
                                    value={paragraphFormData.name}
                                    onChange={(e) => setParagraphFormData({ ...paragraphFormData, name: e.target.value })}
                                    placeholder="Ex: Définitions"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                                <input
                                    type="number"
                                    value={paragraphFormData.number}
                                    onChange={(e) => setParagraphFormData({ ...paragraphFormData, number: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowParagraphModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Annuler</button>
                            <button onClick={confirmCreateParagraph} disabled={isCreatingParagraph || paragraphFormData.name.length < 3} className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2">
                                {isCreatingParagraph && <Loader2 className="w-4 h-4 animate-spin" />} Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE NOTION */}
            {showNotionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Nouvelle Notion</h3>
                            <button onClick={() => setShowNotionModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-3 text-sm text-gray-600">Dans : <span className="font-semibold text-[#99334C]">{modalContext.partTitle} / {modalContext.chapterTitle} / {modalContext.paraName}</span></div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la notion</label>
                                <input
                                    type="text"
                                    value={notionFormData.name}
                                    onChange={(e) => setNotionFormData({ ...notionFormData, name: e.target.value })}
                                    placeholder="Ex: Théorème de Pythagore"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                                <input
                                    type="number"
                                    value={notionFormData.number}
                                    onChange={(e) => setNotionFormData({ ...notionFormData, number: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowNotionModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Annuler</button>
                            <button onClick={confirmCreateNotion} disabled={isCreatingNotion || notionFormData.name.length < 3} className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2">
                                {isCreatingNotion && <Loader2 className="w-4 h-4 animate-spin" />} Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreationModals;
