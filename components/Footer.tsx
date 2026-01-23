"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mailingService } from '@/services/mailingService';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// ============= COMPOSANT: Footer =============



const Footer = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const t = useTranslations('footer');
  const th = useTranslations('header');
  const tc = useTranslations('common');
  const tAuth = useTranslations('auth');
  const tContact = useTranslations('contact');

  // Masquer le footer sur les pages d'édition (edit-home, edit, etc.) si l'utilisateur le souhaite, 
  // mais la demande spécifique était "page edit". On va inclure /edit et /edit-home par sécurité ou juste /edit.
  // "dans la page edit" => probablement l'éditeur de cours (/edit?...)
  // On va masquer pour tout ce qui commence par /edit
  if (pathname?.startsWith('/edit') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#36454F] text-white pt-16 pb-8 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Principale : Newsletter & Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-gray-500/30">
          <div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">{t('title')}</h2>
            <p className="text-gray-300 max-w-md leading-relaxed">
              {t('newsletter.desc')}
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-semibold mb-2">{t('newsletter.title')}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {t('newsletter.desc')}
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email) return;

                if (!user) {
                  toast.error("Vous devez être connecté pour vous abonner à la newsletter", {
                    icon: '🔒',
                    duration: 4000
                  });
                  return;
                }

                setIsSubmitting(true);
                try {
                  await mailingService.subscribeNewsletter(email);
                  toast.success(tContact('success'));
                  setEmail('');
                } catch (err: any) {
                  toast.error(err.message || tc('error'));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.emailPlaceholder')}
                className="flex-grow bg-[#2A373E] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#99334C] transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#99334C] hover:bg-[#b03d59] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tc('loading')}
                  </>
                ) : (
                  t('newsletter.subscribe')
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Liens de Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Colonne 1: Plateforme */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">{t('links.platform')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-[#99334C] transition-colors">{th('links.home')}</Link></li>
              <li><Link href="/library" className="hover:text-[#99334C] transition-colors">{th('links.library')}</Link></li>
              <li><Link href="/library" className="hover:text-[#99334C] transition-colors">{th('links.library')}</Link></li>
              <li><Link href="/login" className="hover:text-[#99334C] transition-colors">{tAuth('login')}</Link></li>
            </ul>
          </div>

          {/* Colonne 2: À Propos */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">{t('links.about')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/about#presentation" className="hover:text-[#99334C] transition-colors">Le projet IHM</Link></li>
              <li><Link href="/about#vision" className="hover:text-[#99334C] transition-colors">Notre Vision</Link></li>
              <li><Link href="/about#equipe" className="hover:text-[#99334C] transition-colors">L'équipe</Link></li>
              <li><Link href="/about#contact" className="hover:text-[#99334C] transition-colors">{tContact('sectionLabel')}</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Support - AVEC ANCRES */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white/90">{t('links.support')}</h4>
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
            <h4 className="font-bold text-lg mb-6 text-white/90">{t('links.solutions')}</h4>
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
          <p>{t('copyright', { year: new Date().getFullYear().toString() })}</p>
          <div className="flex gap-6">
            <Link href="/confidentialite" className="hover:underline">{t('privacy')}</Link>
            <Link href="/conditions" className="hover:underline">{t('terms')}</Link>
            <Link href="/accessibilite" className="hover:underline">{t('accessibility')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;