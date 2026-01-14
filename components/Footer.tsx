"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// ============= COMPOSANT: Footer =============



const Footer = () => {
  const pathname = usePathname();

  // Masquer le footer sur les pages d'édition (edit-home, edit, etc.) si l'utilisateur le souhaite, 
  // mais la demande spécifique était "page edit". On va inclure /edit et /edit-home par sécurité ou juste /edit.
  // "dans la page edit" => probablement l'éditeur de cours (/edit?...)
  // On va masquer pour tout ce qui commence par /edit
  if (pathname?.startsWith('/edit')) {
    return null;
  }

  return (
    <footer className="bg-[#36454F] text-white pt-16 pb-8 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Principale : Newsletter & Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-gray-500/30">
          <div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">XCCM 2</h2>
            <p className="text-gray-300 max-w-md leading-relaxed">
              Le système auteur nouvelle génération pour créer, structurer et diffuser
              vos connaissances avec une expérience utilisateur centrée sur l'humain.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Abonnez-vous à notre Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Recevez les dernières nouveautés, mises à jour et offres directement dans votre boîte.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre E-mail"
                className="flex-grow bg-[#2A373E] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#99334C] transition-all"
              />
              <button className="bg-[#99334C] hover:bg-[#b03d59] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Liens de Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Colonne 1: Plateforme */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">Plateforme</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-[#99334C] transition-colors">Accueil</Link></li>
              <li><Link href="/library" className="hover:text-[#99334C] transition-colors">Bibliothèque</Link></li>
              <li><Link href="/library" className="hover:text-[#99334C] transition-colors">Tous les cours</Link></li>
              <li><Link href="/login" className="hover:text-[#99334C] transition-colors">Système Auteur</Link></li>
            </ul>
          </div>

          {/* Colonne 2: À Propos */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">À propos</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/about#presentation" className="hover:text-[#99334C] transition-colors">Le projet IHM</Link></li>
              <li><Link href="/about#vision" className="hover:text-[#99334C] transition-colors">Notre Vision</Link></li>
              <li><Link href="/about#equipe" className="hover:text-[#99334C] transition-colors">L'équipe</Link></li>
              <li><Link href="/about#contact" className="hover:text-[#99334C] transition-colors">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Support - AVEC ANCRES */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">Aide & Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/help#documentation#intro" className="hover:text-[#99334C] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/help#faq" className="hover:text-[#99334C] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help#guide" className="hover:text-[#99334C] transition-colors">
                  Guide Auteurs
                </Link>
              </li>
              <li>
                <Link href="/help#support" className="hover:text-[#99334C] transition-colors">
                  Support Technique
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Public Cible */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">Solutions</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="text-sm italic">Enseignants & Formateurs</li>
              <li className="text-sm italic">Institutions éducatives</li>
              <li className="text-sm italic">Étudiants</li>
              <li className="text-sm italic">Créateurs de contenu</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-500/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} XCCM 2. Projet Interaction Homme-Machine.</p>
          <div className="flex gap-6">
            <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
            <Link href="/conditions" className="hover:underline">Conditions d'utilisation</Link>
            <Link href="/accessibilite" className="hover:underline">Accessibilité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;