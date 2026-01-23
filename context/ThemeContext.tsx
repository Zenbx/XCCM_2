"use client";

import React from "react";
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </NextThemeProvider>
    );
}

export function useTheme() {
    const { theme, setTheme, resolvedTheme } = useNextTheme();
    return {
        theme: (theme as "light" | "dark" | "system") || "system",
        setTheme,
        resolvedTheme
    };
}

