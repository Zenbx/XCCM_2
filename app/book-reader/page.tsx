"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Mock du contenu complet pour chaque cours (à remplacer par API)
const mockBooksContent = {
  1: "Contenu complet du livre Introduction aux Réseaux Informatiques...\nChapitre 1...\nChapitre 2...",
  2: "Contenu complet du livre Programmation Python Avancée...\nChapitre 1...\nChapitre 2...",
  3: "Contenu complet du livre Design UX/UI Moderne...\nChapitre 1...\nChapitre 2..."
};

const BookReader = () => {
  const router = useRouter();
  const { id } = useParams(); // si tu passes l'id dans l'URL
  const [bookContent, setBookContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);

  const linesPerPage = 10000; // nombre de lignes par "page"

  useEffect(() => {
    // Récupère le contenu du livre (ici mock)
    if (id && mockBooksContent[id]) {
      setBookContent(mockBooksContent[id]);
    } else {
      setBookContent("Contenu non disponible.");
    }
  }, [id]);

  // Découper le contenu en "pages"
  const contentLines = bookContent.split("\n");
  const totalPages = Math.ceil(contentLines.length / linesPerPage);
  const pageContent = contentLines.slice((currentPage - 1) * linesPerPage, currentPage * linesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#99334C] font-semibold"
        >
          <ChevronLeft className="w-5 h-5" /> Retour
        </button>

        <button
          onClick={() => setBookmarked(prev => !prev)}
          className="flex items-center gap-2 text-[#99334C] font-semibold"
        >
          {bookmarked ? (
            <>
              <BookmarkCheck className="w-5 h-5" /> Bookmark ajouté
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" /> Ajouter aux bookmarks
            </>
          )}
        </button>
      </div>

      {/* Contenu du livre */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
        <pre className="whitespace-pre-wrap text-gray-800 text-sm">{pageContent.join("\n")}</pre>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 inline" /> Page précédente
        </button>

        <span className="font-semibold text-gray-700">
          Page {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Page suivante <ChevronRight className="w-5 h-5 inline" />
        </button>
      </div>
    </div>
  );
};

export default BookReader;