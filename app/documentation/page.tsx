"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Zap, HelpCircle } from "lucide-react";

const DocumentationPage = () =>{
  return (
    <main className="min-h-screen bg-white">
      
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#99334C] font-medium hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l’accueil
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Documentation XCCM 2
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Tout ce que vous devez savoir pour créer, organiser et partager vos contenus pédagogiques.
          </p>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Carte 1 */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-all">
            <BookOpen className="w-8 h-8 text-[#99334C] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Démarrer avec XCCM 2</h3>
            <p className="text-gray-600 mb-4">
              Comprendre les bases, créer votre premier contenu et découvrir l’interface.
            </p>
            <Link href="#" className="text-[#99334C] font-semibold hover:underline">
              Lire le guide →
            </Link>
          </div>

          {/* Carte 2 */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-all">
            <FileText className="w-8 h-8 text-[#99334C] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Créer et structurer un cours</h3>
            <p className="text-gray-600 mb-4">
              Chapitres, notions, modules et bonnes pratiques pédagogiques.
            </p>
            <Link href="#" className="text-[#99334C] font-semibold hover:underline">
              Voir les sections →
            </Link>
          </div>

          {/* Carte 3 */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-all">
            <Zap className="w-8 h-8 text-[#99334C] mb-4" />
            <h3 className="text-2xl font-bold mb-3">Fonctionnalités avancées</h3>
            <p className="text-gray-600 mb-4">
              Collaboration, partage, performances et organisation avancée.
            </p>
            <Link href="#" className="text-[#99334C] font-semibold hover:underline">
              Explorer →
            </Link>
          </div>

          {/* Carte 4 */}
          <div className="border rounded-2xl p-8 hover:shadow-lg transition-all">
            <HelpCircle className="w-8 h-8 text-[#99334C] mb-4" />
            <h3 className="text-2xl font-bold mb-3">FAQ & Aide</h3>
            <p className="text-gray-600 mb-4">
              Questions fréquentes, dépannage et bonnes pratiques.
            </p>
            <Link href="/faq" className="text-[#99334C] font-semibold hover:underline">
              Consulter →
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
export default DocumentationPage;