"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  Search,
  Book,
  HelpCircle,
  FileText,
  Headphones,
  Menu,
  X,
  Send,
  Mail,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { mailingService } from '@/services/mailingService';
import { getHelpContent, HELP_SECTION_IDS } from './helpContent';

const HelpCenter = () => {
  const t = useTranslations('help');
  const tc = useTranslations('common');
  const contextContact = useTranslations('contact');
  const locale = useLocale();
  const { user } = useAuth();

  const content = useMemo(() => getHelpContent(locale), [locale]);

  const [activeSection, setActiveSection] = useState<keyof typeof HELP_SECTION_IDS>('documentation');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    description: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { section: string; subsection: string; title: string; snippet: string }[] | null
  >(null);

  const sections = useMemo(
    () => ({
      documentation: {
        title: t('sections.documentation.title'),
        subtitle: t('sections.documentation.subtitle'),
        icon: Book,
        subsections: HELP_SECTION_IDS.documentation.map((id) => ({
          id,
          title: t(`sections.documentation.subsections.${id}`),
        })),
      },
      faq: {
        title: t('sections.faq.title'),
        subtitle: t('sections.faq.subtitle'),
        icon: HelpCircle,
        subsections: HELP_SECTION_IDS.faq.map((id) => ({
          id,
          title: t(`sections.faq.subsections.${id}`),
        })),
      },
      guide: {
        title: t('sections.guide.title'),
        subtitle: t('sections.guide.subtitle'),
        icon: FileText,
        subsections: HELP_SECTION_IDS.guide.map((id) => ({
          id,
          title: t(`sections.guide.subsections.${id}`),
        })),
      },
      support: {
        title: t('sections.support.title'),
        subtitle: t('sections.support.subtitle'),
        icon: Headphones,
        subsections: HELP_SECTION_IDS.support.map((id) => ({
          id,
          title: t(`sections.support.subsections.${id}`),
        })),
      },
    }),
    [t],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: { section: string; subsection: string; title: string; snippet: string }[] = [];

    Object.entries(content).forEach(([sectionKey, sectionContent]) => {
      Object.entries(sectionContent).forEach(([subKey, subContent]) => {
        const haystack = `${subContent.title || ''} ${subContent.content || ''}`.toLowerCase();
        if (haystack.includes(query)) {
          results.push({
            section: sectionKey,
            subsection: subKey,
            title: subContent.title,
            snippet: (subContent.content || '').slice(0, 160) + (subContent.content && subContent.content.length > 160 ? '…' : ''),
          });
        }
      });
    });

    setSearchResults(results);
  }, [searchQuery, content]);

  const handleContactSubmit = async () => {
    if (!user) {
      toast.error(contextContact('authError'), { icon: '🔒', duration: 4000 });
      return;
    }

    if (!contactForm.nom || !contactForm.email || !contactForm.sujet || !contactForm.description) {
      toast.error(contextContact('fillAll'));
      return;
    }

    setIsSubmitting(true);
    try {
      await mailingService.sendContact({
        name: contactForm.nom,
        email: contactForm.email,
        subject: contactForm.sujet,
        message: contactForm.description,
      });
      toast.success(contextContact('success'));
      setFormSubmitted(true);
      setContactForm({ nom: '', email: '', sujet: '', description: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err: any) {
      toast.error(err.message || tc('error'));
    } finally {
      setIsSubmitting(false);
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
  }, [activeSection, sections]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const sectionKeys = Object.keys(sections);
    let section = hash;
    let subsection = '';

    if (hash.includes('/')) {
      [section, subsection] = hash.split('/');
    } else if (sections.documentation.subsections.some((s) => s.id === hash)) {
      section = 'documentation';
      subsection = hash;
    } else if (sectionKeys.includes(hash)) {
      subsection = sections[hash as keyof typeof sections].subsections[0]?.id || '';
    }

    if (sections[section as keyof typeof sections]) {
      setActiveSection(section as keyof typeof HELP_SECTION_IDS);
      setTimeout(() => {
        const id = subsection || sections[section as keyof typeof sections].subsections[0].id;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSubSection(id);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = (subsectionId: string) => {
    document.getElementById(subsectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSubSection(subsectionId);
    setIsMobileTocOpen(false);
  };

  const changeSection = (sectionKey: keyof typeof HELP_SECTION_IDS) => {
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
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">XCCM 2</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('title')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-[#99334C]"
        >
          <FileText size={20} />
        </button>
      </div>

      {(isMobileSidebarOpen || isMobileTocOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => {
            setIsMobileSidebarOpen(false);
            setIsMobileTocOpen(false);
          }}
        />
      )}

      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-72 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">XCCM 2</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('title')}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#99334C] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-1">
            {(Object.keys(sections) as (keyof typeof sections)[]).map((key) => {
              const section = sections[key];
              const SectionIcon = section.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === key
                      ? 'bg-[#99334C] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <SectionIcon size={18} />
                  <span className="font-medium">{section.title}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('version')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('projectYear')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
          {searchResults ? (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <Search className="w-8 h-8 text-[#99334C] dark:text-[#ff9daf]" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('searchResults')}</h1>
              </div>

              {searchResults.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">{t('noResults', { query: searchQuery })}</p>
              ) : (
                <div className="space-y-6">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSearchQuery('');
                        changeSection(result.section as keyof typeof HELP_SECTION_IDS);
                        setTimeout(() => scrollToSection(result.subsection), 100);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSearchQuery('');
                          changeSection(result.section as keyof typeof HELP_SECTION_IDS);
                          setTimeout(() => scrollToSection(result.subsection), 100);
                        }
                      }}
                      className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#99334C] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#99334C] uppercase tracking-wide">
                        <span>{sections[result.section as keyof typeof sections]?.title}</span>
                        <ChevronRight size={12} />
                        <span>{result.title}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#99334C] transition-colors">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{result.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 md:p-3 bg-[#99334C] dark:bg-[#ff9daf] rounded-lg">
                  <Icon size={20} className="text-white dark:text-gray-900 md:w-6 md:h-6" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {currentSection?.title}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg">{currentSection?.subtitle}</p>
            </div>
          )}

          {!searchResults &&
            currentSection?.subsections.map((subsection) => {
              const subsectionContent = content[activeSection]?.[subsection.id];

              if (subsectionContent?.isForm) {
                return (
                  <section key={subsection.id} id={subsection.id} className="mb-12 md:mb-16 scroll-mt-24">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                      {t('sections.support.subsections.contact')}
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                          {contextContact('formTitle')}
                        </h3>

                        {formSubmitted ? (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Send className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-bold text-green-900 dark:text-green-200 mb-2">
                              {contextContact('success')}
                            </h4>
                            <p className="text-green-700 dark:text-green-300">{contextContact('replyTime')}</p>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {contextContact('name')}
                              </label>
                              <input
                                type="text"
                                value={contactForm.nom}
                                onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder={contextContact('namePlaceholder')}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {contextContact('email')}
                              </label>
                              <input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder={contextContact('emailPlaceholder')}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {contextContact('subject')}
                              </label>
                              <input
                                type="text"
                                value={contactForm.sujet}
                                onChange={(e) => setContactForm({ ...contactForm, sujet: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder={contextContact('subjectPlaceholder')}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {contextContact('description')}
                              </label>
                              <textarea
                                value={contactForm.description}
                                onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder={contextContact('descriptionPlaceholder')}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleContactSubmit}
                              disabled={isSubmitting}
                              className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  {contextContact('sending')}
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5" />
                                  {contextContact('send')}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-2xl p-6 md:p-8 text-white">
                          <h3 className="text-xl font-bold mb-6">{contextContact('infoTitle')}</h3>
                          <div className="space-y-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold mb-1">{contextContact('email')}</p>
                                <p className="text-white/90 text-sm">{t('contactHint')}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold mb-1">{contextContact('hoursTitle')}</p>
                                <p className="text-white/90 text-sm">{contextContact('replyTime')}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                            {t('docsHintTitle')}
                          </h4>
                          <p className="text-blue-800 dark:text-blue-200 text-sm">{t('docsHintBody')}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              return (
                <section key={subsection.id} id={subsection.id} className="mb-12 md:mb-16 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {subsectionContent?.title || subsection.title}
                  </h2>
                  <div className="prose prose-sm md:prose-lg max-w-none dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {subsectionContent?.content}
                    </p>
                  </div>
                </section>
              );
            })}
        </div>
      </div>

      <div
        className={`
        fixed xl:relative inset-y-0 right-0 z-40
        w-72 xl:w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileTocOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}
      >
        <div className="p-6 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('onThisPage')}
            </h3>
            <button
              type="button"
              onClick={() => setIsMobileTocOpen(false)}
              className="xl:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={18} />
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {currentSection?.subsections.map((subsection) => (
                <li key={subsection.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(subsection.id)}
                    className={`w-full text-left text-sm py-2 px-3 rounded transition-colors flex items-center gap-2 ${
                      activeSubSection === subsection.id
                        ? 'text-[#99334C] font-medium bg-[#99334C]/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {activeSubSection === subsection.id && (
                      <ChevronRight size={14} className="flex-shrink-0" />
                    )}
                    <span className={activeSubSection === subsection.id ? '' : 'ml-5'}>
                      {subsection.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileTocOpen(true)}
        className="fixed bottom-6 right-6 xl:hidden bg-[#99334C] text-white p-4 rounded-full shadow-lg z-30 hover:bg-[#7a283d] transition-colors"
      >
        <FileText size={24} />
      </button>
    </div>
  );
};

export default HelpCenter;
