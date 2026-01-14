"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Palette, Settings as SettingsIcon, Globe } from 'lucide-react';

// ============= COMPOSANT: SettingsPanel =============

interface SettingsPanelProps {
  project: any | null;
  onUpdateProject?: (data: any) => void;
}

interface StyleConfig {
  fontFamily: string;
  fontSize: string;
  color: string;
  fontWeight: string;
  fontStyle: string;
}

interface CourseMetadata {
  description: string;
  category: string;
  level: string;
  tags: string;
  author: string;
  language: string;
  isPublished: boolean;
}

interface CourseStyles {
  part: {
    title: StyleConfig;
    intro: StyleConfig;
  };
  chapter: {
    title: StyleConfig;
  };
  paragraph: {
    title: StyleConfig;
  };
}

const DEFAULT_STYLES: CourseStyles = {
  part: {
    title: {
      fontFamily: 'Arial',
      fontSize: '32',
      color: '#111827',
      fontWeight: '800',
      fontStyle: 'normal'
    },
    intro: {
      fontFamily: 'Arial',
      fontSize: '20',
      color: '#374151',
      fontWeight: '400',
      fontStyle: 'italic'
    }
  },
  chapter: {
    title: {
      fontFamily: 'Arial',
      fontSize: '24',
      color: '#1F2937',
      fontWeight: '700',
      fontStyle: 'normal'
    }
  },
  paragraph: {
    title: {
      fontFamily: 'Arial',
      fontSize: '20',
      color: '#1F2937',
      fontWeight: '600',
      fontStyle: 'normal'
    }
  }
};

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Calibri',
  'Verdana',
  'Georgia',
  'Courier New',
  'Comic Sans MS'
];

const FONT_SIZES = ['8', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '40', '48'];

