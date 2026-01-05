"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Share2, Download, FileText, File, Printer, ChevronDown } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { structureService, Part } from '@/services/structureService';

const PreviewPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectName = searchParams.get('projectName');

    const [structure, setStructure] = useState<Part[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showPublishMenu, setShowPublishMenu] = useState(false);

    useEffect(() => {
        if (projectName) {
            loadProject();
        }
    }, [projectName]);

    const loadProject = async () => {
        try {
            setIsLoading(true);
            const projectStructure = await structureService.getProjectStructure(projectName!);
            setStructure(projectStructure);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
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

        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
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
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background-color: rgb(243, 244, 246);
                    padding: 48px;
                    color: rgb(17, 24, 39);
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
                    font-weight: 900;
                    color: rgb(17, 24, 39);
                    margin-bottom: 16px;
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
                    border-bottom: 2px solid rgb(153, 51, 76);
                    padding-bottom: 24px;
                }
                .part-label {
                    color: rgb(153, 51, 76);
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    font-size: 14px;
                }
                h2 {
                    font-size: 32px;
                    font-weight: 800;
                    color: rgb(17, 24, 39);
                    margin-top: 8px;
                }
                .part-intro {
                    margin-bottom: 48px;
                    font-size: 20px;
                    color: rgb(55, 65, 81);
                    line-height: 1.75;
                    font-style: italic;
                    border-left: 4px solid rgb(243, 244, 246);
                    padding-left: 24px;
                }
                h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: rgb(31, 41, 55);
                    margin-bottom: 32px;
                    margin-top: 48px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .chapter-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgb(243, 244, 246);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: rgb(107, 114, 128);
                }
                .chapter-content {
                    padding-left: 48px;
                    border-left: 1px solid rgb(249, 250, 251);
                }
                .paragraph {
                    margin-bottom: 40px;
                }
                h4 {
                    font-size: 20px;
                    font-weight: 600;
                    color: rgb(31, 41, 55);
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .bullet {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: rgb(153, 51, 76);
                }
                h5 {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgb(153, 51, 76);
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .notion-content {
                    font-size: 16px;
                    line-height: 1.75;
                    color: rgb(31, 41, 55);
                    margin-bottom: 24px;
                }
                .notion-content p {
                    margin-bottom: 12px;
                }
                .notion-content strong {
                    font-weight: 600;
                    color: rgb(17, 24, 39);
                }
                .notion-content em {
                    font-style: italic;
                }
                .notion-content ul, .notion-content ol {
                    margin-left: 24px;
                    margin-bottom: 12px;
                }
                .notion-content li {
                    margin-bottom: 8px;
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

        // Contenu
        if (structure.length === 0) {
            bodyContent += `
                <div class="page" style="display: flex; align-items: center; justify-content: center;">
                    <p style="color: rgb(107, 114, 128); font-style: italic;">Ce cours est vide pour le moment.</p>
                </div>
            `;
        } else {
            structure.forEach((part, partIndex) => {
                bodyContent += `<div class="page">`;
                bodyContent += `
                    <div class="part-header">
                        <span class="part-label">Partie ${partIndex + 1}</span>
                        <h2>${part.part_title}</h2>
                    </div>
                `;

                if (part.part_intro) {
                    bodyContent += `<div class="part-intro">${part.part_intro}</div>`;
                }

                part.chapters?.forEach((chapter) => {
                    bodyContent += `
                        <h3>
                            <span class="chapter-number">${chapter.chapter_number}</span>
                            ${chapter.chapter_title}
                        </h3>
                        <div class="chapter-content">
                    `;

                    chapter.paragraphs?.forEach((para: any) => {
                        bodyContent += `
                            <div class="paragraph">
                                <h4>
                                    <span class="bullet"></span>
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
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-[#99334C] animate-spin" />
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
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Share2 size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Publier en ligne</div>
                                        <div className="text-xs text-gray-500">Rendre accessible via lien public</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportPDF}
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
                                    onClick={handleExportWord}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                                        <File size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Exporter en Word</div>
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

            {/* Content Area */}
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 min-h-[calc(100vh-80px)]">
                <div id="printable-content" className="space-y-8 print:space-y-0">

                    {/* PAGE DE TITRE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] flex flex-col items-center justify-center text-center page-break-after-always">
                        <div className="w-24 h-1 bg-[#99334C] mb-8"></div>
                        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
                            {projectName?.toUpperCase()}
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

                    {/* CONTENU */}
                    {structure.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 py-20 italic">
                            Ce cours est vide pour le moment.
                        </div>
                    )}

                    {structure.map((part) => (
                        <div key={part.part_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8 min-h-[842px] page-break-before-always">
                            <div className="mb-12 border-b-2 border-[#99334C] pb-6">
                                <span className="text-[#99334C] font-bold tracking-widest uppercase text-sm">Partie {structure.indexOf(part) + 1}</span>
                                <h2 className="text-4xl font-extrabold text-gray-900 mt-2">
                                    {part.part_title}
                                </h2>
                            </div>

                            {part.part_intro && (
                                <div className="mb-12 text-xl text-gray-700 leading-relaxed font-serif italic border-l-4 border-gray-100 pl-6"
                                    dangerouslySetInnerHTML={{ __html: part.part_intro }} />
                            )}

                            <div className="space-y-12">
                                {part.chapters?.map((chapter) => (
                                    <div key={chapter.chapter_id} className="chapter-section">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-8 mt-12 flex items-center gap-4">
                                            <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                                {chapter.chapter_number}
                                            </span>
                                            {chapter.chapter_title}
                                        </h3>

                                        <div className="space-y-10 pl-12 border-l border-gray-50">
                                            {chapter.paragraphs?.map((para: any) => (
                                                <div key={para.para_id} className="para-section">
                                                    <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-[#99334C]"></div>
                                                        {para.para_name}
                                                    </h4>

                                                    <div className="space-y-6">
                                                        {para.notions?.map((notion: any) => (
                                                            <div key={notion.notion_id} className="mb-8">
                                                                {notion.notion_name && (
                                                                    <h5 className="text-xs uppercase tracking-widest text-[#99334C] font-bold mb-3">
                                                                        {notion.notion_name}
                                                                    </h5>
                                                                )}
                                                                <div
                                                                    className="text-gray-800 leading-relaxed"
                                                                    style={{ fontSize: '16px', lineHeight: '1.75' }}
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