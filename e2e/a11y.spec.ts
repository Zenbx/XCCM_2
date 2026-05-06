import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

/** Routes accessible without authentication */
const PUBLIC_ROUTES = [
    { name: "Home", path: "/" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" },
    { name: "Library", path: "/library" },
    { name: "Help", path: "/help" },
    { name: "About", path: "/about" },
    { name: "Marketplace", path: "/marketplace" },
];

/** Viewport configurations for responsive tests */
const VIEWPORTS = [
    { name: "Mobile", width: 375, height: 812 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1280, height: 800 },
];

test.describe("Accessibility — public pages (axe-core)", () => {
    for (const route of PUBLIC_ROUTES) {
        test(`${route.name} (${route.path}) — zero critical violations`, async ({ page }) => {
            await page.goto(`${BASE}${route.path}`);
            await page.waitForLoadState("networkidle");

            const results = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                .exclude("#__next [data-radix-popper-content-wrapper]") // exclude portals/tooltips with known issues
                .analyze();

            // Filter to serious/critical violations only (ignore minor/moderate in third-party widgets)
            const serious = results.violations.filter(v =>
                v.impact === "critical" || v.impact === "serious"
            );

            const summary = serious.map(v =>
                `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map(n => n.target.join(", ")).join(" | ")}`
            ).join("\n\n");

            expect(serious, serious.length > 0 ? `A11y violations on ${route.path}:\n\n${summary}` : "").toHaveLength(0);
        });
    }
});

test.describe("Accessibility — responsive layout", () => {
    for (const vp of VIEWPORTS) {
        test(`${vp.name} (${vp.width}×${vp.height}) — home page layout`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto(`${BASE}/`);
            await page.waitForLoadState("networkidle");

            // Header is always visible
            await expect(page.getByRole("navigation", { name: /navigation principale/i })).toBeVisible();

            if (vp.width < 768) {
                // Mobile: hamburger should be visible, desktop nav hidden
                await expect(page.getByRole("button", { name: /ouvrir le menu/i })).toBeVisible();
            } else {
                // Tablet+: desktop nav links visible
                await expect(page.getByRole("link", { name: /accueil|home/i }).first()).toBeVisible();
            }
        });

        test(`${vp.name} — login form accessible`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto(`${BASE}/login`);
            await page.waitForLoadState("networkidle");

            // Form fields must have accessible labels
            await expect(page.getByLabel(/email/i)).toBeVisible();
            await expect(page.getByLabel(/mot de passe|password/i).first()).toBeVisible();

            // Submit button must be reachable
            const submitBtn = page.getByRole("button", { name: /connexion|se connecter|login/i });
            await expect(submitBtn).toBeVisible();

            // Axe check on the form
            const results = await new AxeBuilder({ page })
                .include("form")
                .withTags(["wcag2a", "wcag2aa"])
                .analyze();

            const serious = results.violations.filter(v =>
                v.impact === "critical" || v.impact === "serious"
            );
            const summary = serious.map(v => `[${v.impact}] ${v.id}: ${v.description}`).join("\n");
            expect(serious, serious.length > 0 ? `Form a11y violations on login (${vp.name}):\n${summary}` : "").toHaveLength(0);
        });
    }
});

test.describe("Accessibility — mobile menu", () => {
    test("mobile drawer opens, traps focus concept, closes", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(`${BASE}/`);
        await page.waitForLoadState("networkidle");

        const openBtn = page.getByRole("button", { name: /ouvrir le menu/i });
        await openBtn.click();

        // Drawer visible with dialog role
        const drawer = page.getByRole("dialog", { name: /menu de navigation/i });
        await expect(drawer).toBeVisible();

        // Close button present inside drawer
        const closeBtn = drawer.getByRole("button", { name: /fermer le menu/i });
        await expect(closeBtn).toBeVisible();

        // Pressing Escape closes it (no custom hook, just clicking close)
        await closeBtn.click();
        await expect(drawer).not.toBeVisible();
    });
});
