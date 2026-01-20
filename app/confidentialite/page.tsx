"use client";

import React from 'react';
import { Shield, Lock, Eye, Database, Users, FileText, Mail, AlertCircle } from 'lucide-react';

const ConfidentialitePage = () => {
  const sections = [
    {
      icon: Database,
      title: "Collecte des données",
      content: [
        {
          subtitle: "Données personnelles collectées",
          text: "Nous collectons les informations suivantes lors de votre inscription : nom, prénom, adresse e-mail, profession et organisation. Ces données sont nécessaires pour créer et gérer votre compte utilisateur."
        },
        {
          subtitle: "Données d'utilisation",
          text: "Nous collectons automatiquement des informations sur votre utilisation de la plateforme, telles que les cours créés, les projets édités, les dates de connexion et les statistiques d'interaction."
        },
        {
          subtitle: "Cookies et technologies similaires",
          text: "Nous utilisons des cookies pour maintenir votre session active et améliorer votre expérience utilisateur. Ces cookies sont essentiels au fonctionnement de la plateforme."
        }
      ]
    },
    {
      icon: Lock,
      title: "Utilisation des données",
      content: [
        {
          subtitle: "Finalités du traitement",
          text: "Vos données sont utilisées pour : gérer votre compte, vous permettre de créer et publier des cours, assurer la sécurité de la plateforme, vous envoyer des notifications importantes concernant votre compte."
        },
        {
          subtitle: "Partage avec des tiers",
          text: "Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être partagées uniquement avec les collaborateurs que vous avez explicitement autorisés sur vos projets."
        },
        {
          subtitle: "Base légale du traitement",
          text: "Le traitement de vos données repose sur : votre consentement lors de l'inscription, l'exécution du contrat de service, nos obligations légales, et nos intérêts légitimes à améliorer nos services."
        }
      ]
    },
    {
      icon: Shield,
      title: "Protection et sécurité",
      content: [
        {
          subtitle: "Mesures de sécurité",
          text: "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des données sensibles, authentification sécurisée (JWT), hébergement sécurisé, sauvegardes régulières."
        },
        {
          subtitle: "Conservation des données",
          text: "Vos données personnelles sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont supprimées dans un délai de 30 jours, sauf obligation légale de conservation."
        },
        {
          subtitle: "Transferts internationaux",
          text: "Vos données sont hébergées au Cameroun. En cas de transfert vers d'autres pays, nous nous assurons d'un niveau de protection adéquat conforme aux réglementations en vigueur."
        }
      ]
    },
    {
      icon: Users,
      title: "Vos droits",
      content: [
        {
          subtitle: "Droit d'accès et de rectification",
          text: "Vous pouvez à tout moment accéder à vos données personnelles via votre page de compte et les modifier. Vous pouvez également nous contacter pour obtenir une copie complète de vos données."
        },
        {
          subtitle: "Droit à l'effacement",
          text: "Vous avez le droit de demander la suppression de vos données personnelles. Cette suppression entraînera la fermeture de votre compte et la suppression de tous vos contenus."
        },
        {
          subtitle: "Droit à la portabilité",
          text: "Vous pouvez demander à recevoir vos données dans un format structuré et couramment utilisé (JSON, CSV) pour les transférer vers un autre service."
        },
        {
          subtitle: "Droit d'opposition",
          text: "Vous pouvez vous opposer au traitement de vos données à des fins de prospection commerciale. Vous pouvez également retirer votre consentement à tout moment."
        }
      ]
    },
    {
      icon: FileText,
      title: "Données des cours",
      content: [
        {
          subtitle: "Propriété intellectuelle",
          text: "Vous conservez l'entière propriété des contenus pédagogiques que vous créez sur la plateforme. Nous n'utilisons pas vos cours à d'autres fins que leur hébergement et leur diffusion selon vos paramètres."
        },
        {
          subtitle: "Visibilité et partage",
          text: "Vous contrôlez la visibilité de vos cours (public, privé, partagé). Les cours publics sont visibles par tous les utilisateurs de la plateforme. Les cours privés ne sont accessibles que par vous et vos collaborateurs."
        },
        {
          subtitle: "Suppression des contenus",
          text: "Vous pouvez supprimer vos cours à tout moment. La suppression est définitive et irréversible après confirmation."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "Modifications et contact",
      content: [
        {
          subtitle: "Modifications de la politique",
          text: "Nous nous réservons le droit de modifier cette politique de confidentialité. En cas de modification substantielle, vous serez informé par e-mail et via une notification sur la plateforme."
        },
        {
          subtitle: "Date de dernière mise à jour",
          text: "Cette politique de confidentialité a été mise à jour le 13 janvier 2026."
        },
        {
          subtitle: "Nous contacter",
          text: "Pour toute question concernant cette politique de confidentialité ou l'exercice de vos droits, vous pouvez nous contacter à : contact@xccm2.com ou via notre formulaire de contact."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Politique de Confidentialité
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-center">
            Nous nous engageons à protéger votre vie privée et vos données personnelles.
            Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </div>
      </section>

      {/* Contenu Principal */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-[#99334C]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  XCCM 2 (ci-après "nous", "notre" ou "la plateforme") est une plateforme éducative
                  numérique dédiée à la création et au partage de contenus pédagogiques.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  La présente politique de confidentialité vous informe sur la manière dont nous collectons,
                  utilisons, protégeons et partageons vos données personnelles conformément au Règlement Général
                  sur la Protection des Données (RGPD) et aux lois applicables en matière de protection des données.
                </p>
              </div>
            </div>
          </div>

          {/* Sections détaillées */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#99334C]/10 to-[#99334C]/5 p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#99334C] rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.subtitle}</h3>
                        <p className="text-gray-700 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Box */}
          <div className="mt-12 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-3xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Des questions sur vos données ?</h3>
                <p className="text-white/90">
                  Notre équipe est à votre disposition pour répondre à toutes vos questions concernant
                  la protection de vos données personnelles.
                </p>
              </div>
              <a
                href="/about#contact"
                className="bg-white text-[#99334C] px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Nous contacter
              </a>
            </div>
          </div>

          {/* Résumé des droits */}
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Résumé de vos droits
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Droit d'accès : Vous pouvez accéder à vos données personnelles à tout moment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Droit de rectification : Vous pouvez corriger vos données inexactes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Droit à l'effacement : Vous pouvez demander la suppression de vos données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Droit à la portabilité : Vous pouvez récupérer vos données dans un format exploitable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Droit d'opposition : Vous pouvez vous opposer au traitement de vos données</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfidentialitePage;
