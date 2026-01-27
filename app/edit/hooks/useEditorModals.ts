import { useState } from 'react';
import toast from 'react-hot-toast';
import { structureService } from '@/services/structureService';

export const useEditorModals = (
    projectName: string | null,
    structure: any[], // ✅ Added structure for auto-increment
    setStructure: (parts: any) => void,
    loadProject: (silent?: boolean) => Promise<any[] | null>,
    setPendingGranule?: (pending: any) => void,
    setPulsingId?: (id: string | null) => void,
    addAction?: (action: any) => void // ✅ Added for undo/redo
) => {
    const [showPartModal, setShowPartModal] = useState(false);
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [showParagraphModal, setShowParagraphModal] = useState(false);
    const [showNotionModal, setShowNotionModal] = useState(false);

    const [modalContext, setModalContext] = useState<{
        partTitle?: string;
        chapterTitle?: string;
        paraName?: string;
    }>({});

    const [partFormData, setPartFormData] = useState({ title: '', number: 1 });
    const [chapterFormData, setChapterFormData] = useState({ title: '', number: 1 });
    const [paragraphFormData, setParagraphFormData] = useState({ name: '', number: 1 });
    const [notionFormData, setNotionFormData] = useState({ name: '', number: 1 });

    const [isCreatingPart, setIsCreatingPart] = useState(false);
    const [isCreatingChapter, setIsCreatingChapter] = useState(false);
    const [isCreatingParagraph, setIsCreatingParagraph] = useState(false);
    const [isCreatingNotion, setIsCreatingNotion] = useState(false);

    const [deleteModalConfig, setDeleteModalConfig] = useState<{
        isOpen: boolean;
        isDeleting: boolean;
        type: string;
        id: string;
        title: string;
    }>({
        isOpen: false,
        isDeleting: false,
        type: '',
        id: '',
        title: ''
    });

    const handleCreatePart = () => {
        // Auto-increment Part
        const maxNum = structure.reduce((max, p) => Math.max(max, p.part_number || 0), 0);
        setPartFormData({ title: '', number: maxNum + 1 });
        setShowPartModal(true);
    };

    const handleCreateChapter = (partTitle: string) => {
        const part = structure.find(p => p.part_title === partTitle);
        const maxNum = part?.chapters?.reduce((max: number, c: any) => Math.max(max, c.chapter_number || 0), 0) || 0;

        setModalContext({ partTitle });
        setChapterFormData({ title: '', number: maxNum + 1 });
        setShowChapterModal(true);
    };

    const handleCreateParagraph = (partTitle: string, chapterTitle: string) => {
        const part = structure.find(p => p.part_title === partTitle);
        const chapter = part?.chapters?.find((c: any) => c.chapter_title === chapterTitle);
        const maxNum = chapter?.paragraphs?.reduce((max: number, p: any) => Math.max(max, p.para_number || 0), 0) || 0;

        setModalContext({ partTitle, chapterTitle });
        setParagraphFormData({ name: '', number: maxNum + 1 });
        setShowParagraphModal(true);
    };

    const handleCreateNotion = (partTitle: string, chapterTitle: string, paraName: string) => {
        const part = structure.find(p => p.part_title === partTitle);
        const chapter = part?.chapters?.find((c: any) => c.chapter_title === chapterTitle);
        const para = chapter?.paragraphs?.find((p: any) => p.para_name === paraName);
        const maxNum = para?.notions?.reduce((max: number, n: any) => Math.max(max, n.notion_number || 0), 0) || 0;

        setModalContext({ partTitle, chapterTitle, paraName });
        setNotionFormData({ name: '', number: maxNum + 1 });
        setShowNotionModal(true);
    };

    const confirmCreatePart = async () => {
        if (!projectName || partFormData.title.trim().length < 3) return;
        try {
            setIsCreatingPart(true);
            setPendingGranule?.({ type: 'part', content: partFormData.title });
            const newPart = await structureService.createPart(projectName, {
                part_title: partFormData.title,
                part_number: partFormData.number
            });
            toast.success("Partie créée");
            setShowPartModal(false);
            await loadProject(true);
            setPendingGranule?.(null);
            setPulsingId?.(newPart.part_id);

            // ✅ Track history
            addAction?.({
                type: 'create',
                description: `Créer partie "${partFormData.title}"`,
                undo: async () => {
                    await structureService.deletePart(projectName, partFormData.title);
                    await loadProject(true);
                },
                redo: async () => {
                    await structureService.createPart(projectName, {
                        part_title: partFormData.title,
                        part_number: partFormData.number
                    });
                    await loadProject(true);
                }
            });

            setTimeout(() => setPulsingId?.(null), 3000);
        } catch (err: any) {
            setPendingGranule?.(null);
            toast.error("Impossible de créer la partie");
        } finally {
            setIsCreatingPart(false);
        }
    };

    const confirmCreateChapter = async () => {
        if (!projectName || !modalContext.partTitle || chapterFormData.title.trim().length < 3) return;
        try {
            setIsCreatingChapter(true);
            setPendingGranule?.({ type: 'chapter', content: chapterFormData.title });
            const newChapter = await structureService.createChapter(projectName, modalContext.partTitle, {
                chapter_title: chapterFormData.title,
                chapter_number: chapterFormData.number
            });
            toast.success("Chapitre créé");
            setShowChapterModal(false);
            await loadProject(true);
            setPendingGranule?.(null);
            setPulsingId?.(newChapter.chapter_id);

            // ✅ Track history
            if (modalContext.partTitle) {
                const pTitle = modalContext.partTitle;
                const cTitle = chapterFormData.title;
                const cNum = chapterFormData.number;
                addAction?.({
                    type: 'create',
                    description: `Créer chapitre "${cTitle}" dans "${pTitle}"`,
                    undo: async () => {
                        await structureService.deleteChapter(projectName, pTitle, cTitle);
                        await loadProject(true);
                    },
                    redo: async () => {
                        await structureService.createChapter(projectName, pTitle, {
                            chapter_title: cTitle,
                            chapter_number: cNum
                        });
                        await loadProject(true);
                    }
                });
            }

            setTimeout(() => setPulsingId?.(null), 3000);
        } catch (err: any) {
            setPendingGranule?.(null);
            toast.error("Impossible de créer le chapitre");
        } finally {
            setIsCreatingChapter(false);
        }
    };

    const confirmCreateParagraph = async () => {
        if (!projectName || !modalContext.partTitle || !modalContext.chapterTitle || paragraphFormData.name.trim().length < 3) return;
        try {
            setIsCreatingParagraph(true);
            setPendingGranule?.({ type: 'paragraph', content: paragraphFormData.name });
            const newPara = await structureService.createParagraph(projectName, modalContext.partTitle, modalContext.chapterTitle, {
                para_name: paragraphFormData.name,
                para_number: paragraphFormData.number
            });
            toast.success("Paragraphe créé");
            setShowParagraphModal(false);
            await loadProject(true);
            setPendingGranule?.(null);
            setPulsingId?.(newPara.para_id);

            // ✅ Track history
            if (modalContext.partTitle && modalContext.chapterTitle) {
                const pTitle = modalContext.partTitle;
                const cTitle = modalContext.chapterTitle;
                const paName = paragraphFormData.name;
                const paNum = paragraphFormData.number;
                addAction?.({
                    type: 'create',
                    description: `Créer paragraphe "${paName}"`,
                    undo: async () => {
                        await structureService.deleteParagraph(projectName, pTitle, cTitle, paName);
                        await loadProject(true);
                    },
                    redo: async () => {
                        await structureService.createParagraph(projectName, pTitle, cTitle, {
                            para_name: paName,
                            para_number: paNum
                        });
                        await loadProject(true);
                    }
                });
            }

            setTimeout(() => setPulsingId?.(null), 3000);
        } catch (err: any) {
            setPendingGranule?.(null);
            toast.error("Impossible de créer le paragraphe");
        } finally {
            setIsCreatingParagraph(false);
        }
    };

    const confirmCreateNotion = async () => {
        if (!projectName || !modalContext.partTitle || !modalContext.chapterTitle || !modalContext.paraName || notionFormData.name.trim().length < 3) return;
        try {
            setIsCreatingNotion(true);
            setPendingGranule?.({ type: 'notion', content: notionFormData.name });
            const newNotion = await structureService.createNotion(projectName, modalContext.partTitle, modalContext.chapterTitle, modalContext.paraName, {
                notion_name: notionFormData.name,
                notion_content: '',
                notion_number: notionFormData.number
            });
            toast.success("Notion créée");
            setShowNotionModal(false);
            await loadProject(true);
            setPendingGranule?.(null);
            setPulsingId?.(newNotion.notion_id);

            // ✅ Track history
            if (modalContext.partTitle && modalContext.chapterTitle && modalContext.paraName) {
                const pTitle = modalContext.partTitle;
                const cTitle = modalContext.chapterTitle;
                const paName = modalContext.paraName;
                const nName = notionFormData.name;
                const nNum = notionFormData.number;
                addAction?.({
                    type: 'create',
                    description: `Créer notion "${nName}"`,
                    undo: async () => {
                        await structureService.deleteNotion(projectName, pTitle, cTitle, paName, nName);
                        await loadProject(true);
                    },
                    redo: async () => {
                        await structureService.createNotion(projectName, pTitle, cTitle, paName, {
                            notion_name: nName,
                            notion_content: '',
                            notion_number: nNum
                        });
                        await loadProject(true);
                    }
                });
            }

            setTimeout(() => setPulsingId?.(null), 3000);
        } catch (err: any) {
            setPendingGranule?.(null);
            toast.error("Impossible de créer la notion");
        } finally {
            setIsCreatingNotion(false);
        }
    };

    const handleDelete = (type: string, id: string, title: string) => {
        setDeleteModalConfig({
            isOpen: true,
            isDeleting: false,
            type,
            id,
            title
        });
    };

    const confirmDelete = async (currentStructure: any[]) => {
        if (!projectName || !deleteModalConfig.id) return;
        try {
            setDeleteModalConfig(prev => ({ ...prev, isDeleting: true }));
            const { type, id, title } = deleteModalConfig;

            // ✅ Backup data for undo
            let backupData: any = null;
            let parentContext: any = {};

            if (type === 'part') {
                backupData = currentStructure.find(p => p.part_id === id);
            } else if (type === 'chapter') {
                const part = currentStructure.find(p => p.chapters?.some((c: any) => c.chapter_id === id));
                if (part) {
                    backupData = part.chapters.find((c: any) => c.chapter_id === id);
                    parentContext = { partTitle: part.part_title };
                }
            } else if (type === 'paragraph') {
                for (const part of currentStructure) {
                    const chap = part.chapters?.find((c: any) => c.paragraphs?.some((p: any) => p.para_id === id));
                    if (chap) {
                        backupData = chap.paragraphs.find((p: any) => p.para_id === id);
                        parentContext = { partTitle: part.part_title, chapterTitle: chap.chapter_title };
                        break;
                    }
                }
            } else if (type === 'notion') {
                for (const part of currentStructure) {
                    for (const chap of part.chapters || []) {
                        const para = chap.paragraphs?.find((p: any) => p.notions?.some((n: any) => n.notion_id === id));
                        if (para) {
                            backupData = para.notions.find((n: any) => n.notion_id === id);
                            parentContext = {
                                partTitle: part.part_title,
                                chapterTitle: chap.chapter_title,
                                paraName: para.para_name
                            };
                            break;
                        }
                    }
                }
            }

            if (type === 'part') {
                await structureService.deletePart(projectName, title);
            } else if (type === 'chapter') {
                if (parentContext.partTitle) await structureService.deleteChapter(projectName, parentContext.partTitle, title);
            } else if (type === 'paragraph') {
                if (parentContext.partTitle && parentContext.chapterTitle)
                    await structureService.deleteParagraph(projectName, parentContext.partTitle, parentContext.chapterTitle, title);
            } else if (type === 'notion') {
                if (parentContext.partTitle && parentContext.chapterTitle && parentContext.paraName)
                    await structureService.deleteNotion(projectName, parentContext.partTitle, parentContext.chapterTitle, parentContext.paraName, title);
            }

            toast.success("Supprimé avec succès");
            setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
            await loadProject(true);

            // ✅ Track history for delete
            if (backupData) {
                addAction?.({
                    type: 'delete',
                    description: `Supprimer ${type} "${title}"`,
                    undo: async () => {
                        if (type === 'part') {
                            await structureService.createPart(projectName, backupData);
                        } else if (type === 'chapter') {
                            await structureService.createChapter(projectName, parentContext.partTitle, backupData);
                        } else if (type === 'paragraph') {
                            await structureService.createParagraph(projectName, parentContext.partTitle, parentContext.chapterTitle, backupData);
                        } else if (type === 'notion') {
                            await structureService.createNotion(projectName, parentContext.partTitle, parentContext.chapterTitle, parentContext.paraName, backupData);
                        }
                        await loadProject(true);
                    },
                    redo: async () => {
                        if (type === 'part') await structureService.deletePart(projectName, title);
                        else if (type === 'chapter') await structureService.deleteChapter(projectName, parentContext.partTitle, title);
                        else if (type === 'paragraph') await structureService.deleteParagraph(projectName, parentContext.partTitle, parentContext.chapterTitle, title);
                        else if (type === 'notion') await structureService.deleteNotion(projectName, parentContext.partTitle, parentContext.chapterTitle, parentContext.paraName, title);
                        await loadProject(true);
                    }
                });
            }

        } catch (err: any) {
            toast.error("Échec de la suppression");
        } finally {
            setDeleteModalConfig(prev => ({ ...prev, isDeleting: false }));
        }
    };

    return {
        showPartModal, setShowPartModal,
        showChapterModal, setShowChapterModal,
        showParagraphModal, setShowParagraphModal,
        showNotionModal, setShowNotionModal,
        modalContext, setModalContext,
        partFormData, setPartFormData,
        chapterFormData, setChapterFormData,
        paragraphFormData, setParagraphFormData,
        notionFormData, setNotionFormData,
        isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion,
        deleteModalConfig, setDeleteModalConfig,
        handleCreatePart, handleCreateChapter, handleCreateParagraph, handleCreateNotion,
        confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion,
        handleDelete, confirmDelete
    };
};
