"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { COLORS } from "@/constants/colors";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion"; // Pour l'animation de glissement

type HeaderProps = {
  isAuthenticated: boolean;
};

const LINKS = [
  { label: "Accueil", href: "/", icon: <FaHome /> },
  { label: "À propos", href: "/about", icon: <FaInfoCircle /> },
  { label: "Éditer", href: "/edit-home", authOnly: true, icon: <FaEdit /> },
  { label: "Bibliothèque", href: "/library", icon: <FaBook /> },
  { label: "Aide", href: "/help", icon: <FaQuestionCircle /> },
];

export default function Header({ isAuthenticated }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100">
      <nav className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-3">

        
        {/* Navigation */}
        <ul className="flex items-center gap-[40px] relative">
          {LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={clsx(
                    "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-[8px] group"
                  )}
                  style={{
                    // Texte bordeaux si actif, sinon couleur par défaut
                    color: isActive ? "#99334C" : COLORS.text,
                  }}
                >
                  {/* Fond animé qui glisse (layoutId est la clé ici) */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-[8px]"
                      style={{ backgroundColor: "#99334C4D" }} // Bordeaux avec 30% d'opacité
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Contenu du lien (Icon + Label) */}
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-[#99334C] transition-colors">
                    {link.icon}
                   <span className="hidden md:inline">{link.label}</span>
                  </span>

                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions (Boutons à droite) */}
        <div className="absolute right-6 flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-all hover:bg-[#99334C1A]"
                style={{
                  color: "#99334C",
                  borderColor: "#99334C",
                }}
              >
                Mon compte
              </Link>

              <button
                className="rounded-[8px] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#99334C" }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-[8px] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#99334C" }}
              >
                S’inscrire
              </Link>

              <Link
                href="/login"
                className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-all hover:bg-[#99334C1A]"
                style={{
                  color: "#99334C",
                  borderColor: "#99334C",
                }}
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}