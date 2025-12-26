"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_LIST: FAQItem[] = [
  {
    question: "Comment créer un compte XCCM 2 ?",
    answer: "Pour créer un compte, cliquez sur 'S’inscrire' en haut à droite et remplissez le formulaire."
  },
  {
    question: "Puis-je partager mes contenus avec d'autres enseignants ?",
    answer: "Oui, vous pouvez partager vos contenus via le bouton 'Partager' dans l’interface du cours."
  },
  {
    question: "Comment récupérer mon mot de passe ?",
    answer: "Cliquez sur 'Mot de passe oublié' dans la page de connexion et suivez les instructions."
  },
  {
    question: "Puis-je importer des documents existants ?",
    answer: "Oui, XCCM 2 permet d’importer différents formats de documents via l’onglet 'Importer'."
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#99334C] font-medium hover:underline mb-6"
          >
            Retour à l’accueil
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            FAQ - Foire Aux Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Retrouvez ici les réponses aux questions les plus fréquentes concernant XCCM 2.
          </p>
        </div>
      </section>

      {/* Contenu FAQ */}
      <section className="px-6 py-16 max-w-4xl mx-auto space-y-4">
        {FAQ_LIST.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => toggleItem(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-[#99334C]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#99334C]" />
              )}
            </div>
            {openIndex === index && (
              <p className="mt-4 text-gray-600">{item.answer}</p>
            )}
          </div>
        ))}
      </section>
    </main>
  );
};

export default FAQPage;
