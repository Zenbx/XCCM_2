import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

test.describe("Authentification — Golden Path", () => {
    test("login valide → dashboard → déconnexion", async ({ page }) => {
        // 1. Aller sur la page de login
        await page.goto(`${BASE}/login`);
        await expect(page).toHaveTitle(/XCCM/i);

        // 2. Remplir le formulaire
        await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL || "test@xccm.io");
        await page.getByLabel(/mot de passe|password/i).fill(process.env.E2E_TEST_PASSWORD || "Password123!");

        // 3. Soumettre
        await page.getByRole("button", { name: /connexion|se connecter|login/i }).click();

        // 4. Vérifier la redirection vers le dashboard
        await expect(page).toHaveURL(/edit-home|dashboard|admin/, { timeout: 10000 });

        // 5. Vérifier que l'utilisateur est connecté (header ou menu)
        await expect(page.getByRole("navigation")).toBeVisible();

        // 6. Déconnexion
        const logoutBtn = page.getByRole("button", { name: /déconnexion|logout|se déconnecter/i });
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            await expect(page).toHaveURL(/login|accueil|\/$/, { timeout: 5000 });
        }
    });

    test("login invalide → message d'erreur visible", async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.getByLabel(/email/i).fill("nobody@fake.io");
        await page.getByLabel(/mot de passe|password/i).fill("WrongPassword!");
        await page.getByRole("button", { name: /connexion|se connecter|login/i }).click();

        // Vérifier qu'un message d'erreur apparaît
        await expect(
            page.getByText(/incorrect|invalide|erreur|invalid/i)
        ).toBeVisible({ timeout: 5000 });

        // Vérifier qu'on reste sur la page login
        await expect(page).toHaveURL(/login/);
    });

    test("accès page protégée sans login → redirection vers login", async ({ page }) => {
        await page.goto(`${BASE}/edit-home`);
        await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });
});

test.describe("Inscription", () => {
    test("affichage du formulaire d'inscription", async ({ page }) => {
        await page.goto(`${BASE}/register`);
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe|password/i).first()).toBeVisible();
    });
});
