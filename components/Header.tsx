"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const handleMenuBlur = () => {
    setTimeout(() => setShowUserMenu(false), 200);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-6 py-3 relative">
        {/* Logo */}
        <div className="absolute left-6">
          <Link href="/" className="text-xl font-bold" style={{ color: COLORS.primary }}>
            XCCM2
          </Link>
        </div>

        {/* Navigation */}
        <ul className="flex items-center gap-[40px] relative">
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

        {/* Actions utilisateur */}
        <div className="absolute right-6 flex items-center gap-3">
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
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user.firstname} {user.lastname}
                </span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
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
      </nav>
    </header>
  );
}
    