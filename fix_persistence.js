const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/edit/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to find the active state update in onChange
const onChangeRegex = /if \(isActive\) \{\s+setEditorContent\(val\);\s+setHasUnsavedChanges\(true\);\s+\}/;

const replacement = `if (isActive) {
                  setEditorContent(val);
                  setHasUnsavedChanges(true);

                  // ✅ AUTO-SAVE CONTINU (Debounced)
                  // On remplit le buffer toutes les 1.5s d'inactivité au lieu d'attendre la sortie
                  if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                  autoSaveTimerRef.current = setTimeout(() => {
                    if (isActive && currentContext) {
                        queueSave(currentContext, val);
                    }
                  }, 1500);
                }`;

if (onChangeRegex.test(content)) {
    content = content.replace(onChangeRegex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Real-time Persistence onChange trigger applied successfully.');
} else {
    console.error('Could not find the target onChange block.');
}
