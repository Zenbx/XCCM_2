import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#36454F] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Principale : Logo & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-12 border-b border-gray-500/30">
          {/* Logo et description */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 tracking-tight">XCCM 2</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-md leading-relaxed">
              Le système auteur nouvelle génération pour créer, structurer et diffuser 
              vos connaissances avec une expérience utilisateur centrée sur l'humain.
            </p>
          </div>

          {/* Newsletter */}
          <div className="bg-white/5 p-5 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Abonnez-vous à notre Newsletter</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Recevez les dernières nouveautés, mises à jour et offres directement dans votre boîte.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Votre E-mail" 
                className="flex-grow bg-[#2A373E] border border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#99334C] transition-all"
              />
              <button className="bg-[#99334C] hover:bg-[#b03d59] text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap text-sm sm:text-base">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Liens de Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12">
          {/* Colonne 1: Plateforme */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-white/90">Plateforme</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-400">
              <li>
                <Link href="/accueil" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/bibliotheque" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Bibliothèque
                </Link>
              </li>
              <li>
                <Link href="/cours" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Tous les cours
                </Link>
              </li>
              <li>
                <Link href="/creation" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Système Auteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 2: À Propos */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-white/90">À propos</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-400">
              <li>
                <Link href="/projet" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Le projet IHM
                </Link>
              </li>
              <li>
                <Link href="/vision" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Notre Vision
                </Link>
              </li>
              <li>
                <Link href="/equipe" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  L'équipe
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Support - AVEC ANCRES */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-white/90">Aide & Support</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-400">
              <li>
                <Link href="/centre-aide#documentation#intro" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/centre-aide#faq#compte" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/centre-aide#guide#premier-cours" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Guide Auteurs
                </Link>
              </li>
              <li>
                <Link href="/centre-aide#support#contact" className="hover:text-[#99334C] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Support Technique
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Public Cible */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-white/90">Solutions</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-gray-400">
              <li className="italic">Enseignants & Formateurs</li>
              <li className="italic">Institutions éducatives</li>
              <li className="italic">Étudiants</li>
              <li className="italic">Créateurs de contenu</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-gray-500/30 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} XCCM 2. Projet Interaction Homme-Machine.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/confidentialite" className="hover:underline hover:text-[#99334C] transition-colors">
              Confidentialité
            </Link>
            <Link href="/conditions" className="hover:underline hover:text-[#99334C] transition-colors">
              Conditions d'utilisation
            </Link>
            <Link href="/accessibilite" className="hover:underline hover:text-[#99334C] transition-colors">
              Accessibilité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;