"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    FileText,
    Printer,
    Check,
    Loader2,
    File,
    Share2,
    Globe,
    Lock,
    Eye,
    MoreVertical,
    Save,
    Archive,
    FolderPlus,
    X,
    Box,
    ChevronDown,
    AlertCircle,
    Info,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/projectService';
import { structureService, Part } from '@/services/structureService';
import { publishService } from '@/services/publishService';
import { exportService } from '@/services/exportService';
import { templateService } from '@/services/templateService';
import toast from 'react-hot-toast';
import { renderBlockContent } from '@/utils/block-renderer';
import * as katex from 'katex';
import 'katex/dist/katex.min.css';

const PreviewPage = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectName = searchParams.get('projectName');

    const [structure, setStructure] = useState<Part[]>([]);
    const [projectData, setProjectData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showPublishMenu, setShowPublishMenu] = useState(false);
    const [showFormatDialog, setShowFormatDialog] = useState(false);
    const [publishFormat, setPublishFormat] = useState<'pdf' | 'docx'>('pdf');
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState<{ doc_id: string; doc_name: string } | null>(null);
    const [snapshotName, setSnapshotName] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');

    // Template States
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [templateData, setTemplateData] = useState({ name: '', description: '', category: '' });
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

    // Publication Metadata States
    const [publishCategory, setPublishCategory] = useState('');
    const [publishLevel, setPublishLevel] = useState('');
    const [publishTags, setPublishTags] = useState('');
    const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);
    const [localCoverPreview, setLocalCoverPreview] = useState<string | null>(null);

    // Determine ownership
    const isOwner = projectData?.owner_id && user?.user_id && projectData.owner_id === user.user_id;

    // Phase 3: Marketplace & Vault States
    const [showCollectModal, setShowCollectModal] = useState(false);
    const [collectedGranule, setCollectedGranule] = useState<any>(null);

    const handleCollect = (granule: any) => {
        setCollectedGranule(granule);
        setShowCollectModal(true);
    };

    const confirmCollectToVault = () => {
        // Logic to save to vault
        toast.success(`Granule "${collectedGranule?.title}" ajouté à votre coffre-fort !`);
        setShowCollectModal(false);
    };

    const confirmCollectToProject = (targetProject: string) => {
        // Logic to insert into project
        toast.success(`Granule "${collectedGranule?.title}" inséré dans le projet ${targetProject}.`);
        setShowCollectModal(false);
    };

    // State for granular loading
    const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);

    const getCssFromStyleConfig = (config: any) => {
        if (!config) return '';
        let css = '';
        if (config.fontFamily) css += `font-family: "${config.fontFamily}", sans-serif !important; `;
        if (config.fontSize) css += `font-size: ${config.fontSize}px !important; `;
        if (config.color) css += `color: ${config.color} !important; `;
        if (config.fontWeight) css += `font-weight: ${config.fontWeight} !important; `;
        if (config.fontStyle) css += `font-style: ${config.fontStyle} !important; `;
        return css;
    };

    const getStyleObject = (config: any) => {
        if (!config) return {};
        return {
            fontFamily: config.fontFamily || 'inherit',
            fontSize: config.fontSize ? `${config.fontSize}px` : 'inherit',
            color: config.color || 'inherit',
            fontWeight: config.fontWeight || 'inherit',
            fontStyle: config.fontStyle || 'inherit'
        };
    };

    useEffect(() => {
        if (projectName) {
            loadProject();
            setSnapshotName(projectName);
        }
    }, [projectName]);

    const loadProject = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Project Info (to get styles)
            const project = await projectService.getProjectByName(projectName!);
            setProjectData(project);

            // 2. Fetch Full Structure (Optimized)
            // Replace recursive manual fetching with single API call
            const fullStructure = await structureService.getProjectStructureOptimized(projectName!);

            setStructure(fullStructure);
            setLoadingProgress({ current: 100, total: 100 });

            // Initialize publication metadata from project data
            if (project.category) setPublishCategory(project.category);
            if (project.level) setPublishLevel(project.level);
            if (project.tags) setPublishTags(project.tags);
            if (project.cover_image) setCoverImageUrl(project.cover_image);

        } catch (err) {
            console.error(err);
        } finally {
            // Small delay to let animation finish if needed
            setTimeout(() => {
                setIsLoading(false);
                setLoadingProgress(null);
            }, 600);
        }
    };

    const handleLocalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalCoverPreview(reader.result as string);
                setCoverImageUrl(''); // URL takes precedence if empty, but here we want to show local
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublishOnline = async () => {
        if (!projectName) return;

        setIsPublishing(true);
        setShowPublishMenu(false);

        try {
            // If we have a local file, we might need a separate upload step 
            // but for now we pass the base64 preview or the service handles it.
            // Assuming publishProject accepts the coverImage as a string (URL or Base64) 
            // or we'd need to update the service to handle FormData.
            // Let's use the preview (Base64) for simplicity if no URL is provided.
            const finalCover = coverImageUrl || localCoverPreview || '';

            const result = await publishService.publishProject(
                projectName,
                publishFormat,
                snapshotName,
                finalCover,
                publishCategory,
                publishLevel,
                publishTags
            );

            setPublishSuccess({
                doc_id: result.doc_id,
                doc_name: result.doc_name
            });
            toast.success("Publication réussie !");
            setShowFormatDialog(false);
        } catch (error: any) {
            console.error('Erreur lors de la publication:', error);
            // Handle duplicate name error specifically
            if (error.message?.includes('déjà utilisé') || error.message?.includes('snapshot') || error.message?.includes('409')) {
                toast.error("Ce nom de snapshot est déjà utilisé. Veuillez en choisir un autre.");
            } else {
                toast.error(`Erreur lors de la publication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
        } finally {
            setIsPublishing(false);
        }
    };

    const handleExportProjectPDF = async () => {
        if (!projectName) return;

        setIsExporting(true);
        setShowPublishMenu(false);

        try {
            await exportService.exportAndDownload(projectName, 'pdf');
            toast.success("Export PDF réussi !");
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            toast.error(`Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportProjectDOCX = async () => {
        if (!projectName) return;

        setIsExporting(true);
        setShowPublishMenu(false);

        try {
            await exportService.exportAndDownload(projectName, 'docx');
            toast.success("Export DOCX réussi !");
        } catch (error) {
            console.error('Erreur lors de l\'export DOCX:', error);
            toast.error(`Erreur lors de l'export DOCX: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!projectName) return;
        if (!templateData.name.trim()) {
            toast.error('Le nom du template est requis');
            return;
        }

        setIsCreatingTemplate(true);

        try {
            await templateService.convertProjectToTemplate(projectName, {
                template_name: templateData.name,
                description: templateData.description,
                category: templateData.category || projectData?.category,
                is_public: true
            });

            toast.success('Template créé avec succès !');
            setShowTemplateDialog(false);
            setTemplateData({ name: '', description: '', category: '' });
        } catch (error: any) {
            console.error('Erreur lors de la création du template:', error);
            toast.error(error.message || 'Erreur lors de la création du template');
        } finally {
            setIsCreatingTemplate(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        setShowPublishMenu(false);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            // Créer une iframe complètement isolée
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.top = '0';
            iframe.style.width = '210mm';
            iframe.style.height = '297mm';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) throw new Error('Impossible de créer l\'iframe');

            // Générer le HTML complet avec CSS inline uniquement
            const htmlContent = generatePrintableHTML();

            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            // Attendre que le contenu soit rendu
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Récupérer toutes les pages individuellement
            const pages = iframeDoc.querySelectorAll('.page');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;

                // Capturer chaque page séparément
                const canvas = await html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 794
                });

                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Ajouter une nouvelle page PDF (sauf pour la première)
                if (i > 0) {
                    pdf.addPage();
                }

                // Si le contenu dépasse une page A4, le découper
                if (imgHeight > 277) {
                    let position = 0;
                    const pageHeight = 277;
                    let isFirstPart = true;

                    while (position < imgHeight) {
                        if (!isFirstPart) {
                            pdf.addPage();
                        }

                        pdf.addImage(
                            canvas.toDataURL('image/jpeg', 0.98),
                            'JPEG',
                            10,
                            10 - position,
                            imgWidth,
                            imgHeight
                        );

                        position += pageHeight;
                        isFirstPart = false;
                    }
                } else {
                    // Le contenu tient sur une page
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', 0.98),
                        'JPEG',
                        10,
                        10,
                        imgWidth,
                        imgHeight
                    );
                }
            }

            pdf.save(`${projectName || 'document'}.pdf`);
            document.body.removeChild(iframe);
            toast.success("PDF généré avec succès !");

        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            toast.error('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    };

    const generatePrintableHTML = () => {
        const css = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background-color: rgb(243, 244, 246);
                    padding: 48px;
                    color: rgb(17, 24, 39);
                    line-height: 1.5;
                }
                .page {
                    background-color: rgb(255, 255, 255);
                    border-radius: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgb(229, 231, 235);
                    padding: 48px;
                    margin-bottom: 32px;
                    min-height: 842px;
                    page-break-after: always;
                }
                .title-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .title-bar {
                    width: 96px;
                    height: 4px;
                    background-color: rgb(153, 51, 76);
                    margin-bottom: 32px;
                }
                h1 {
                    font-size: 48px;
                    font-weight: 700;
                    color: rgb(17, 24, 39);
                    margin-bottom: 24px;
                    letter-spacing: -0.025em;
                }
                .subtitle {
                    font-size: 20px;
                    color: rgb(107, 114, 128);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 300;
                }
                .title-footer {
                    margin-top: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: rgb(153, 51, 76);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgb(255, 255, 255);
                    margin-bottom: 16px;
                    font-size: 24px;
                }
                .footer-text {
                    color: rgb(156, 163, 175);
                    font-size: 14px;
                }
                .footer-date {
                    color: rgb(156, 163, 175);
                    font-size: 12px;
                    margin-top: 4px;
                }
                .part-header {
                    margin-bottom: 48px;
                    border-bottom: 1px solid rgb(243, 244, 246);
                    padding-bottom: 24px;
                }
                .part-label {
                    color: rgb(153, 51, 76);
                    background-color: rgba(153, 51, 76, 0.1);
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 14px;
                    display: inline-block;
                    margin-bottom: 16px;
                }
                h2 {
                    font-size: 36px;
                    font-weight: 700;
                    color: rgb(17, 24, 39);
                    margin-top: 8px;
                    ${getCssFromStyleConfig(projectData?.styles?.part?.title)}
                }
                .part-intro {
                    margin-bottom: 48px;
                    font-size: 18px;
                    color: rgb(75, 85, 99);
                    line-height: 1.8;
                    font-style: italic;
                    border-left: 4px solid rgba(153, 51, 76, 0.2);
                    padding-left: 24px;
                    ${getCssFromStyleConfig(projectData?.styles?.part?.intro)}
                }
                h3 {
                    font-size: 30px;
                    font-weight: 700;
                    color: rgb(17, 24, 39);
                    margin-bottom: 32px;
                    margin-top: 48px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    ${getCssFromStyleConfig(projectData?.styles?.chapter?.title)}
                }
                .chapter-number {
                    color: rgb(153, 51, 76);
                    opacity: 0.5;
                    font-weight: 400;
                }
                .chapter-content {
                    padding-left: 16px; /* Reduced indentation */
                }
                .paragraph {
                    margin-bottom: 40px;
                }
                h4 {
                    font-size: 24px;
                    font-weight: 700;
                    color: rgb(31, 41, 55);
                    margin-bottom: 24px;
                }
                h5 {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: rgb(107, 114, 128);
                    font-weight: 700;
                    margin-bottom: 12px;
                    border-bottom: 1px solid rgb(243, 244, 246);
                    display: inline-block;
                    padding-bottom: 4px;
                }
                .notion-content {
                    font-size: 18px; /* 1.125rem */
                    line-height: 1.8;
                    color: rgb(55, 65, 81); /* text-gray-700 */
                    margin-bottom: 32px;
                }
                .notion-content p {
                    margin-bottom: 16px;
                }
                .notion-content strong {
                    font-weight: 600;
                    color: rgb(17, 24, 39);
                }
                .notion-content h1, .notion-content h2, .notion-content h3 {
                     margin-top: 24px;
                     margin-bottom: 16px;
                     font-weight: 700;
                     color: rgb(17, 24, 39);
                }
                .notion-content ul, .notion-content ol {
                    margin-left: 24px;
                    margin-bottom: 16px;
                }
                .notion-content li {
                    margin-bottom: 8px;
                }
                .notion-content a {
                    color: rgb(153, 51, 76);
                    text-decoration: underline;
                }
                .notion-content blockquote {
                    border-left: 4px solid rgb(229, 231, 235);
                    padding-left: 16px;
                    color: rgb(75, 85, 99);
                    font-style: italic;
                    margin-bottom: 16px;
                }

                /* TOC Styles */
                .toc-page {
                    padding: 48px;
                }
                .toc-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: rgb(153, 51, 76);
                    margin-bottom: 32px;
                    border-bottom: 2px solid rgba(153, 51, 76, 0.1);
                    padding-bottom: 16px;
                }
                .toc-list {
                    list-style: none;
                }
                .toc-item-part {
                    font-size: 18px;
                    font-weight: 700;
                    margin-top: 24px;
                    color: rgb(17, 24, 39);
                }
                .toc-item-chapter {
                    font-size: 16px;
                    margin-left: 24px;
                    margin-top: 8px;
                    color: rgb(75, 85, 99);
                }
                .toc-link {
                    text-decoration: none;
                    color: inherit;
                }

                /* Pedagogical Blocks Styling */
                .note-block {
                    background: #fdf2f4;
                    border-left: 4px solid #99334C;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    border-radius: 0 8px 8px 0;
                }
                .note-block-header {
                    font-weight: bold;
                    color: #99334C;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .math-block {
                    display: flex;
                    justify-content: center;
                    margin: 2rem 0;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .discovery-hint {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    overflow: hidden;
                }
                .discovery-hint-header {
                    background: #f8fafc;
                    padding: 0.75rem 1rem;
                    font-weight: bold;
                    color: #475569;
                    font-size: 0.9rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .discovery-hint-content {
                    padding: 1rem;
                }
            </style>
        `;

        let bodyContent = '';

        // Page de titre
        bodyContent += `
            <div class="page title-page">
                <div class="title-bar"></div>
                ${coverImageUrl ? `<img src="${coverImageUrl}" style="max-width: 100%; max-height: 300px; object-fit: contain; margin-bottom: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />` : ''}
                <h1>${projectName?.toUpperCase() || 'DOCUMENT'}</h1>
                <p class="subtitle">Document de Composition</p>
                <div class="title-footer">
                    <div class="icon-circle">${coverImageUrl ? '�️' : '�📄'}</div>
                    <p class="footer-text">Généré par XCCM 2</p>
                    <p class="footer-date">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        `;

        // Table des matières
        if (structure.length > 0) {
            bodyContent += `
                <div class="page toc-page">
                    <h2 class="toc-title">Table des Matières</h2>
                    <div class="toc-list">
                        ${structure.map((part, pIdx) => `
                            <div class="toc-item-part">
                                <a href="#part-${pIdx}" class="toc-link">Partie ${pIdx + 1}: ${part.part_title}</a>
                            </div>
                            ${part.chapters?.map((chap, cIdx) => `
                                <div class="toc-item-chapter">
                                    <a href="#part-${pIdx}-chap-${cIdx}" class="toc-link">${chap.chapter_title}</a>
                                </div>
                            `).join('') || ''}
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Contenu
        if (structure.length === 0) {
            bodyContent += `
                <div class="page" style="display: flex; align-items: center; justify-content: center;">
                    <p style="color: rgb(107, 114, 128); font-style: italic;">Ce cours est vide pour le moment.</p>
                </div>
            `;
        } else {
            structure.forEach((part, partIndex) => {
                bodyContent += `<div class="page" id="part-${partIndex}">`;
                bodyContent += `
                    <div class="part-header">
                        <span class="part-label">Partie ${partIndex + 1}</span>
                        <h2>${part.part_title}</h2>
                    </div>
                `;

                if (part.part_intro) {
                    bodyContent += `<div class="part-intro">${part.part_intro}</div>`;
                }

                part.chapters?.forEach((chapter, chapIndex) => {
                    bodyContent += `
                        <h3 id="part-${partIndex}-chap-${chapIndex}">
                            <span class="chapter-number">#</span>
                            ${chapter.chapter_title}
                        </h3>
                        <div class="chapter-content">
                    `;

                    chapter.paragraphs?.forEach((para: any) => {
                        bodyContent += `
                            <div class="paragraph">
                                <h4>
                                    ${para.para_name}
                                </h4>
                        `;

                        para.notions?.forEach((notion: any) => {
                            if (notion.notion_name) {
                                bodyContent += `<h5>${notion.notion_name}</h5>`;
                            }
                            bodyContent += `<div class="notion-content">${renderBlockContent(notion.notion_content || '')}</div>`;
                        });

                        bodyContent += `</div>`;
                    });

                    bodyContent += `</div>`;
                });

                bodyContent += `</div>`;
            });
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${css}
            </head>
            <body>${bodyContent}</body>
            </html>
        `;
    };

    const handlePrint = () => {
        window.print();
        setShowPublishMenu(false);
    };

    const handleExportWord = () => {
        const content = document.getElementById('printable-content')?.innerHTML;
        if (!content) return;

        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Export Word</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; padding: 40px; }
                h1 { color: #99334C; font-size: 24pt; border-bottom: 2px solid #99334C; }
                h2 { color: #333; font-size: 20pt; page-break-before: always; border-bottom: 1px solid #eee; margin-top: 30pt; }
                h3 { color: #444; font-size: 16pt; margin-top: 20pt; }
                h4 { color: #555; font-size: 14pt; font-weight: bold; }
            </style>
            </head><body>
        `;
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${projectName || 'document'}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
        setShowPublishMenu(false);
    };

    if (isLoading) {
        // Calcul du pourcentage
        const progress = loadingProgress && loadingProgress.total > 0
            ? Math.round((loadingProgress.current / loadingProgress.total) * 100)
            : 0;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/95 backdrop-blur-sm">
                <div className="relative w-[210mm] h-[297mm] bg-white shadow-2xl rounded-sm overflow-hidden transform scale-[0.25] md:scale-[0.35] lg:scale-[0.45] transition-transform origin-center flex flex-col items-center justify-center text-center ring-1 ring-gray-200">

                    {/* Contenu statique de la page de garde (Le "Dessous") */}
                    <div className="w-full h-full flex flex-col items-center justify-center p-24">
                        <div className="w-32 h-2 bg-[#99334C] mb-12"></div>
                        <h1 className="text-7xl font-black text-gray-900 mb-8 tracking-tight">
                            {projectName?.toUpperCase() || 'CHARGEMENT'}
                        </h1>
                        <p className="text-2xl text-gray-500 uppercase tracking-widest font-light">Document de Composition</p>

                        <div className="mt-32 flex flex-col items-center animate-pulse">
                            <div className="w-20 h-20 rounded-full bg-[#99334C] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#99334C]/30">
                                <FileText size={40} />
                            </div>
                            <p className="text-gray-400 font-medium">Génération en cours...</p>
                        </div>
                    </div>

                    {/* Masque blanc qui "glisse" vers le haut (Le "Dessus") */}
                    <div
                        className="absolute inset-0 bg-white z-10 transition-all duration-700 ease-in-out border-b-4 border-[#99334C]"
                        style={{ height: `${100 - progress}%` }}
                    />

                    {/* Indicateur de progression (au dessus de tout) */}
                    <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-2">
                        <p className="text-[#99334C] font-bold text-xl">{progress}%</p>
                        <p className="text-gray-400 text-sm">
                            {loadingProgress
                                ? `Chargement de la partie ${loadingProgress.current} sur ${loadingProgress.total}`
                                : 'Initialisation...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        title="Retour à l'éditeur"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#99334C] to-[#DC3545]">
                        {projectName} <span className="text-gray-400 font-normal text-sm ml-2">(Aperçu)</span>
                    </h1>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowPublishMenu(!showPublishMenu)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                    >
                        Options
                        <ChevronDown size={16} className={`transition-transform ${showPublishMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showPublishMenu && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Options de publication</h3>
                                <p className="text-xs text-gray-500 mt-1">Choisissez comment diffuser votre cours</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => setShowFormatDialog(true)}
                                    disabled={isPublishing || !isOwner}
                                    title={!isOwner ? "Seul le propriétaire peut publier ce projet" : ""}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group text-left disabled:opacity-50 ${!isOwner ? 'cursor-not-allowed bg-gray-50' : 'hover:bg-[#99334C]/5'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!isOwner ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                        {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {isPublishing ? 'Publication...' : 'Publier en ligne'}
                                        </div>
                                        <div className="text-xs text-gray-500">Rendre accessible via lien public</div>
                                        {!isOwner && <div className="text-[10px] text-red-500 font-medium">Réservé au propriétaire</div>}
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportProjectPDF}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left disabled:opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {isExporting ? 'Génération...' : 'Exporter en PDF'}
                                        </div>
                                        <div className="text-xs text-gray-500">Téléchargement direct</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportProjectDOCX}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left disabled:opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <File size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {isExporting ? 'Génération...' : 'Exporter en DOCX'}
                                        </div>
                                        <div className="text-xs text-gray-500">Format éditable .docx</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                        <Printer size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Imprimer</div>
                                        <div className="text-xs text-gray-500">Lancer l'impression locale</div>
                                    </div>
                                </button>

                                <div className="border-t border-gray-100 my-2"></div>

                                <button
                                    onClick={() => { setShowTemplateDialog(true); setShowPublishMenu(false); }}
                                    disabled={!isOwner}
                                    title={!isOwner ? "Seul le propriétaire peut publier comme template" : ""}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group text-left ${!isOwner ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-[#99334C]/5'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!isOwner ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                                        <FolderPlus size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Publier en tant que template</div>
                                        <div className="text-xs text-gray-500">Réutilisable pour de nouveaux projets</div>
                                        {!isOwner && <div className="text-[10px] text-red-500 font-medium">Réservé au propriétaire</div>}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Format Selection Dialog */}
            {showFormatDialog && (
                <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choisir le format de publication</h2>
                        <p className="text-gray-600 text-sm mb-6">Sélectionnez le format dans lequel vous souhaitez publier votre document.</p>

                        <div className="max-h-[60vh] overflow-y-auto px-1 -mx-1 custom-scrollbar space-y-4">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">Format de publication</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all"
                                        style={{ borderColor: publishFormat === 'pdf' ? '#99334C' : '#e5e7eb', backgroundColor: publishFormat === 'pdf' ? '#99334c0a' : 'transparent' }}>
                                        <input
                                            type="radio"
                                            name="format"
                                            value="pdf"
                                            checked={publishFormat === 'pdf'}
                                            onChange={(e) => setPublishFormat(e.target.value as 'pdf' | 'docx')}
                                            className="mr-3"
                                        />
                                        <div className="font-medium text-gray-900 border-none">PDF</div>
                                    </label>

                                    <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all"
                                        style={{ borderColor: publishFormat === 'docx' ? '#99334C' : '#e5e7eb', backgroundColor: publishFormat === 'docx' ? '#99334c0a' : 'transparent' }}>
                                        <input
                                            type="radio"
                                            name="format"
                                            value="docx"
                                            checked={publishFormat === 'docx'}
                                            onChange={(e) => setPublishFormat(e.target.value as 'pdf' | 'docx')}
                                            className="mr-3"
                                        />
                                        <div className="font-medium text-gray-900 border-none">DOCX</div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <FileText size={14} className="text-[#99334C]" />
                                    Nom de la version
                                </label>
                                <input
                                    type="text"
                                    value={snapshotName}
                                    onChange={(e) => setSnapshotName(e.target.value)}
                                    placeholder="ex: Édition finale 2024"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Catégorie
                                    </label>
                                    <input
                                        type="text"
                                        value={publishCategory}
                                        onChange={(e) => setPublishCategory(e.target.value)}
                                        placeholder="Ex: Biologie"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Niveau
                                    </label>
                                    <input
                                        type="text"
                                        value={publishLevel}
                                        onChange={(e) => setPublishLevel(e.target.value)}
                                        placeholder="Ex: Terminale S"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    Tags (séparés par virgules)
                                </label>
                                <input
                                    type="text"
                                    value={publishTags}
                                    onChange={(e) => setPublishTags(e.target.value)}
                                    placeholder="physique, optique, bac"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image de couverture</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={coverImageUrl}
                                        onChange={(e) => { setCoverImageUrl(e.target.value); setLocalCoverPreview(null); }}
                                        placeholder="URL de l'image (https://...)"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                                    />

                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#99334C]/30 hover:bg-[#99334C]/5 transition-all cursor-pointer">
                                            <Archive size={20} className="text-gray-400 mb-2" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Ou importer localement</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLocalImageChange} />
                                        </label>

                                        {(coverImageUrl || localCoverPreview) && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                <img src={coverImageUrl || localCoverPreview!} alt="Aperçu" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-50 mt-4">
                            <button
                                onClick={() => setShowFormatDialog(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handlePublishOnline}
                                disabled={isPublishing}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPublishing && <Loader2 size={16} className="animate-spin" />}
                                Publier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Success Dialog */}
            {publishSuccess && (
                <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Check size={24} className="text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Publication réussie!</h2>
                        <p className="text-gray-600 text-center text-sm mb-6">
                            Votre document <strong>{publishSuccess.doc_name}</strong> a été publié avec succès. Vous pouvez maintenant le consulter dans votre bibliothèque.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPublishSuccess(null);
                                    setShowPublishMenu(false);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    router.push('/library');
                                }}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                Voir la bibliothèque
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Creation Dialog */}
            {showTemplateDialog && (
                <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center" onClick={() => setShowTemplateDialog(false)}>
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer un Template</h2>
                        <p className="text-gray-600 text-sm mb-6">Transformez votre projet en modèle réutilisable pour de futurs cours.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du template *</label>
                                <input
                                    type="text"
                                    value={templateData.name}
                                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                                    placeholder="Ex: Structure de Cours Standard"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={templateData.description}
                                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                                    placeholder="Décrivez brièvement ce template..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                <input
                                    type="text"
                                    value={templateData.category}
                                    onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                                    placeholder={projectData?.category || "Ex: Sciences"}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTemplateDialog(false)}
                                disabled={isCreatingTemplate}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateTemplate}
                                disabled={isCreatingTemplate || !templateData.name.trim()}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreatingTemplate && <Loader2 size={16} className="animate-spin" />}
                                Créer le template
                            </button>
                        </div>
                    </div>
                </div>
            )
            }


            {/* Content Area */}
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 min-h-[calc(100vh-80px)]">
                <div id="printable-content" className="space-y-8 print:space-y-0">

                    {/* PAGE DE TITRE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] flex flex-col items-center justify-center text-center page-break-after-always">
                        <div className="w-24 h-1 bg-[#99334C] mb-8"></div>
                        {coverImageUrl && (
                            <img src={coverImageUrl} alt="Couverture" className="max-w-full max-h-72 object-contain mb-8 rounded-xl shadow-lg border border-gray-100" />
                        )}
                        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            {projectData?.pr_name || projectName}
                        </h1>
                        <p className="text-xl text-gray-500 uppercase tracking-widest font-light">Document de Composition</p>
                        <div className="mt-20 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#99334C] flex items-center justify-center text-white mb-4">
                                {coverImageUrl ? <Share2 size={24} /> : <FileText size={24} />}
                            </div>
                            <p className="text-gray-400 text-sm">Généré par XCCM 2</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* FIDELITY WARNINGS */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 mb-8 no-print">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 flex items-center gap-2">
                                Fidélité de l'aperçu : 95%
                                <span className="text-xs font-normal bg-amber-200 px-2 py-0.5 rounded-full text-amber-800">Haute fidélité</span>
                            </h4>
                            <p className="text-sm text-amber-800 mt-1">
                                Cet aperçu correspond à 95% à la version finale. **Note importante :** Les blocs interactifs (Indices, Quiz, Code) seront convertis en version statique lors de la génération du PDF ou DOCX.
                            </p>
                        </div>
                    </div>

                    {/* TABLE DES MATIERES */}
                    {structure.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] page-break-after-always">
                            <h2 className="text-3xl font-bold text-[#99334C] mb-10 border-b border-gray-100 pb-4">Table des Matières</h2>
                            <div className="space-y-6">
                                {structure.map((part, pIdx) => (
                                    <div key={part.part_id} className="space-y-2">
                                        <a
                                            href={`#part-${pIdx}`}
                                            className="text-lg font-bold text-gray-900 hover:text-[#99334C] transition-colors flex items-center gap-3"
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-[#99334C]/10 flex items-center justify-center text-[#99334C] text-sm">
                                                {pIdx + 1}
                                            </span>
                                            {part.part_title}
                                        </a>
                                        <div className="ml-11 space-y-2">
                                            {part.chapters?.map((chap, cIdx) => (
                                                <a
                                                    key={chap.chapter_id}
                                                    href={`#part-${pIdx}-chap-${cIdx}`}
                                                    className="block text-gray-600 hover:text-[#99334C] transition-colors"
                                                >
                                                    {chap.chapter_title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONTENU */}
                    {structure.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 py-20 italic">
                            Ce cours est vide pour le moment.
                        </div>
                    )}

                    {structure.map((part, pIdx) => (
                        <div key={part.part_id} id={`part-${pIdx}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] page-break-before-always">
                            <div className="mb-12 border-b border-gray-100 pb-6">
                                <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-sm font-bold rounded-full mb-4">Partie {structure.indexOf(part) + 1}</span>
                                <h2
                                    className="text-4xl font-bold text-gray-900 mt-2"
                                    style={getStyleObject(projectData?.styles?.part?.title)}
                                >
                                    {part.part_title}
                                </h2>
                                <button
                                    onClick={() => handleCollect({ type: 'part', title: part.part_title, id: part.part_id })}
                                    className="p-2 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all flex items-center gap-2 group"
                                    title="Récupérer cette partie"
                                >
                                    <Archive size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold opacity-0 group-hover:opacity-100">Récupérer</span>
                                </button>
                            </div>

                            {part.part_intro && (
                                <div
                                    className="mb-12 text-lg text-gray-600 leading-relaxed italic border-l-4 border-[#99334C]/20 pl-6"
                                    style={getStyleObject(projectData?.styles?.part?.intro)}
                                    dangerouslySetInnerHTML={{ __html: part.part_intro }}
                                />
                            )}

                            <div className="space-y-12">
                                {part.chapters?.map((chapter, cIdx) => (
                                    <div key={chapter.chapter_id} id={`part-${pIdx}-chap-${cIdx}`} className="chapter-section">
                                        <h3
                                            className="text-3xl font-bold text-gray-900 mb-8 mt-12 flex items-center gap-3"
                                            style={getStyleObject(projectData?.styles?.chapter?.title)}
                                        >
                                            <span className="text-[#99334C] opacity-50">#</span>
                                            {chapter.chapter_title}
                                        </h3>
                                        <button
                                            onClick={() => handleCollect({ type: 'chapter', title: chapter.chapter_title, id: chapter.chapter_id })}
                                            className="mt-12 p-2 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all flex items-center gap-2 group"
                                            title="Récupérer ce chapitre"
                                        >
                                            <Archive size={16} />
                                        </button>
                                        <div className="space-y-10 pl-4 lg:pl-8">
                                            {chapter.paragraphs?.map((para: any) => (
                                                <div key={para.para_id} className="para-section">
                                                    <h4
                                                        className="text-2xl font-bold text-gray-800 mb-6"
                                                        style={getStyleObject(projectData?.styles?.paragraph?.title)}
                                                    >
                                                        {para.para_name}
                                                    </h4>
                                                    <button
                                                        onClick={() => handleCollect({ type: 'paragraph', title: para.para_name, id: para.para_id })}
                                                        className="p-2 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all flex items-center gap-2 group"
                                                        title="Récupérer ce paragraphe"
                                                    >
                                                        <Archive size={16} />
                                                    </button>
                                                    <div className="space-y-6">
                                                        {para.notions?.map((notion: any) => (
                                                            <div key={notion.notion_id} className="mb-8">
                                                                {notion.notion_name && (
                                                                    <h5 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b border-gray-100 pb-1 inline-block">
                                                                        {notion.notion_name}
                                                                    </h5>
                                                                )}
                                                                <button
                                                                    onClick={() => handleCollect({ type: 'notion', title: notion.notion_name, id: notion.notion_id })}
                                                                    className="ml-3 p-1.5 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all inline-flex items-center"
                                                                    title="Récupérer cette notion"
                                                                >
                                                                    <Archive size={14} />
                                                                </button>
                                                                <div
                                                                    className="text-gray-700 leading-relaxed prose prose-lg max-w-none [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_a]:text-[#99334C] [&_a]:underline hover:[&_a]:text-[#7a283d]"
                                                                    style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
                                                                    dangerouslySetInnerHTML={{ __html: renderBlockContent(notion.notion_content) }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Collect Granule Modal */}
            {
                showCollectModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100"
                        >
                            <div className="bg-gradient-to-r from-[#99334C] to-[#DC3545] p-6 text-white">
                                <div className="flex justify-between items-center mb-4">
                                    <Box className="w-8 h-8" />
                                    <button onClick={() => setShowCollectModal(false)} className="hover:rotate-90 transition-transform">
                                        <X size={24} />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold">Récupérer le granule</h3>
                                <p className="text-white/80 text-sm mt-1 line-clamp-1 italic">"{collectedGranule?.title}"</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <button
                                    onClick={confirmCollectToVault}
                                    className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-50 hover:border-[#99334C]/30 hover:bg-[#99334C]/5 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#99334C] group-hover:text-white transition-all">
                                        <Lock size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">Enregistrer dans mon coffre-fort</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Pour une réutilisation future dans n'importe quel projet</div>
                                    </div>
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-100" />
                                    <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-widest text-gray-300 left-1/2 -translate-x-1/2">OU</span>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Insérer directement dans :</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Projet Biologie', 'Cours Informatique', 'Physique Quantique'].map(proj => (
                                            <button
                                                key={proj}
                                                onClick={() => confirmCollectToProject(proj)}
                                                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#99334C] hover:bg-gray-50 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FolderPlus size={18} className="text-gray-400 group-hover:text-[#99334C]" />
                                                    <span className="text-sm font-bold text-gray-700">{proj}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#99334C]">SÉLECTIONNER</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowCollectModal(false)}
                                    className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

// Wrapper avec Suspense pour useSearchParams
function PreviewPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
            </div>
        }>
            <PreviewPage />
        </Suspense>
    );
}

export default PreviewPageWrapper;