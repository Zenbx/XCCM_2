"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const noPaddingRoutes = ["/edit", "/book-reader", "/admin"];
    const shouldHidePadding = noPaddingRoutes.some(route => pathname?.startsWith(route));

    return (
        <div
            className={shouldHidePadding ? "" : "pt-[60px] lg:pt-[70px]"}
            style={{ position: 'relative' }}
        >
            {children}
        </div>
    );
}
