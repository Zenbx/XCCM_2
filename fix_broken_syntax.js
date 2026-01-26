const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/edit/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Target the broken block in onChange
const startMarker = '// ✅ FIX 2: N\\\'écrire dans le cache et l\\\'UI QUE si c\\\'est le document actif'.replace(/\\/g, '');
const endMarker = '// ANCRAGE STRUCTUREL';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `// ✅ FIX 2: N'écrire dans le cache et l'UI QUE si c'est le document actif
                if (isActive) {
                  localContentCacheRef.current[cleanId] = val;
                  setEditorContent(val);
                  setHasUnsavedChanges(true);

                  // ✅ AUTO-SAVE CONTINU (Debounced)
                  if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                  autoSaveTimerRef.current = setTimeout(() => {
                    if (isActive && currentContext) {
                        queueSave(currentContext, val);
                    }
                  }, 1500);
                }

                `;
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync(filePath, content);
    console.log('Fixed broken onChange syntax.');
} else {
    console.error('Could not find markers for replacement.', { startIdx, endIdx });
}
