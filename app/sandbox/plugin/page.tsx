"use client";

import React, { useState } from 'react';
// Normalement, dans un autre projet, ils feraient: import { XccmEditor } from '@xccm/editor-sdk';
// Ici, on importe directement le fichier local pour tester.
import { XccmEditor } from '@/packages/xccm-editor-sdk';

export default function PluginSandboxTestPage() {
  const [saveLog, setSaveLog] = useState<any[]>([]);

  // Simulation d'une page Moodle Client typique
  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Header fictif Moodle Client */}
        <header className="bg-[#2b5797] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Moodle Client LMS</h1>
            <p className="text-blue-100 text-sm mt-1">Activité: Composition de Rapport Final</p>
          </div>
          <div className="flex gap-4">
            <span className="bg-blue-800/50 px-4 py-2 rounded-full text-sm font-semibold border border-blue-700">
              Étudiant : Jean Dupont
            </span>
            <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-sm font-bold shadow transition-colors">
              Marquer l'activité terminée
            </button>
          </div>
        </header>

        {/* Espace de travail de l'activité */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Colonne de gauche: Instructions Moodle */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h2 className="font-bold text-blue-900 mb-2">Instructions</h2>
              <p className="text-sm text-blue-800 leading-relaxed">
                Rédigez votre synthèse dans l'éditeur ci-contre. 
                <br/><br/>
                Ouvrez la console ou regardez les logs en dessous pour voir le SDK récupérer vos sauvegardes depuis le serveur XCCM2 en temps réel.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
              <h2 className="font-bold text-gray-700 mb-2 text-sm uppercase">Logs d'interception (PostMessage)</h2>
              {saveLog.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Aucune sauvegarde interceptée pour l'instant...</p>
              ) : (
                <ul className="space-y-2">
                  {saveLog.map((log, i) => (
                    <li key={i} className="text-xs p-2 bg-white rounded border border-gray-100 shadow-sm">
                      <span className="text-green-600 font-bold block mb-1">{log.time}</span>
                      <span className="text-gray-600 line-clamp-3">{log.content.substring(0, 100)}...</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Colonne de droite: Le fameux Plugin XCCM2 */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white">
              
              {/* Le SDK XccmEditor (L'Iframe) */}
              <XccmEditor
                baseUrl="http://localhost:3000" // En prod, l'URL de XCCM2
                projectName="Démo"                // Remplace par le nom d'un de tes projets
                token={typeof window !== 'undefined' ? (localStorage.getItem('xccm2_auth_token') || 'demo-token') : 'demo-token'}
                height="650px"
                onSave={(data) => {
                  console.log("🔥 [Moodle Client] Reçu du Plugin XCCM2:", data);
                  setSaveLog(prev => [{ time: new Date().toLocaleTimeString(), content: data.content }, ...prev]);
                }}
              />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
