"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { COLORS } from "@/constants/colors";
import { FaHome, FaInfoCircle, FaEdit, FaBook, FaQuestionCircle } from "react-icons/fa";

type HeaderProps = {
  isAuthenticated: boolean;
};

const LINKS = [
  { label: "Accueil", href: "/", icon: <FaHome /> },
  { label: "À propos", href: "/edit-home", icon: <FaInfoCircle /> },
  { label: "Éditer", href: "/edit", authOnly: true, icon: <FaEdit /> },
  { label: "Bibliothèque", href: "/library", icon: <FaBook /> },
  { label: "Aide", href: "/help", icon: <FaQuestionCircle /> },
];

export default function Header({ isAuthenticated }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-6 py-3">
        {/* Navigation */}
        <ul className="flex items-center gap-[64px]">
          {LINKS.filter(link => !link.authOnly || isAuthenticated).map(link => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium transition",
                    isActive
                      ? "border"
                      : ""
                  )}
                  style={{
                    color: isActive ? COLORS.primary : COLORS.text,
                    borderColor: isActive ? COLORS.primary : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                  <style jsx>{`
                    a:hover {
                      color: ${COLORS.primary};
                      background-color: ${COLORS.primary}33; /* 30% opacity */
                    }
                  `}</style>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="absolute right-6 flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="rounded-8xl border px-4 py-1 text-sm font-medium"
                style={{
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                }}
              >
                Mon compte
              </Link>

              <button
                className="rounded-8xl px-4 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-8xl px-4 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                S’inscrire
              </Link>

              <Link
                href="/login"
                className="rounded-8xl border px-4 py-1 text-sm font-medium"
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
