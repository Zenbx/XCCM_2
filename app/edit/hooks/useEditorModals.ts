import { useState } from 'react';
import toast from 'react-hot-toast';
import { structureService } from '@/services/structureService';

export const useEditorModals = (
    projectName: string | null,
    structure: any[], // ✅ Added structure for auto-increment
    setStructure: (parts: any) => void,
    loadProject: (silent?: boolean) => Promise<void>,
    setPendingGranule?: (pending: any) => void,
    setPulsingId?: (id: string | null) => void
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
        const { type, id, title } = deleteModalConfig;
        if (!type || !id || !title) return;

        // 1. Close modal immediately for zero-wait UX
        setDeleteModalConfig(prev => ({ ...prev, isOpen: false, isDeleting: false }));

        // 2. Optimistic Visual Update: Remove from local state immediately
        const updatedStructure = JSON.parse(JSON.stringify(currentStructure));
        if (type === 'part') {
            setStructure(updatedStructure.filter((p: any) => p.part_id !== id));
        } else if (type === 'chapter') {
            updatedStructure.forEach((p: any) => {
                if (p.chapters) p.chapters = p.chapters.filter((c: any) => c.chapter_id !== id);
            });
            setStructure(updatedStructure);
        } else if (type === 'paragraph') {
            updatedStructure.forEach((p: any) => {
                p.chapters?.forEach((c: any) => {
                    if (c.paragraphs) c.paragraphs = c.paragraphs.filter((pa: any) => pa.para_id !== id);
                });
            });
            setStructure(updatedStructure);
        } else if (type === 'notion') {
            updatedStructure.forEach((p: any) => {
                p.chapters?.forEach((c: any) => {
                    c.paragraphs?.forEach((pa: any) => {
                        if (pa.notions) pa.notions = pa.notions.filter((n: any) => n.notion_id !== id);
                    });
                });
            });
            setStructure(updatedStructure);
        }

        try {
            // 3. Perform backend deletion in the background
            if (type === 'part') {
                await structureService.deletePart(projectName, title);
            } else if (type === 'chapter') {
                const part = currentStructure.find(p => p.chapters?.some((c: any) => c.chapter_id === id));
                if (part) await structureService.deleteChapter(projectName, part.part_title, title);
            } else if (type === 'paragraph') {
                for (const part of currentStructure) {
                    const chap = part.chapters?.find((c: any) => c.paragraphs?.some((p: any) => p.para_id === id));
                    if (chap) {
                        await structureService.deleteParagraph(projectName, part.part_title, chap.chapter_title, title);
                        break;
                    }
                }
            } else if (type === 'notion') {
                for (const part of currentStructure) {
                    for (const chap of part.chapters || []) {
                        const para = chap.paragraphs?.find((p: any) => p.notions?.some((n: any) => n.notion_id === id));
                        if (para) {
                            await structureService.deleteNotion(projectName, part.part_title, chap.chapter_title, para.para_name, title);
                            break;
                        }
                    }
                }
            }

            toast.success("Supprimé avec succès");
            // 4. Sync with server in background
            await loadProject(true);
        } catch (err: any) {
            toast.error("Échec de la suppression");
            // Revert state on error for consistency
            setStructure(currentStructure);
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