const CATEGORIES = [
  'Informatique',
  'Mathématiques',
  'Sciences',
  'Langues',
  'Arts',
  'Business',
  'Médecine',
  'Ingénierie',
  'Autre'
];

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Allemand'];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ project, onUpdateProject }) => {
  const [name, setName] = useState(project?.pr_name || '');

  // Métadonnées du cours
  const [metadata, setMetadata] = useState<CourseMetadata>({
    description: '',
    category: 'Informatique',
    level: 'Débutant',
    tags: '',
    author: '',
    language: 'Français',
    isPublished: false
  });

  // Styles personnalisés
  const [courseStyles, setCourseStyles] = useState<CourseStyles>(DEFAULT_STYLES);

  // Préférences de l'éditeur
  const [editorPrefs, setEditorPrefs] = useState({
    enableComments: true,
    autoNumbering: true,
    collaborativeMode: false
  });

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.pr_name || '');
      setMetadata({
        description: (project as any).description || '',
        category: (project as any).category || 'Informatique',
        level: (project as any).level || 'Débutant',
        tags: (project as any).tags || '',
        author: (project as any).author || '',
        language: (project as any).language || 'Français',
        isPublished: (project as any).is_published || false
      });
      if ((project as any).styles) {
        setCourseStyles((project as any).styles);
      }
    }
  }, [project]);

  const debouncedSave = (data: any) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (onUpdateProject) {
        onUpdateProject(data);
      }
    }, 1000);
  };

  const handleMetadataChange = (field: keyof CourseMetadata, value: any) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);

    // Map metadata to DB fields
    const dbData: any = {};
    if (field === 'isPublished') dbData.is_published = value;
    else dbData[field] = value;

    debouncedSave(dbData);
  };

  const handleStyleChange = (
    section: 'part' | 'chapter' | 'paragraph',
    element: 'title' | 'intro',
    property: keyof StyleConfig,
    value: string
  ) => {
    setCourseStyles(prev => {
      const updated = { ...prev };
      if (section === 'part' && (element === 'title' || element === 'intro')) {
        updated.part[element] = { ...updated.part[element], [property]: value };
      } else if (section === 'chapter' && element === 'title') {
        updated.chapter.title = { ...updated.chapter.title, [property]: value };
      } else if (section === 'paragraph' && element === 'title') {
        updated.paragraph.title = { ...updated.paragraph.title, [property]: value };
      }

      debouncedSave({ styles: updated });
      return updated;
    });
  };

  const resetStyles = () => {
    setCourseStyles(DEFAULT_STYLES);
    if (onUpdateProject) {
      onUpdateProject({ styles: DEFAULT_STYLES });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. INFORMATIONS DU PROJET */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#99334C]" />
          <h4 className="text-sm font-bold text-gray-500">Informations du projet</h4>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du projet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (onUpdateProject && name !== project?.pr_name) {
                onUpdateProject({ pr_name: name });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Le changement sera sauvegardé automatiquement.</p>
        </div>
      </div>

      {/* 2. MÉTADONNÉES DU COURS */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[#99334C]" />
          <h4 className="text-sm font-bold text-gray-500">Métadonnées du cours</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              placeholder="Décrivez brièvement le contenu de ce cours..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Catégorie</label>
              <select
                value={metadata.category}
                onChange={(e) => handleMetadataChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:outline-none"
              >
                {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Niveau</label>
              <select
                value={metadata.level}
                onChange={(e) => handleMetadataChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:outline-none"
              >
                {LEVELS.map(level => <option key={level}>{level}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={metadata.tags}
              onChange={(e) => handleMetadataChange('tags', e.target.value)}
              placeholder="Python, Web, API..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Auteur</label>
            <input
              type="text"
              value={metadata.author}
              onChange={(e) => handleMetadataChange('author', e.target.value)}
              placeholder="Votre nom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. PUBLICATION */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-[#99334C]" />
          <h4 className="text-sm font-bold text-gray-500">Publication</h4>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={metadata.isPublished}
              onChange={(e) => handleMetadataChange('isPublished', e.target.checked)}
              className="mt-1 w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]"
            />
            <div>
              <span className="text-sm font-semibold text-gray-500">Publier ce cours dans la bibliothèque</span>
              <p className="text-xs text-gray-600 mt-1">
                {metadata.isPublished
                  ? "✓ Votre cours est visible publiquement dans la bibliothèque"
                  : "✗ Votre cours est privé (visible uniquement par vous)"}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 4. STYLES DE LA STRUCTURE */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#99334C]" />
            <h4 className="text-sm font-bold text-gray-500">Styles de la structure</h4>
          </div>
          <button
            onClick={resetStyles}
            className="text-xs text-[#99334C] hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-6">
          {/* PARTIES */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h5 className="text-sm font-bold text-gray-500">Parties</h5>

            {/* Titre de Partie */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Titre de partie</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Police</label>
                  <select
                    value={courseStyles.part.title.fontFamily}
                    onChange={(e) => handleStyleChange('part', 'title', 'fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_FAMILIES.map(font => <option key={font}>{font}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Taille</label>
                  <select
                    value={courseStyles.part.title.fontSize}
                    onChange={(e) => handleStyleChange('part', 'title', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Couleur</label>
                  <input
                    type="color"
                    value={courseStyles.part.title.color}
                    onChange={(e) => handleStyleChange('part', 'title', 'color', e.target.value)}
                    className="w-full h-9 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Style</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.part.title.fontWeight === '700' || courseStyles.part.title.fontWeight === '800'}
                        onChange={(e) => handleStyleChange('part', 'title', 'fontWeight', e.target.checked ? '700' : '400')}
                        className="w-3 h-3"
                      />
                      Gras
                    </label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.part.title.fontStyle === 'italic'}
                        onChange={(e) => handleStyleChange('part', 'title', 'fontStyle', e.target.checked ? 'italic' : 'normal')}
                        className="w-3 h-3"
                      />
                      Italique
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction de Partie */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Introduction de partie</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Police</label>
                  <select
                    value={courseStyles.part.intro.fontFamily}
                    onChange={(e) => handleStyleChange('part', 'intro', 'fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_FAMILIES.map(font => <option key={font}>{font}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Taille</label>
                  <select
                    value={courseStyles.part.intro.fontSize}
                    onChange={(e) => handleStyleChange('part', 'intro', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Couleur</label>
                  <input
                    type="color"
                    value={courseStyles.part.intro.color}
                    onChange={(e) => handleStyleChange('part', 'intro', 'color', e.target.value)}
                    className="w-full h-9 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Style</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.part.intro.fontWeight === '700' || courseStyles.part.intro.fontWeight === '800'}
                        onChange={(e) => handleStyleChange('part', 'intro', 'fontWeight', e.target.checked ? '700' : '400')}
                        className="w-3 h-3"
                      />
                      Gras
                    </label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.part.intro.fontStyle === 'italic'}
                        onChange={(e) => handleStyleChange('part', 'intro', 'fontStyle', e.target.checked ? 'italic' : 'normal')}
                        className="w-3 h-3"
                      />
                      Italique
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAPITRES */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h5 className="text-sm font-bold text-gray-500">Chapitres</h5>

            {/* Titre de Chapitre */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Titre de chapitre</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Police</label>
                  <select
                    value={courseStyles.chapter.title.fontFamily}
                    onChange={(e) => handleStyleChange('chapter', 'title', 'fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_FAMILIES.map(font => <option key={font}>{font}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Taille</label>
                  <select
                    value={courseStyles.chapter.title.fontSize}
                    onChange={(e) => handleStyleChange('chapter', 'title', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Couleur</label>
                  <input
                    type="color"
                    value={courseStyles.chapter.title.color}
                    onChange={(e) => handleStyleChange('chapter', 'title', 'color', e.target.value)}
                    className="w-full h-9 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Style</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.chapter.title.fontWeight === '700' || courseStyles.chapter.title.fontWeight === '800'}
                        onChange={(e) => handleStyleChange('chapter', 'title', 'fontWeight', e.target.checked ? '700' : '400')}
                        className="w-3 h-3"
                      />
                      Gras
                    </label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.chapter.title.fontStyle === 'italic'}
                        onChange={(e) => handleStyleChange('chapter', 'title', 'fontStyle', e.target.checked ? 'italic' : 'normal')}
                        className="w-3 h-3"
                      />
                      Italique
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PARAGRAPHES */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h5 className="text-sm font-bold text-gray-500">Paragraphes</h5>

            {/* Titre de Paragraphe */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Titre de paragraphe</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Police</label>
                  <select
                    value={courseStyles.paragraph.title.fontFamily}
                    onChange={(e) => handleStyleChange('paragraph', 'title', 'fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_FAMILIES.map(font => <option key={font}>{font}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Taille</label>
                  <select
                    value={courseStyles.paragraph.title.fontSize}
                    onChange={(e) => handleStyleChange('paragraph', 'title', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Couleur</label>
                  <input
                    type="color"
                    value={courseStyles.paragraph.title.color}
                    onChange={(e) => handleStyleChange('paragraph', 'title', 'color', e.target.value)}
                    className="w-full h-9 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Style</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.paragraph.title.fontWeight === '700' || courseStyles.paragraph.title.fontWeight === '800'}
                        onChange={(e) => handleStyleChange('paragraph', 'title', 'fontWeight', e.target.checked ? '700' : '400')}
                        className="w-3 h-3"
                      />
                      Gras
                    </label>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseStyles.paragraph.title.fontStyle === 'italic'}
                        onChange={(e) => handleStyleChange('paragraph', 'title', 'fontStyle', e.target.checked ? 'italic' : 'normal')}
                        className="w-3 h-3"
                      />
                      Italique
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PRÉFÉRENCES DE L'ÉDITEUR */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <SettingsIcon className="w-4 h-4 text-[#99334C]" />
          <h4 className="text-sm font-bold text-gray-500">Préférences de l'éditeur</h4>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={editorPrefs.enableComments}
              onChange={(e) => setEditorPrefs(prev => ({ ...prev, enableComments: e.target.checked }))}
              className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]"
            />
            <span className="text-sm text-gray-700">Activer les commentaires</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={editorPrefs.autoNumbering}
              onChange={(e) => setEditorPrefs(prev => ({ ...prev, autoNumbering: e.target.checked }))}
              className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]"
            />
            <span className="text-sm text-gray-700">Numérotation automatique</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={editorPrefs.collaborativeMode}
              onChange={(e) => setEditorPrefs(prev => ({ ...prev, collaborativeMode: e.target.checked }))}
              className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]"
            />
            <span className="text-sm text-gray-700">Mode collaboratif</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Langue du cours</label>
          <select
            value={metadata.language}
            onChange={(e) => handleMetadataChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-[#99334C] focus:outline-none"
          >
            {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
