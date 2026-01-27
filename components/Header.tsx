"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle, FaGlobe, FaUsers, FaStore } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { LogOut, Settings, User as UserIcon, Menu, X, BarChart2, ShieldCheck } from "lucide-react";
import LanguageToggle from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslations } from 'next-intl';

const COLORS = {
  primary: "#99334C",
  text: "#4B5563",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();
  const tHeader = useTranslations('header');
  const tAuth = useTranslations('auth');

  const LINKS = [
    { label: tHeader('links.home'), href: '/', icon: <FaHome /> },
    { label: tHeader('links.about'), href: '/about', icon: <FaInfoCircle /> },
    { label: tHeader('links.edit'), href: '/edit-home', authOnly: true, icon: <FaEdit /> },
    { label: tHeader('links.library'), href: '/library', icon: <FaBook /> },
    { label: tHeader('links.marketplace'), href: '/marketplace', authOnly: true, icon: <FaStore /> },
    { label: tHeader('links.help'), href: '/help', icon: <FaQuestionCircle /> },
  ];

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

  // Hide header on specific routes that manage their own layout/header
  if (pathname?.includes('/book-reader') || pathname?.includes('/admin') || pathname?.startsWith('/edit')) return null;

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md border-b border-gray-100 dark:border-gray-800 fixed top-0 left-0 right-0" style={{ zIndex: 2 }}>
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2 min-h-[60px] lg:min-h-[70px]">

        {/* --- LOGO --- */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-pro.png"
              alt="XCCM2 Logo"
              width={160}
              height={50}
              className="h-10 lg:h-16 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* --- NAVIGATION DESKTOP --- */}
        <div className="hidden lg:flex flex-1 justify-start px-8 ml-8">
          <ul className="flex items-center gap-1 xl:gap-2">
            {!isLoading && LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={clsx(
                      "relative flex items-center gap-1.5 px-3 py-2 text-xs xl:text-sm font-medium transition-all duration-300 rounded-lg group whitespace-nowrap"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-lg bg-[#99334C]/10 dark:bg-[#ff9daf]/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={clsx("relative z-10 flex items-center gap-2 transition-colors",
                      isActive ? "text-[#99334C] dark:text-[#ff9daf]" : "text-gray-600 dark:text-gray-300 group-hover:text-[#99334C] dark:group-hover:text-[#ff9daf]"
                    )}>
                      {link.icon}
                      <span className="hidden xl:inline">{link.label}</span>
                      <span className="xl:hidden">{link.label.length > 10 ? link.label.substring(0, 8) + '...' : link.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* --- ACTIONS UTILISATEUR DESKTOP --- */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={handleMenuBlur}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#99334C] text-white flex items-center justify-center font-semibold overflow-hidden shadow-sm">
                  {user.profile_picture ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_picture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.firstname?.[0]}{user.lastname?.[0]}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">
                  {user.firstname} {user.lastname}
                </span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2"
                  style={{ zIndex: 1000000 }}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.firstname} {user.lastname}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    {user.occupation && (
                      <p className="text-xs text-gray-400 mt-1">{user.occupation}</p>
                    )}
                  </div>
                  <div className="py-2">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-[#99334C] hover:bg-[#99334C]/5 transition-all font-bold"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm">{tAuth('admin')}</span>
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">{tAuth('account')}</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">{tAuth('settings')}</span>
                    </Link>
                    <Link
                      href="/analytics"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span className="text-sm">{tAuth('analytics')}</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{tAuth('logout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-[8px] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: COLORS.primary }}
              >
                {tAuth('register')}
              </Link>
              <Link
                href="/login"
                className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-all hover:bg-[#99334C1A] dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800"
                style={{
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                }}
              >
                {tAuth('login')}
              </Link>
            </>
          )}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <ThemeToggle />
          <LanguageToggle />
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
              style={{ zIndex: 1000000 }}
            />

            {/* Panneau Latéral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col lg:hidden overflow-y-auto"
              style={{ zIndex: 1000001 }}
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="font-bold text-lg" style={{ color: COLORS.primary }}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 justify-between">
                <LanguageToggle />
                <ThemeToggle />
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
                        isActive ? "bg-[#99334C1A] dark:bg-[#99334C33]" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      style={{ color: isActive ? COLORS.primary : undefined }}
                    >
                      <span className={clsx("text-lg", !isActive && "text-gray-600 dark:text-gray-300")}>{link.icon}</span>
                      <span className={clsx(!isActive && "text-gray-600 dark:text-gray-300")}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Contenu Mobile : Auth / User Actions */}
              <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-800">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-[#99334C] text-white flex items-center justify-center font-bold overflow-hidden shadow-sm">
                        {user.profile_picture ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_picture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.firstname?.[0]}{user.lastname?.[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-white">{user.firstname} {user.lastname}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-[#99334C] dark:text-[#ff9daf] bg-[#99334C]/5 dark:bg-[#ff9daf]/10 hover:bg-[#99334C]/10 dark:hover:bg-[#ff9daf]/20 rounded-lg text-sm font-bold">
                          <ShieldCheck size={16} /> {tAuth('admin')}
                        </Link>
                      )}
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                        <UserIcon size={16} /> {tAuth('account')}
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                        <Settings size={16} /> {tAuth('settings')}
                      </Link>
                      <Link href="/analytics" className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                        <BarChart2 size={16} /> {tAuth('analytics')}
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition-colors">
                        <LogOut size={16} /> {tAuth('logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full flex justify-center py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                      style={{ color: COLORS.primary, borderColor: COLORS.primary }}
                    >
                      {tAuth('login')}
                    </Link>
                    <Link
                      href="/register"
                      className="w-full flex justify-center py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 shadow-md"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {tAuth('register')}
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