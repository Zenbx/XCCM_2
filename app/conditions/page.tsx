"use client";

import React from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, UserCheck, BookOpen, Shield } from 'lucide-react';

const ConditionsPage = () => {
  const sections = [
    {
      icon: UserCheck,
      title: "Acceptation des conditions",
      content: [
        {
          subtitle: "Accord contractuel",
          text: "En créant un compte et en utilisant la plateforme XCCM 2, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services."
        },
        {
          subtitle: "Capacité juridique",
          text: "Vous déclarez avoir la capacité juridique de contracter et d'accepter ces conditions. Si vous utilisez la plateforme au nom d'une organisation, vous déclarez avoir l'autorité de lier cette organisation à ces conditions."
        },
        {
          subtitle: "Modifications des conditions",
          text: "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications substantielles vous seront notifiées par e-mail et via la plateforme. Votre utilisation continue après notification vaut acceptation des nouvelles conditions."
        }
      ]
    },
    {
      icon: BookOpen,
      title: "Services proposés",
      content: [
        {
          subtitle: "Description des services",
          text: "XCCM 2 est une plateforme éducative permettant de créer, organiser, publier et partager des contenus pédagogiques structurés. Nous proposons des outils d'édition, de collaboration et d'export de documents."
        },
        {
          subtitle: "Disponibilité du service",
          text: "Nous nous efforçons de maintenir la plateforme accessible 24h/24 et 7j/7, mais ne garantissons pas une disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour ou cas de force majeure."
        },
        {
          subtitle: "Évolution des services",
          text: "Nous nous réservons le droit d'ajouter, modifier ou supprimer des fonctionnalités à tout moment. Les modifications importantes seront communiquées aux utilisateurs avec un préavis raisonnable."
        }
      ]
    },
    {
      icon: CheckCircle,
      title: "Droits et obligations de l'utilisateur",
      content: [
        {
          subtitle: "Création de compte",
          text: "Vous devez fournir des informations exactes et à jour lors de votre inscription. Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités effectuées sous votre compte."
        },
        {
          subtitle: "Usage autorisé",
          text: "Vous pouvez utiliser la plateforme pour créer et partager des contenus pédagogiques légaux et conformes à nos politiques. Vous conservez tous les droits de propriété intellectuelle sur vos contenus."
        },
        {
          subtitle: "Licence accordée à XCCM 2",
          text: "En publiant du contenu sur la plateforme, vous nous accordez une licence non exclusive, mondiale et gratuite pour héberger, stocker, reproduire et afficher votre contenu dans le cadre de la fourniture de nos services."
        },
        {
          subtitle: "Respect de la propriété intellectuelle",
          text: "Vous vous engagez à ne pas publier de contenu enfreignant les droits de propriété intellectuelle de tiers. Vous devez disposer de tous les droits nécessaires sur les contenus que vous publiez."
        }
      ]
    },
    {
      icon: XCircle,
      title: "Usages interdits",
      content: [
        {
          subtitle: "Contenus prohibés",
          text: "Il est strictement interdit de publier des contenus : illégaux, diffamatoires, haineux, discriminatoires, pornographiques, violents, incitant à la violence ou au terrorisme, portant atteinte à la vie privée d'autrui."
        },
        {
          subtitle: "Comportements interdits",
          text: "Vous ne devez pas : tenter de pirater ou compromettre la sécurité de la plateforme, utiliser des robots ou scripts automatisés sans autorisation, usurper l'identité d'une autre personne, collecter des données d'autres utilisateurs sans consentement."
        },
        {
          subtitle: "Activités commerciales non autorisées",
          text: "L'utilisation de la plateforme à des fins de spam, de publicité non sollicitée ou de marketing agressif est interdite. La revente de l'accès à la plateforme est également prohibée."
        },
        {
          subtitle: "Sanctions",
          text: "En cas de violation de ces interdictions, nous nous réservons le droit de suspendre ou supprimer votre compte sans préavis et sans remboursement."
        }
      ]
    },
    {
      icon: Scale,
      title: "Propriété intellectuelle",
      content: [
        {
          subtitle: "Droits sur la plateforme",
          text: "La plateforme XCCM 2, incluant son code source, son design, sa marque et son contenu, est protégée par les droits de propriété intellectuelle. Toute reproduction non autorisée est interdite."
        },
        {
          subtitle: "Droits sur vos contenus",
          text: "Vous conservez l'entière propriété des cours et contenus que vous créez. Vous êtes libre de les exporter, les modifier ou les supprimer à tout moment."
        },
        {
          subtitle: "Contenu des autres utilisateurs",
          text: "Le contenu publié par d'autres utilisateurs leur appartient. Vous ne pouvez pas copier, reproduire ou redistribuer ce contenu sans l'autorisation explicite de son auteur."
        },
        {
          subtitle: "Signalement de violation",
          text: "Si vous estimez qu'un contenu sur la plateforme viole vos droits de propriété intellectuelle, veuillez nous contacter à : dmca@xccm2.com avec les éléments de preuve nécessaires."
        }
      ]
    },
    {
      icon: Shield,
      title: "Responsabilités et garanties",
      content: [
        {
          subtitle: "Limitation de responsabilité",
          text: "La plateforme est fournie 'en l'état'. Nous ne garantissons pas l'absence d'erreurs, de bugs ou d'interruptions. Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation de la plateforme."
        },
        {
          subtitle: "Contenu des utilisateurs",
          text: "Nous ne sommes pas responsables du contenu publié par les utilisateurs. Chaque utilisateur est seul responsable de ses publications et de leur conformité avec les lois applicables."
        },
        {
          subtitle: "Sauvegardes",
          text: "Bien que nous effectuions des sauvegardes régulières, nous vous recommandons d'exporter et de sauvegarder régulièrement vos contenus. Nous ne garantissons pas la récupération de données en cas de perte."
        },
        {
          subtitle: "Indemnisation",
          text: "Vous acceptez de nous indemniser contre toute réclamation, perte ou dommage résultant de votre violation de ces conditions ou de votre utilisation de la plateforme."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Suspension et résiliation",
      content: [
        {
          subtitle: "Suspension du compte",
          text: "Nous pouvons suspendre temporairement votre compte en cas de violation présumée de ces conditions, en attendant une enquête. Vous serez informé par e-mail des raisons de la suspension."
        },
        {
          subtitle: "Résiliation par l'utilisateur",
          text: "Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. La suppression est définitive et entraîne la perte de tous vos contenus après un délai de 30 jours."
        },
        {
          subtitle: "Résiliation par XCCM 2",
          text: "Nous nous réservons le droit de résilier votre compte en cas de violation grave ou répétée de ces conditions, d'activité frauduleuse ou d'inactivité prolongée (plus de 2 ans)."
        },
        {
          subtitle: "Effets de la résiliation",
          text: "Après résiliation, vous perdez l'accès à la plateforme et à tous vos contenus. Les dispositions relatives à la propriété intellectuelle, la responsabilité et le règlement des litiges survivent à la résiliation."
        }
      ]
    },
    {
      icon: FileText,
      title: "Dispositions générales",
      content: [
        {
          subtitle: "Droit applicable",
          text: "Ces conditions sont régies par le droit camerounais. Tout litige relatif à ces conditions sera soumis à la compétence exclusive des tribunaux de Douala, Cameroun."
        },
        {
          subtitle: "Règlement des litiges",
          text: "En cas de litige, nous vous encourageons à nous contacter d'abord pour tenter de trouver une solution amiable. Si aucune solution n'est trouvée, le litige pourra être soumis aux tribunaux compétents."
        },
        {
          subtitle: "Divisibilité",
          text: "Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions resteront pleinement en vigueur. La disposition invalide sera remplacée par une disposition valide similaire."
        },
        {
          subtitle: "Intégralité de l'accord",
          text: "Ces conditions constituent l'intégralité de l'accord entre vous et XCCM 2 concernant l'utilisation de la plateforme et remplacent tous accords antérieurs."
        },
        {
          subtitle: "Date d'entrée en vigueur",
          text: "Ces conditions d'utilisation sont entrées en vigueur le 13 janvier 2026."
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
            <FileText className="w-16 h-16" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Conditions d'Utilisation
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-center">
            Ces conditions définissent les règles d'utilisation de la plateforme XCCM 2.
            Veuillez les lire attentivement avant d'utiliser nos services.
          </p>
        </div>
      </section>

      {/* Contenu Principal */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Préambule</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation
              de la plateforme XCCM 2 (ci-après "la Plateforme") accessible à l'adresse [URL de la plateforme].
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              La Plateforme est éditée par l'équipe XCCM 2, située à Douala, Cameroun.
            </p>
            <p className="text-gray-700 leading-relaxed">
              L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU.
              En cas de désaccord avec ces conditions, nous vous prions de ne pas utiliser nos services.
            </p>
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
                      <h2 className="text-2xl font-bold text-gray-900">Article {index + 1} - {section.title}</h2>
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

          {/* Important Notice */}
          <div className="mt-12 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Points importants à retenir
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span>Vous êtes responsable de la sécurité de votre compte et de votre mot de passe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span>Vous conservez tous les droits sur les contenus que vous créez</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span>Les contenus illégaux ou inappropriés sont strictement interdits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span>Nous recommandons de sauvegarder régulièrement vos contenus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span>La violation de ces conditions peut entraîner la suspension de votre compte</span>
              </li>
            </ul>
          </div>

          {/* Contact Box */}
          <div className="mt-12 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Questions sur les conditions d'utilisation ?</h3>
              <p className="text-white/90 mb-6">
                Notre équipe juridique est disponible pour répondre à toutes vos questions
                concernant ces conditions d'utilisation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/about#contact"
                  className="bg-white text-[#99334C] px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Nous contacter
                </a>
                <a
                  href="/confidentialite"
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all"
                >
                  Politique de confidentialité
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConditionsPage;
