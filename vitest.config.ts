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
            exclude: [
                "**/*.config.*",
                "src/test/**",
                // Editor / real-time — excluded from coverage (require full browser runtime)
                "components/Editor/**",
                "app/edit/**",
                "app/embed/**",
                "app/book-reader/**",
                "hooks/useCollaborativeEditor.ts",
                "hooks/useSynapseSync.ts",
                "hooks/useRealtimeSync.ts",
                "hooks/useEditorHistory.ts",
                "hooks/useThrottledCommands.tsx",
                "hooks/useStructureNavigation.ts",
                "hooks/useStaticAnalysis.ts",
                "hooks/usePrefetch.ts",
                "hooks/useHeuristicUpdate.ts",
                "hooks/useCommandPalette.tsx",
            ],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
