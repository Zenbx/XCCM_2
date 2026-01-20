import React from 'react';
import {
    Menu, X, ArrowLeft, ZoomOut, ZoomIn, BookmarkCheck, Bookmark,
    Heart, Check, Share2, Printer, Loader2, Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReaderHeaderProps {
    tocOpen: boolean;
    setTocOpen: (open: boolean) => void;
    docName: string;
    author: string;
    pages: number;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    isBookmarked: boolean;
    setIsBookmarked: (b: boolean) => void;
    userLiked: boolean;
    likesCount: number;
    onToggleLike: () => void;
    onShare: () => void;
    copied: boolean;
    onPrint: () => void;
    onDownload: () => void;
    isDownloading: boolean;
}

const ReaderHeader: React.FC<ReaderHeaderProps> = ({
    tocOpen, setTocOpen, docName, author, pages, fontSize, setFontSize,
    isBookmarked, setIsBookmarked, userLiked, likesCount, onToggleLike,
    onShare, copied, onPrint, onDownload, isDownloading
}) => {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm print:hidden">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {tocOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => router.push('/library')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Retour à la bibliothèque"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:block border-l border-gray-200 pl-4">
                            <h1 className="text-lg font-bold text-gray-900 line-clamp-1 max-w-md">
                                {docName}
                            </h1>
                            <p className="text-xs text-gray-500">
                                Par {author} - {pages} pages
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                title="Réduire la taille"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-sm font-medium text-gray-600 min-w-[3rem] text-center">
                                {fontSize}px
                            </span>
                            <button
                                onClick={() => setFontSize(s => Math.min(28, s + 2))}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                title="Augmenter la taille"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`p-2.5 rounded-lg transition-colors ${isBookmarked ? 'bg-[#99334C]/10 text-[#99334C]' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Ajouter aux favoris"
                        >
                            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={onToggleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium border ${userLiked
                                ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title={userLiked ? "Je n'aime plus" : "J'aime"}
                        >
                            <Heart className={`w-4 h-4 ${userLiked ? "fill-current" : ""}`} />
                            <span>{likesCount}</span>
                        </button>

                        <button
                            onClick={onShare}
                            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Partager"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={onPrint}
                            className="hidden sm:block p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Imprimer"
                        >
                            <Printer className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onDownload}
                            disabled={isDownloading}
                            className="px-4 py-2.5 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Télécharger</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ReaderHeader;
