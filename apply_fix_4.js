const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/edit/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isTransitioning state
content = content.replace(
    /const \[isZenMode, setIsZenMode\] = useState\(false\);/,
    `const [isZenMode, setIsZenMode] = useState(false);\n  const [isTransitioning, setIsTransitioning] = useState(false);`
);

// 2. Add isTransitioning guard to onSelectNotion and onSelectPart
function wrapSelectionWithTransition(type) {
    const regex = new RegExp(`onSelect${type}=\\{\\(ctx\\) => \\{`, 'g');
    const replacement = `onSelect${type}={(ctx) => {\n                // ✅ FIX 4: Activer le verrou de transition\n                setIsTransitioning(true);`;
    content = content.replace(regex, replacement);

    // Add the release timeout at the end of the handler
    const endRegex = new RegExp(`setHasUnsavedChanges\\(false\\);\\s+\\}\\}`, 'g');
    // Note: this might match multiple handlers, so we need to be careful.
    // However, in this file, setHasUnsavedChanges(false) is mostly used in selection handlers.
    // Let's use a more specific marker.
}

// Manual replacement for more control
content = content.replace(
    /onSelectNotion=\{\(ctx\) => \{/,
    `onSelectNotion={(ctx) => {
                // ✅ FIX 4: Activer le verrou de transition
                setIsTransitioning(true);`
);

content = content.replace(
    /onSelectPart=\{\(ctx\) => \{/,
    `onSelectPart={(ctx) => {
                // ✅ FIX 4: Activer le verrou de transition
                setIsTransitioning(true);`
);

// Add the deblockers
const notionEndMarker = `setHasUnsavedChanges(false);
              }}`;
const notionReplacement = `setHasUnsavedChanges(false);
                // ✅ Débloquer la transition après un tick
                setTimeout(() => setIsTransitioning(false), 100);
              }}`;

// We need to replace only the first two occurrences (Notion and Part)
let split = content.split(notionEndMarker);
if (split.length >= 3) {
    content = split[0] + notionReplacement + split[1] + notionReplacement + split.slice(2).join(notionEndMarker);
}

// 3. Add isTransitioning and Super-Log to onChange
const onChangeStart = `onChange={(val, updateDocId) => {`;
const onChangeReplacement = `onChange={(val, updateDocId) => {
                // ✅ FIX 4: Ignorer tout update pendant la transition
                if (isTransitioning) {
                  console.log(\`[Transition Guard] Blocked update for \${updateDocId} during transition\`);
                  return;
                }

                // 🧪 SUPER-LOG DIAGNOSTIC
                /*
                const stack = new Error().stack;
                console.group(\`🔍 onChange @ \${Date.now()}\`);
                console.log('📝 updateDocId:', updateDocId);
                console.log('🎯 activeDocId:', activeDocIdRef.current);
                console.log('📊 Match:', updateDocId === activeDocIdRef.current);
                console.log('📄 Content Length:', val.length);
                console.log('🔄 CurrentContext:', currentContext?.notion?.notion_id || currentContext?.part?.part_id);
                console.groupEnd();
                */`;

content = content.replace(onChangeStart, onChangeReplacement);

fs.writeFileSync(filePath, content);
console.log('Transition Guard and Atomic fixes (Phase 4) applied successfully.');
