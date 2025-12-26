"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { COLORS } from "@/constants/colors";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between lg:justify-center lg:gap-8 px-4 sm:px-6 py-3">

        {/* Bouton Hamburger Mobile (à gauche) */}
        <button
          className="lg:hidden p-2 text-[#99334C] hover:bg-[#99334C]/10 rounded-lg transition-all duration-200 active:scale-95"
          onClick={() => setIsDrawerOpen(prev => !prev)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Menu Desktop - Centré */}
        <ul className="hidden lg:flex items-center gap-2 xl:gap-6">
          {LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={clsx(
                    "relative flex items-center gap-2 px-3 xl:px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group"
                  )}
                  style={{ color: isActive ? "#99334C" : COLORS.text }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: "#99334C4D" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-[#99334C] group-hover:scale-105 transition-all duration-200">
                    {link.icon} 
                    <span>{link.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Spacer pour centrer les boutons sur mobile */}
        <div className="flex-1 lg:hidden" />

        {/* Actions (Toujours visibles) - Centrées sur desktop */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-[#99334C1A] hover:scale-105 active:scale-95"
                style={{ color: "#99334C", borderColor: "#99334C" }}
              >
                <span className="hidden sm:inline">Mon compte</span>
                <span className="sm:hidden">Compte</span>
              </Link>
              <button
                className="rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#99334C" }}
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Sortir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: "#99334C" }}
              >
                S'inscrire
              </Link>
              <Link
                href="/login"
                className="rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-[#99334C1A] hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{ color: "#99334C", borderColor: "#99334C" }}
              >
                <span className="hidden sm:inline">Se connecter</span>
                <span className="sm:hidden">Connexion</span>
              </Link>
            </>
          )}
        </div>

        {/* Drawer Mobile avec AnimatePresence */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsDrawerOpen(false)}
              />
              
              {/* Drawer animé */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl overflow-y-auto"
              >
                <div className="p-6">
                  {/* En-tête du drawer */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-[#99334C]">Menu</h2>
                    <button
                      className="text-2xl font-bold text-[#99334C] hover:bg-[#99334C] hover:text-white p-2 rounded-lg transition-all duration-200 active:scale-95"
                      onClick={() => setIsDrawerOpen(false)}
                      aria-label="Fermer le menu"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Liste des liens */}
                  <ul className="flex flex-col gap-2">
                    {LINKS.filter(link => !link.authOnly || isAuthenticated).map((link, index) => {
                      const isActive = pathname === link.href;
                      
                      return (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            className={clsx(
                              "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-[#99334C]/10 hover:translate-x-1 active:scale-95",
                              isActive && "bg-[#99334C]/10 text-[#99334C]"
                            )}
                            style={{ color: isActive ? "#99334C" : "#374151" }}
                            onClick={() => setIsDrawerOpen(false)}
                          >
                            <span className="text-lg">{link.icon}</span>
                            <span>{link.label}</span>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>

                  {/* Actions dans le drawer (optionnel pour mobile) */}
                  {isAuthenticated && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <Link
                        href="/account"
                        className="block w-full text-center rounded-lg border border-[#99334C] px-4 py-3 text-sm font-medium text-[#99334C] transition-all duration-200 hover:bg-[#99334C1A] active:scale-95 mb-2"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        Mon compte
                      </Link>
                      <button
                        className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: "#99334C" }}
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}