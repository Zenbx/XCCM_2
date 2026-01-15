"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Share2, Download, FileText, File, Printer, ChevronDown, Check, X } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { structureService, Part } from '@/services/structureService';
import { publishService } from '@/services/publishService';
import { exportService } from '@/services/exportService';
import toast from 'react-hot-toast';

const PreviewPage = () => {
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
        }
    }, [projectName]);

    const loadProject = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Project Info (to get styles)
            const project = await projectService.getProjectByName(projectName!);
            setProjectData(project);

            // 2. Fetch Parts List first (Fast)
            const parts = await structureService.getParts(projectName!);

            // Initialize progress
            setLoadingProgress({ current: 0, total: parts.length });

            // Use p-limit from service or simple Promise.all with manual throttling if needed.
            // Since structureService.fillPartDetails is robust, we can map over parts.
            // We want to update progress after EACH part returns.

            const pLimit = (await import('p-limit')).default;
            const limit = pLimit(3); // Fetch 3 parts details in parallel max

            const loadedParts: Part[] = [];

            const promises = parts.map(part => limit(async () => {
                try {
                    const filledPart = await structureService.fillPartDetails(projectName!, { ...part });
                    loadedParts.push(filledPart);
                } catch (e) {
                    console.error(`Error loading part ${part.part_title}`, e);
                    loadedParts.push(part); // Push empty part on error to keep structure
                } finally {
                    // Update progress
                    setLoadingProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
                }
            }));

            await Promise.all(promises);

            // Sort parts to ensure order is preserved despite async completion
            loadedParts.sort((a, b) => {
                // Assuming part_number exists or original index.
                // Using parts.indexOf(originalPart) strategy is safer if IDs match.
                // Simple sort by part_id or rely on original list order:
                return parts.findIndex(p => p.part_id === a.part_id) - parts.findIndex(p => p.part_id === b.part_id);
            });

            setStructure(loadedParts);

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

    const handlePublishOnline = async () => {
        if (!projectName) return;

        setIsPublishing(true);
        setShowPublishMenu(false);

        try {
            const result = await publishService.publishProject(projectName, publishFormat);
            setPublishSuccess({
                doc_id: result.doc_id,
                doc_name: result.doc_name
            });
            toast.success("Publication réussie !");
            setShowFormatDialog(false);
        } catch (error) {
            console.error('Erreur lors de la publication:', error);
            toast.error(`Erreur lors de la publication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
            </style>
        `;

        let bodyContent = '';

        // Page de titre
        bodyContent += `
            <div class="page title-page">
                <div class="title-bar"></div>
                <h1>${projectName?.toUpperCase() || 'DOCUMENT'}</h1>
                <p class="subtitle">Document de Composition</p>
                <div class="title-footer">
                    <div class="icon-circle">📄</div>
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
                            bodyContent += `<div class="notion-content">${notion.notion_content}</div>`;
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
                        <Share2 size={18} />
                        Publier
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
                                    disabled={isPublishing}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left disabled:opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {isPublishing ? 'Publication...' : 'Publier en ligne'}
                                        </div>
                                        <div className="text-xs text-gray-500">Rendre accessible via lien public</div>
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
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Format Selection Dialog */}
            {showFormatDialog && (
                <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choisir le format de publication</h2>
                        <p className="text-gray-600 text-sm mb-6">Sélectionnez le format dans lequel vous souhaitez publier votre document.</p>

                        <div className="space-y-3 mb-6">
                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                                style={{ borderColor: publishFormat === 'pdf' ? '#99334C' : '#e5e7eb', backgroundColor: publishFormat === 'pdf' ? '#99334c0a' : 'transparent' }}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="pdf"
                                    checked={publishFormat === 'pdf'}
                                    onChange={(e) => setPublishFormat(e.target.value as 'pdf' | 'docx')}
                                    className="mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">PDF</div>
                                    <div className="text-xs text-gray-600">Format universel, lecture seule</div>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                                style={{ borderColor: publishFormat === 'docx' ? '#99334C' : '#e5e7eb', backgroundColor: publishFormat === 'docx' ? '#99334c0a' : 'transparent' }}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="docx"
                                    checked={publishFormat === 'docx'}
                                    onChange={(e) => setPublishFormat(e.target.value as 'pdf' | 'docx')}
                                    className="mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">DOCX</div>
                                    <div className="text-xs text-gray-600">Format Word, éditable</div>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFormatDialog(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handlePublishOnline}
                                disabled={isPublishing}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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


            {/* Content Area */}
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 min-h-[calc(100vh-80px)]">
                <div id="printable-content" className="space-y-8 print:space-y-0">

                    {/* PAGE DE TITRE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] flex flex-col items-center justify-center text-center page-break-after-always">
                        <div className="w-24 h-1 bg-[#99334C] mb-8"></div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            {projectData?.pr_name || projectName}
                        </h1>
                        <p className="text-xl text-gray-500 uppercase tracking-widest font-light">Document de Composition</p>
                        <div className="mt-20 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#99334C] flex items-center justify-center text-white mb-4">
                                <FileText size={24} />
                            </div>
                            <p className="text-gray-400 text-sm">Généré par XCCM 2</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
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

                                        <div className="space-y-10 pl-4 lg:pl-8">
                                            {chapter.paragraphs?.map((para: any) => (
                                                <div key={para.para_id} className="para-section">
                                                    <h4
                                                        className="text-2xl font-bold text-gray-800 mb-6"
                                                        style={getStyleObject(projectData?.styles?.paragraph?.title)}
                                                    >
                                                        {para.para_name}
                                                    </h4>

                                                    <div className="space-y-6">
                                                        {para.notions?.map((notion: any) => (
                                                            <div key={notion.notion_id} className="mb-8">
                                                                {notion.notion_name && (
                                                                    <h5 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b border-gray-100 pb-1 inline-block">
                                                                        {notion.notion_name}
                                                                    </h5>
                                                                )}
                                                                <div
                                                                    className="text-gray-700 leading-relaxed prose prose-lg max-w-none [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_a]:text-[#99334C] [&_a]:underline hover:[&_a]:text-[#7a283d]"
                                                                    style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
                                                                    dangerouslySetInnerHTML={{ __html: notion.notion_content }}
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
        </div>
    );
};

export default PreviewPage;