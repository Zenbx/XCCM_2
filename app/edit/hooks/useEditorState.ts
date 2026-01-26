import { useState, useCallback, useRef, useEffect } from 'react';
import { projectService, Project } from '@/services/projectService';
import { commentService } from '@/services/commentService';
import { structureService, Part, Notion } from '@/services/structureService';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export const useEditorState = (projectName: string | null) => {
    const t = useTranslations('editor');

    const [projectData, setProjectData] = useState<any | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const [structure, setStructure] = useState<Part[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentContext, setCurrentContext] = useState<{
        type: 'part' | 'chapter' | 'paragraph' | 'notion';
        projectName: string;
        partTitle: string;
        chapterTitle?: string;
        chapterId?: string;
        paraName?: string;
        paraId?: string;
        notionName?: string;
        notion?: Notion | null;
        part?: Part | null;
    } | null>(null);

    const [editorContent, setEditorContent] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const [textFormat, setTextFormat] = useState({
        font: 'Calibri',
        fontSize: '11',
        color: '#000000'
    });

    const lastRenamedTo = useRef<string | null>(null);

    // 🔑 SOURCE DE VÉRITÉ : Cache local centralisé
    const localContentCacheRef = useRef<Record<string, string>>({});
    // Verrou d'identité synchrone
    const activeDocIdRef = useRef<string>('');

    // Fonction de fusion déterministe (Local Dominance)
    const patchStructureWithCache = useCallback((parts: Part[]): Part[] => {
        return parts.map(part => {
            const patchedPart = { ...part };
            const cachedIntro = localContentCacheRef.current[part.part_id];
            if (cachedIntro !== undefined) patchedPart.part_intro = cachedIntro;

            if (part.chapters) {
                patchedPart.chapters = part.chapters.map(chapter => {
                    const patchedChapter = { ...chapter };
                    if (chapter.paragraphs) {
                        patchedChapter.paragraphs = chapter.paragraphs.map(para => {
                            const patchedPara = { ...para };
                            if (para.notions) {
                                patchedPara.notions = para.notions.map(notion => {
                                    const cachedNotion = localContentCacheRef.current[notion.notion_id];
                                    if (cachedNotion !== undefined) {
                                        return { ...notion, notion_content: cachedNotion };
                                    }
                                    return notion;
                                });
                            }
                            return patchedPara;
                        });
                    }
                    return patchedChapter;
                });
            }
            return patchedPart;
        });
    }, []);

    const fetchComments = useCallback(async () => {
        if (!projectName) return;
        try {
            setIsFetchingComments(true);
            const data = await commentService.getComments(projectName);
            setComments(data);
        } catch (err) {
            console.error("Erreur fetch comments:", err);
        } finally {
            setIsFetchingComments(false);
        }
    }, [projectName]);

    const loadProject = useCallback(async (isSilent = false) => {
        if (!projectName) return;
        try {
            if (!isSilent) setIsLoading(true);
            setError('');

            const project = await projectService.getProjectByName(projectName);
            setProjectData(project);
            setLikes(0);

            fetchComments();

            const rawParts = await structureService.getProjectStructureOptimized(project.pr_name);

            // ✅ APPLICATION DE LA RÈGLE D'OR : Fusion déterministe
            const patchedParts = patchStructureWithCache(rawParts);
            setStructure(patchedParts);

            if (!isSilent) setIsLoading(false);
        } catch (err: any) {
            if (err.message && err.message.includes('Token invalide ou expiré')) {
                toast.error('⚠️ Votre session a expiré. Veuillez vous reconnecter.');
                window.location.href = '/login';
                return;
            }
            setError(err.message || 'Erreur lors du chargement du projet');
            if (!isSilent) setIsLoading(false);
        }
    }, [projectName, fetchComments, patchStructureWithCache]);

    const handleUpdateProjectSettings = async (data: Partial<Project>, router: any) => {
        if (!projectData || !projectName) return;
        try {
            if (data.pr_name && data.pr_name !== projectName) {
                lastRenamedTo.current = data.pr_name;
            }

            const updated = await projectService.updateProject(projectName, data);
            setProjectData(updated);

            if (data.pr_name && data.pr_name !== projectName) {
                const newUrl = window.location.pathname + '?projectName=' + encodeURIComponent(data.pr_name);
                window.history.replaceState(null, '', newUrl);
                router.replace(`/edit?projectName=${encodeURIComponent(data.pr_name)}`);
                toast.success("Projet renommé avec succès");
            } else {
                toast.success("Paramètres mis à jour");
            }
        } catch (err: any) {
            toast.error("Erreur mise à jour: " + err.message);
            lastRenamedTo.current = null;
        }
    };

    const handleToggleLike = async () => {
        if (!projectData) return;
        const previousLikes = likes;
        const previousIsLiked = isLiked;

        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        setIsLiked(prev => !prev);

        try {
            const result = await projectService.toggleLike(projectData.pr_name);
            setLikes(result.likes);
            setIsLiked(result.isLiked);
        } catch (err) {
            setLikes(previousLikes);
            setIsLiked(previousIsLiked);
            toast.error("Erreur lors du like");
        }
    };

    return {
        projectData, setProjectData,
        comments, setComments,
        isFetchingComments,
        structure, setStructure,
        isLoading, setIsLoading,
        isSaving, setIsSaving,
        isImporting, setIsImporting,
        error, setError,
        currentContext, setCurrentContext,
        editorContent, setEditorContent,
        hasUnsavedChanges, setHasUnsavedChanges,
        likes, setLikes,
        isLiked, setIsLiked,
        textFormat, setTextFormat,
        fetchComments,
        loadProject,
        lastRenamedTo,
        localContentCacheRef,
        activeDocIdRef,
        patchStructureWithCache,
        handleUpdateProjectSettings,
        handleToggleLike
    };
};
