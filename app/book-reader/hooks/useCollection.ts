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
    const [includeChildren, setIncludeChildren] = useState(true);

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
        setIncludeChildren(true); // Default to recursive
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
                source_doc_name: currentDoc.doc_name,
                content: collectedGranule.notion_content || collectedGranule.part_intro || ''
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
            const projectName = (selectedProject as Project).pr_name;
            const findPart = () => navigationPath.find(i => i.type === 'part');
            const findChapter = () => navigationPath.find(i => i.type === 'chapter');
            const findPara = () => navigationPath.find(i => i.type === 'paragraph');

            const partInPath = findPart();
            const chapterInPath = findChapter();
            const paraInPath = findPara();

            if (collectedGranule.type === 'part') {
                const nextPartNum = (projectStructure?.length || 0) + 1;
                const newPart = await structureService.createPart(projectName, {
                    part_title: collectedGranule.title,
                    part_number: nextPartNum,
                    part_intro: collectedGranule.part_intro || ''
                });

                if (includeChildren && collectedGranule.chapters) {
                    for (let i = 0; i < collectedGranule.chapters.length; i++) {
                        const chapter = collectedGranule.chapters[i];
                        const newChapter = await structureService.createChapter(projectName, newPart.part_title, {
                            chapter_title: chapter.chapter_title,
                            chapter_number: i + 1
                        });
                        await recurseChapter(newPart.part_title, newChapter.chapter_title, chapter);
                    }
                }
            } else if (collectedGranule.type === 'chapter') {
                const partObj = projectStructure?.find(p => p.part_id === parentId);
                const nextChapNum = (partObj?.chapters?.length || 0) + 1;

                const newChapter = await structureService.createChapter(projectName, parentTitle, {
                    chapter_title: collectedGranule.title,
                    chapter_number: nextChapNum
                });

                if (includeChildren && collectedGranule.paragraphs) {
                    await recurseChapter(parentTitle, newChapter.chapter_title, collectedGranule);
                }
            } else if (collectedGranule.type === 'paragraph') {
                const partTitle = partInPath?.part_title || '';
                const partObj = projectStructure?.find(p => p.part_title === partTitle);
                const chapObj = partObj?.chapters?.find(c => c.chapter_id === parentId);
                const nextParaNum = (chapObj?.paragraphs?.length || 0) + 1;

                const newPara = await structureService.createParagraph(projectName, partTitle, parentTitle, {
                    para_name: collectedGranule.title,
                    para_number: nextParaNum
                });

                if (includeChildren && collectedGranule.notions) {
                    await recurseParagraph(partTitle, parentTitle, newPara.para_name, collectedGranule);
                }
            } else if (collectedGranule.type === 'notion') {
                const partTitle = partInPath?.part_title || '';
                const chapTitle = chapterInPath?.chapter_title || '';
                const partObj = projectStructure?.find(p => p.part_title === partTitle);
                const chapObj = partObj?.chapters?.find(c => c.chapter_title === chapTitle);
                const paraObj = chapObj?.paragraphs?.find(p => p.para_id === parentId);
                const nextNotionNum = (paraObj?.notions?.length || 0) + 1;

                await structureService.createNotion(projectName, partTitle, chapTitle, parentTitle, {
                    notion_name: collectedGranule.title,
                    notion_content: collectedGranule.content || collectedGranule.notion_content || '',
                    notion_number: nextNotionNum
                });
            }

            async function recurseChapter(pTitle: string, cTitle: string, chapData: any) {
                if (!chapData.paragraphs) return;
                for (let j = 0; j < chapData.paragraphs.length; j++) {
                    const para = chapData.paragraphs[j];
                    const newPara = await structureService.createParagraph(projectName!, pTitle, cTitle, {
                        para_name: para.para_name,
                        para_number: j + 1
                    });
                    await recurseParagraph(pTitle, cTitle, newPara.para_name, para);
                }
            }

            async function recurseParagraph(pTitle: string, cTitle: string, paName: string, paraData: any) {
                if (!paraData.notions) return;
                for (let k = 0; k < paraData.notions.length; k++) {
                    const notion = paraData.notions[k];
                    await structureService.createNotion(projectName!, pTitle, cTitle, paName, {
                        notion_name: notion.notion_name,
                        notion_content: notion.notion_content || '',
                        notion_number: k + 1
                    });
                }
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
        includeChildren,
        setIncludeChildren,
        handleCollect,
        confirmCollectToVault,
        handleSelectProject,
        handleNavigateIn,
        handleNavigateBack,
        confirmCollectToProject
    };
};
