import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { documentService, DocumentWithStructure } from '@/services/documentService';

export const useReaderState = (docId: string | null) => {
    const [data, setData] = useState<DocumentWithStructure | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [tocOpen, setTocOpen] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('');
    const [fontSize, setFontSize] = useState(18);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
    const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Social
    const [likesCount, setLikesCount] = useState(0);
    const [userLiked, setUserLiked] = useState(false);

    const recordView = useCallback(async () => {
        if (!docId) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${docId}/view`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error("Error recording view", error);
        }
    }, [docId]);

    const fetchDocument = useCallback(async () => {
        if (!docId) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await documentService.getDocumentById(docId);
            setData(result);

            // Expand all parts by default
            const partsExpanded: Record<string, boolean> = {};
            const chaptersExpanded: Record<string, boolean> = {};
            result.structure.forEach((part) => {
                partsExpanded[part.part_id] = true;
                part.chapters.forEach((chapter) => {
                    chaptersExpanded[chapter.chapter_id] = true;
                });
            });
            setExpandedParts(partsExpanded);
            setExpandedChapters(chaptersExpanded);

            if (result.structure.length > 0) {
                setActiveSection(result.structure[0].part_id);
            }

            setLikesCount(result.document.likes || 0);
            setUserLiked(!!result.document.isLiked);
        } catch (err: any) {
            setError(err.message || "Impossible de charger le document.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [docId]);

    const handleToggleLike = async () => {
        if (!docId) return;
        const prevLiked = userLiked;
        const prevCount = likesCount;

        setUserLiked(!prevLiked);
        setLikesCount(prev => (prevLiked ? prev - 1 : prev + 1));

        try {
            const result = await documentService.toggleLike(docId);
            setLikesCount(result.likes);
            setUserLiked(result.isLiked);
            if (result.isLiked) toast.success("Document ajouté à vos favoris !");
        } catch (err) {
            setUserLiked(prevLiked);
            setLikesCount(prevCount);
            toast.error('Erreur lors du like');
        }
    };

    const handleDownload = async () => {
        if (!docId) return;
        try {
            setIsDownloading(true);
            const { url, doc_name } = await documentService.downloadDocument(docId);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc_name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Téléchargement lancé !");
        } catch (err) {
            toast.error('Erreur lors du téléchargement');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Lien copié !");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return {
        data, isLoading, error,
        tocOpen, setTocOpen,
        activeSection, setActiveSection,
        fontSize, setFontSize,
        isBookmarked, setIsBookmarked,
        expandedParts, setExpandedParts,
        expandedChapters, setExpandedChapters,
        isDownloading,
        copied,
        likesCount, userLiked,
        fetchDocument, recordView,
        handleToggleLike, handleDownload, handleShare
    };
};
