"use client";
import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  Share2,
  Trash2,
  Edit3,
  FileText,
  Calendar,
  User,
  MoreVertical,
  FolderOpen
} from 'lucide-react';

const EditHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Templates mockés (sera remplacé par l'API)
  const templates = [
    { id: 1, name: 'Template Vide', type: 'blank', preview: null },
    { id: 2, name: 'Cours Académique', type: 'academic', preview: null },
    { id: 3, name: 'Formation Pro', type: 'professional', preview: null },
    { id: 4, name: 'Guide Personnel', type: 'personal', preview: null },
    { id: 5, name: 'Documentation', type: 'documentation', preview: null },
  ];

  // Compositions mockées (sera remplacé par l'API)
  const compositions = [
    {
      id: 1,
      title: 'Cours de Réseaux Bercé Année 2020',
      dateModification: '14/12/2024',
      dateCreation: '12/12/2024',
      author: 'Fyt2 Ejcuh',
      status: 'draft'
    },
    {
      id: 2,
      title: 'Cours de Réseaux Bercé Année 2020',
      dateModification: '14/12/2024',
      dateCreation: '12/12/2024',
      author: 'Fyt2 Ejcuh',
      status: 'published'
    },
  ];

  const handleCreateNew = () => {
    console.log('Créer nouvelle composition');
    // TODO: Appel API pour créer une nouvelle composition
  };

  const handleSelectTemplate = (templateId) => {
    console.log('Template sélectionné:', templateId);
    // TODO: Appel API pour créer une composition depuis un template
  };

  const handleEdit = (compositionId) => {
    console.log('Éditer:', compositionId);
    // TODO: Navigation vers l'éditeur
  };

  const handleDownload = (compositionId) => {
    console.log('Télécharger:', compositionId);
    // TODO: Appel API pour télécharger
  };

  const handleShare = (compositionId) => {
    console.log('Partager:', compositionId);
    // TODO: Appel API pour partager
  };

  const handleDelete = (compositionId) => {
    console.log('Supprimer:', compositionId);
    // TODO: Appel API pour supprimer
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section avec Image de fond */}
      <div className="relative bg-gradient-to-r from-[#99334C]/90 to-[#7a283d]/90 text-white overflow-hidden">
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4">Bienvenue sur <span className="text-white/90">XCCM2</span></h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl">
            Commencez à créer vos cours et compositions dès maintenant
          </p>
          <button 
            onClick={handleCreateNew}
            className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Créer une Nouvelle Composition
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Templates */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Créer avec un Template</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group relative aspect-[3/4] bg-white border-2 border-gray-200 rounded-2xl hover:border-[#99334C] hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Zone de preview */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  {template.type === 'blank' ? (
                    <Plus className="w-12 h-12 text-gray-300 group-hover:text-[#99334C] transition-colors" />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-300 group-hover:text-[#99334C] transition-colors" />
                  )}
                </div>

                {/* Nom du template */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {template.name}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#99334C]/0 group-hover:bg-[#99334C]/10 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* Section Toutes mes compositions */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header du tableau */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Toutes mes compositions</h2>
                
                <div className="flex flex-wrap gap-3">
                  {/* Barre de recherche */}
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher parmi mes projets"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    />
                  </div>

                  {/* Filtre */}
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Filtrer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Nom du projet
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Date de dernière modification
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date de création
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Auteurs
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compositions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Aucune composition pour le moment</p>
                        <p className="text-gray-400 mt-2">Créez votre première composition pour commencer</p>
                      </td>
                    </tr>
                  ) : (
                    compositions.map((composition) => (
                      <tr key={composition.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#99334C]/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-[#99334C]" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{composition.title}</p>
                              {composition.status && (
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  composition.status === 'published' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {composition.status === 'published' ? 'Publié' : 'Brouillon'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{composition.dateModification}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{composition.dateCreation}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{composition.author}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(composition.id)}
                              className="p-2 rounded-lg hover:bg-[#99334C]/10 text-[#99334C] transition-all"
                              title="Éditer"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDownload(composition.id)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                              title="Télécharger"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare(composition.id)}
                              className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                              title="Partager"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(composition.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer du tableau avec pagination */}
            {compositions.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de <span className="font-semibold">1-{compositions.length}</span> sur{' '}
                  <span className="font-semibold">{compositions.length}</span> compositions
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Précédent
                  </button>
                  <button className="px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditHomePage;