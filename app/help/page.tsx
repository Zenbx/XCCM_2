"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Book, HelpCircle, FileText, Headphones, Menu, X, Send, Mail, Phone, MapPin, Clock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { mailingService } from '@/services/mailingService';

const HelpCenter = () => {
  const [activeSection, setActiveSection] = useState('documentation');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    description: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  const { user } = useAuth();
  const t = useTranslations('help');
  const tc = useTranslations('common');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    Object.entries(content).forEach(([sectionKey, sectionContent]) => {
      Object.entries(sectionContent).forEach(([subKey, subContent]: [string, any]) => {
        if (subContent.title?.toLowerCase().includes(query) || subContent.content?.toLowerCase().includes(query)) {
          results.push({
            section: sectionKey,
            subsection: subKey,
            title: subContent.title,
            snippet: subContent.content?.substring(0, 150) + "..."
          });
        }
      });
    });

    setSearchResults(results);
  }, [searchQuery]);

  const sections: Record<string, any> = {
    documentation: {
      title: t('sections.documentation.title'),
      icon: Book,
      subsections: [
        { id: 'intro', title: t('sections.documentation.subsections.intro') },
        { id: 'fonctionnalites', title: t('sections.documentation.subsections.fonctionnalites') },
        { id: 'interface', title: t('sections.documentation.subsections.interface') },
        { id: 'organisation', title: t('sections.documentation.subsections.organisation') },
        { id: 'shortcuts', title: t('sections.documentation.subsections.shortcuts') },
        { id: 'slash-commands', title: t('sections.documentation.subsections.slash-commands') },
        { id: 'publication', title: t('sections.documentation.subsections.publication') }
      ]
    },
    faq: {
      title: t('sections.faq.title'),
      icon: HelpCircle,
      subsections: [
        { id: 'compte', title: t('sections.faq.subsections.compte') },
        { id: 'creation', title: t('sections.faq.subsections.creation') },
        { id: 'problemes', title: t('sections.faq.subsections.problemes') },
        { id: 'securite', title: t('sections.faq.subsections.securite') }
      ]
    },
    guide: {
      title: t('sections.guide.title'),
      icon: FileText,
      subsections: [
        { id: 'premier-cours', title: t('sections.guide.subsections.premier-cours') },
        { id: 'structuration', title: t('sections.guide.subsections.structuration') },
        { id: 'bonnes-pratiques', title: t('sections.guide.subsections.bonnes-pratiques') },
        { id: 'multimedia', title: t('sections.guide.subsections.multimedia') },
        { id: 'collaboration', title: t('sections.guide.subsections.collaboration') }
      ]
    },
    support: {
      title: t('sections.support.title'),
      icon: Headphones,
      subsections: [
        { id: 'contact', title: t('sections.support.subsections.contact') },
        { id: 'bug-report', title: t('sections.support.subsections.bug-report') },
        { id: 'compatibilite', title: t('sections.support.subsections.compatibilite') },
        { id: 'api', title: t('sections.support.subsections.api') }
      ]
    }
  };

  const handleContactSubmit = async () => {
    if (!user) {
      toast.error(t('contactForm.fillAll'), { icon: '🔒', duration: 4000 });
      return;
    }

    if (!contactForm.nom || !contactForm.email || !contactForm.sujet || !contactForm.description) {
      toast.error(t('contactForm.fillAll'));
      return;
    }

    setIsSubmitting(true);
    try {
      await mailingService.sendContact({
        name: contactForm.nom,
        email: contactForm.email,
        subject: contactForm.sujet,
        message: contactForm.description
      });
      toast.success(t('contactForm.success'));
      setFormSubmitted(true);
      setContactForm({ nom: '', email: '', sujet: '', description: '' });
      setTimeout(() => { setFormSubmitted(false); }, 5000);
    } catch (err: any) {
      toast.error(err.message || tc('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const content: Record<string, any> = {
    documentation: {
      intro: { title: t('sections.documentation.subsections.intro'), content: "XCCM 2 est une plateforme numérique dédiée à la création..." },
      fonctionnalites: { title: t('sections.documentation.subsections.fonctionnalites'), content: "XCCM 2 propose un ensemble de fonctionnalités..." },
      interface: { title: t('sections.documentation.subsections.interface'), content: "L'interface de XCCM 2 est organisée en trois zones..." },
      shortcuts: { title: t('sections.documentation.subsections.shortcuts'), content: "Gagnez du temps avec les raccourcis essentiels..." },
      'slash-commands': { title: t('sections.documentation.subsections.slash-commands'), content: "Tapez \"/\" dans l'éditeur pour ouvrir le menu..." }
    },
    faq: {
      compte: { title: t('sections.faq.subsections.compte'), content: "Vous pouvez gérer votre compte depuis les paramètres..." }
    },
    guide: {
      'premier-cours': { title: t('sections.guide.subsections.premier-cours'), content: "Pour créer votre premier cours, cliquez sur le bouton..." }
    },
    support: {
      contact: { title: t('sections.support.subsections.contact'), content: "Utilisez le formulaire ci-dessous pour nous contacter..." }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const subsections = sections[activeSection]?.subsections || [];
      const scrollPosition = window.scrollY + 150;

      for (const subsection of subsections) {
        const element = document.getElementById(subsection.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSubSection(subsection.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (subsectionId: string) => {
    const element = document.getElementById(subsectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSubSection(subsectionId);
    setIsMobileTocOpen(false);
  };

  const changeSection = (sectionKey: string) => {
    setActiveSection(sectionKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const firstSubsection = sections[sectionKey].subsections[0].id;
    setActiveSubSection(firstSubsection);
    setIsMobileSidebarOpen(false);
  };

  const currentSection = sections[activeSection];
  const Icon = currentSection?.icon || Book;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header Mobile */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Menu size={24} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">XCCM 2</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('title')}</p>
          </div>
        </div>
        <button onClick={() => setIsMobileTocOpen(!isMobileTocOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-[#99334C] dark:text-[#ff9daf]"><FileText size={20} /></button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform md:translate-x-0 md:static ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#99334C] dark:bg-[#ff9daf] rounded-xl flex items-center justify-center text-white"><Book size={24} /></div>
            <h2 className="text-xl font-bold">XCCM 2</h2>
          </div>
          <nav className="space-y-2">
            {Object.entries(sections).map(([key, section]) => (
              <button key={key} onClick={() => changeSection(key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeSection === key ? 'bg-[#99334C] text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <section.icon size={20} />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4"><p className="text-sm font-bold mb-1">{t('version')}</p><p className="text-xs text-gray-500">{t('projectYear')}</p></div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero / Search */}
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] dark:bg-gray-800 dark:text-white transition-all shadow-sm" />
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Search size={20} className="text-[#99334C]" /> {t('searchResults')}</h2>
              <div className="space-y-4">
                {searchResults.length > 0 ? searchResults.map((res: any, i: number) => (
                  <button key={i} onClick={() => { changeSection(res.section); setTimeout(() => scrollToSection(res.subsection), 100); setSearchQuery(''); }} className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#99334C]/30 hover:bg-[#99334C]/5 transition-all">
                    <h3 className="font-bold text-[#99334C] dark:text-[#ff9daf]">{res.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{res.snippet}</p>
                  </button>
                )) : <p className="text-gray-500">{t('noResults', { query: searchQuery })}</p>}
              </div>
            </div>
          )}

          {/* Dynamic Content */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-sm min-h-[500px]">
            <div className="flex items-center gap-4 mb-8">
              <Icon size={48} className="text-[#99334C] dark:text-[#ff9daf]" />
              <h2 className="text-3xl font-bold">{currentSection?.title}</h2>
            </div>
            {Object.entries(content[activeSection] || {}).map(([key, sub]: [string, any]) => (
              <section key={key} id={key} className="mb-12 scroll-mt-24">
                <h3 className="text-2xl font-bold mb-4 text-[#99334C] dark:text-[#ff9daf] flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-[#99334C] dark:bg-[#ff9daf] rounded-full"></span>
                  {sub.title}
                </h3>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{sub.content}</div>
              </section>
            ))}

            {/* Support Form Section */}
            {activeSection === 'support' && (
              <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Mail className="text-[#99334C]" /> {t('contactForm.formTitle')}</h3>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-6">
                    <div><label className="block text-sm font-semibold mb-2">{t('contactForm.name')}</label><input type="text" value={contactForm.nom} onChange={e => setContactForm({ ...contactForm, nom: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 dark:bg-gray-800" placeholder={t('contactForm.namePlaceholder')} /></div>
                    <div><label className="block text-sm font-semibold mb-2">{t('contactForm.email')}</label><input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 dark:bg-gray-800" placeholder={t('contactForm.emailPlaceholder')} /></div>
                    <button onClick={handleContactSubmit} disabled={isSubmitting} className="w-full bg-[#99334C] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#7a283d] disabled:opacity-50 transition-all">{isSubmitting ? <><Loader2 className="animate-spin" /> {tc('loading')}</> : <><Send /> {t('contactForm.send')}</>}</button>
                    {formSubmitted && <div className="p-4 bg-green-50 text-green-700 rounded-xl font-medium flex items-center gap-2"><Send size={18} /> {t('contactForm.success')}</div>}
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h4 className="font-bold">{t('contactForm.replyTime')}</h4>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><Mail size={18} /> contact@xccm2.com</div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><Phone size={18} /> +237 6XX XXX XXX</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Table of Contents Desktop */}
      <nav className="hidden lg:block w-70 p-8 pt-12">
        <div className="sticky top-12">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">{Icon.name === 'Book' ? 'TOC' : 'Sections'}</h3>
          <div className="space-y-1">
            {currentSection?.subsections.map((sub: any) => (
              <button key={sub.id} onClick={() => scrollToSection(sub.id)} className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${activeSubSection === sub.id ? 'bg-[#99334C]/10 text-[#99334C] font-bold border-l-4 border-[#99334C]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{sub.title}</button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HelpCenter;