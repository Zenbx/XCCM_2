import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { vaultService } from '@/services/vaultService';
import { projectService, Project } from '@/services/projectService';
import { structureService, Part } from '@/services/structureService';

export const useCollection = (docId: string | null, currentDoc: any) => {
    const [showCollectModal, setShowCollectModal] = useState(false);
    const [collectedGranule, setCollectedGranule] = useState<any>(null);

    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectStructure, setProjectStructure] = useState<Part[] | null>(null);

    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isLoadingStructure, setIsLoadingStructure] = useState(false);
    const [isInserting, setIsInserting] = useState(false);

    const [modalStep, setModalStep] = useState<'type' | 'project' | 'navigate'>('type');
    const [navigationPath, setNavigationPath] = useState<any[]>([]);

    const fetchMyProjects = useCallback(async () => {
        try {
            setIsLoadingProjects(true);
            const projects = await projectService.getAllProjects();
            setMyProjects(projects);
        } catch (err) {
            console.error("Error fetching projects", err);
        } finally {
            setIsLoadingProjects(false);
        }
    }, []);

    const handleCollect = (granule: any) => {
        setCollectedGranule(granule);
        setShowCollectModal(true);
        fetchMyProjects();
    };

    const confirmCollectToVault = async () => {
        if (!collectedGranule || !currentDoc) return;
        try {
            await vaultService.addToVault({
                type: collectedGranule.type,
                title: collectedGranule.title,
                original_id: collectedGranule.id,
                source_doc_id: currentDoc.doc_id,
                source_doc_name: currentDoc.doc_name
            });
            toast.success(`Granule "${collectedGranule.title}" ajouté au coffre-fort !`);
            setShowCollectModal(false);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'ajout au coffre-fort");
        }
    };

    const handleSelectProject = async (project: Project) => {
        setSelectedProject(project);
        setModalStep('navigate');
        setNavigationPath([]);
        setIsLoadingStructure(true);
        try {
            // Fix: Call method on instance instead of imported named function
            const structure = await structureService.getProjectStructureOptimized(project.pr_name);
            setProjectStructure(structure);
        } catch (err) {
            toast.error("Erreur lors du chargement de la structure");
        } finally {
            setIsLoadingStructure(false);
        }
    };

    const handleNavigateIn = (item: any, type: string) => {
        setNavigationPath(prev => [...prev, { ...item, type }]);
    };

    const handleNavigateBack = () => {
        setNavigationPath(prev => prev.slice(0, -1));
    };

    const confirmCollectToProject = async (parentId: string, parentTitle: string) => {
        if (!collectedGranule || !selectedProject) return;
        setIsInserting(true);
        try {
            const projectName = selectedProject.pr_name;
            const findPartTitle = () => navigationPath.find(i => i.type === 'part')?.part_title || '';
            const findChapterTitle = () => navigationPath.find(i => i.type === 'chapter')?.chapter_title || '';

            if (collectedGranule.type === 'part') {
                await structureService.createPart(projectName, {
                    part_title: collectedGranule.title,
                    part_number: (projectStructure?.length || 0) + 1
                });
            } else if (collectedGranule.type === 'chapter') {
                await structureService.createChapter(projectName, parentTitle, {
                    chapter_title: collectedGranule.title,
                    chapter_number: 1
                });
            } else if (collectedGranule.type === 'paragraph') {
                await structureService.createParagraph(projectName, findPartTitle(), parentTitle, {
                    para_name: collectedGranule.title,
                    para_number: 1
                });
            } else if (collectedGranule.type === 'notion') {
                await structureService.createNotion(projectName, findPartTitle(), findChapterTitle(), parentTitle, {
                    notion_name: collectedGranule.title,
                    notion_content: collectedGranule.content || '',
                    notion_number: 1
                });
            }

            toast.success(`Granule "${collectedGranule.title}" inséré !`);
            setShowCollectModal(false);
            setModalStep('type');
            setSelectedProject(null);
            setNavigationPath([]);
        } catch (err: any) {
            toast.error(err.message || "Erreur d'insertion");
        } finally {
            setIsInserting(false);
        }
    };

    return {
        showCollectModal, setShowCollectModal,
        collectedGranule,
        myProjects,
        selectedProject,
        projectStructure,
        isLoadingProjects,
        isLoadingStructure,
        isInserting,
        modalStep, setModalStep,
        navigationPath,
        setNavigationPath,
        handleCollect,
        confirmCollectToVault,
        handleSelectProject,
        handleNavigateIn,
        handleNavigateBack,
        confirmCollectToProject
    };
};
