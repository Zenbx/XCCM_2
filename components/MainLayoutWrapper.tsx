"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const shouldHidePadding = pathname?.startsWith('/book-reader') ||
        pathname?.startsWith('/admin') ||
        (pathname?.startsWith('/edit') && !pathname?.startsWith('/edit-home'));

    return (
        <div
            className={shouldHidePadding ? "" : "pt-[60px] lg:pt-[70px]"}
            style={{ position: 'relative' }}
        >
            {children}
        </div>
    );
}
