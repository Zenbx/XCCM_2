import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        exclude: ["**/node_modules/**", "**/e2e/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            include: ["app/**", "components/**", "context/**", "lib/**", "hooks/**", "services/**"],
            exclude: ["**/*.config.*", "src/test/**"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
