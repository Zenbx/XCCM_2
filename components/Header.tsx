"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { LogOut, Settings, User as UserIcon, Menu, X } from "lucide-react";

const COLORS = {
  primary: "#99334C",
  text: "#4B5563",
};

const LINKS = [
  { label: "Accueil", href: "/", icon: <FaHome /> },
  { label: "À propos", href: "/about", icon: <FaInfoCircle /> },
  { label: "Éditer", href: "/edit-home", authOnly: true, icon: <FaEdit /> },
  { label: "Bibliothèque", href: "/library", icon: <FaBook /> },
  { label: "Aide", href: "/help", icon: <FaQuestionCircle /> },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  
  // État pour le menu dropdown desktop
  const [showUserMenu, setShowUserMenu] = useState(false);
  // État pour le menu mobile (burger)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fermer le menu mobile automatiquement quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handleMenuBlur = () => {
    setTimeout(() => setShowUserMenu(false), 200);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between lg:justify-center px-6 py-3 relative min-h-[60px]">
        
        {/* --- LOGO --- */}
        {/* En mobile : position statique. En Desktop : absolute left-6 pour garder ton design */}
        <div className="lg:absolute lg:left-6 z-20">
          <Link href="/" className="text-xl font-bold" style={{ color: COLORS.primary }}>
            XCCM2
          </Link>
        </div>

        {/* --- NAVIGATION DESKTOP (Cachée sur mobile) --- */}
        <ul className="hidden lg:flex items-center gap-[40px] relative">
          {!isLoading &&
            LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={clsx(
                      "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-[8px] group"
                    )}
                    style={{
                      color: isActive ? COLORS.primary : COLORS.text,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-[8px]"
                        style={{ backgroundColor: "#99334C4D" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2 group-hover:text-[#99334C] transition-colors">
                      {link.icon}
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>

        {/* --- ACTIONS UTILISATEUR DESKTOP (Cachées sur mobile) --- */}
        <div className="hidden lg:flex absolute right-6 items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={handleMenuBlur}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#99334C] text-white flex items-center justify-center font-semibold">
                  {user.firstname?.[0]}{user.lastname?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 block">
                  {user.firstname} {user.lastname}
                </span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {user.occupation && (
                      <p className="text-xs text-gray-400 mt-1">{user.occupation}</p>
                    )}
                  </div>
                  <div className="py-2">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">Mon compte</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Paramètres</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-all w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-[8px] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.primary }}
              >
                S'inscrire
              </Link>
              <Link
                href="/login"
                className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-all hover:bg-[#99334C1A]"
                style={{
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                }}
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* --- BOUTON MENU MOBILE (Visible uniquement sur mobile) --- */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* --- DRAWER / MENU MOBILE --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop (Fond sombre) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            />
            
            {/* Panneau Latéral */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl z-50 flex flex-col lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg" style={{ color: COLORS.primary }}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500">
                  <X size={24} />
                </button>
              </div>

              {/* Contenu Mobile : Navigation */}
              <div className="p-4 flex flex-col gap-2">
                {LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                        isActive ? "bg-[#99334C1A]" : "hover:bg-gray-50"
                      )}
                      style={{ color: isActive ? COLORS.primary : COLORS.text }}
                    >
                      <span className="text-lg">{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Contenu Mobile : Auth / User Actions */}
              <div className="mt-auto p-4 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-[#99334C] text-white flex items-center justify-center font-bold">
                        {user.firstname?.[0]}{user.lastname?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{user.firstname} {user.lastname}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                        <UserIcon size={16} /> Mon compte
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                        <Settings size={16} /> Paramètres
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full flex justify-center py-2.5 rounded-lg border text-sm font-medium"
                      style={{ color: COLORS.primary, borderColor: COLORS.primary }}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/register"
                      className="w-full flex justify-center py-2.5 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}