"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileStack,
    Settings,
    BarChart3,
    ChevronLeft,
    Menu,
    LogOut,
    Bell,
    Search,
    ShieldCheck,
    CheckCircle2,
    LayoutTemplate,
    Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
    { label: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
    { label: 'Utilisateurs', href: '/admin/users', icon: Users },
    { label: 'Projets Globaux', href: '/admin/projects', icon: FileStack },
    { label: 'Projets Publiés', href: '/admin/published', icon: CheckCircle2 },
    { label: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
    { label: 'Marketplace', href: '/admin/marketplace', icon: Store },
    { label: 'Analyses', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans font-medium text-gray-700">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="hidden lg:flex flex-col bg-white border-r border-gray-100 z-30 transition-all duration-300"
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 bg-gray-50/10">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-xl flex items-center justify-center shadow-lg shadow-[#99334C]/20">
                                <ShieldCheck className="text-white w-5 h-5 shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-lg text-gray-900 leading-none tracking-tight">Admin<span className="text-[#99334C]">OS</span></span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Plateforme</span>
                            </div>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-[#99334C]/5 rounded-lg text-gray-400 hover:text-[#99334C] transition-all"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-[#99334C] text-white shadow-lg shadow-[#99334C]/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#99334C]'}`} />
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-bold text-xs tracking-tight"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeInd"
                                        className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <Link
                        href="/"
                        className="flex items-center gap-3.5 px-4 py-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                    >
                        <LogOut className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                        {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Sortie Alpha</span>}
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Redundant Top Header Removed to fix stacking issues */}

                {/* Content Section */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 bg-gray-50/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="text-white w-4 h-4" />
                                    </div>
                                    <span className="font-black text-lg text-gray-900 tracking-tight">Admin<span className="text-[#99334C]">OS</span></span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                                {sidebarItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 relative ${isActive
                                                ? 'bg-[#99334C] text-white shadow-lg shadow-[#99334C]/20'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            <span className="font-bold text-xs tracking-tight">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-4 border-t border-gray-50">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3.5 px-4 py-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-4.5 h-4.5" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Sortie Alpha</span>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
}
