const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/edit/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// --- Helper Functions ---
function replaceSelectionHandler(type) {
    const regex = new RegExp(`onSelect${type}=\\{\\(ctx\\) => \\{[\\s\\S]*?const cached = localContentCacheRef\\.current\\[ctx\\.${type.toLowerCase()}\\.${type.toLowerCase()}_id\\];`, 'g');

    const replacement = `onSelect${type}={(ctx) => {
                // ✅ FIX 3: Annuler l'auto-save en cours
                if (autoSaveTimerRef.current) {
                  clearTimeout(autoSaveTimerRef.current);
                  autoSaveTimerRef.current = null;
                }

                const targetId = \`${type.toLowerCase()}-\${ctx.${type.toLowerCase()}.${type.toLowerCase()}_id}\`;
                
                // ✅ FIX 1: Capturer l'ID et Snapshot du contexte AVANT le switch
                const prevId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;

                activeDocIdRef.current = targetId;
                lastDocChangeTimeRef.current = Date.now();

                if (hasUnsavedChanges && prevId && currentContext) {
                  const prevContent = localContentCacheRef.current[prevId] ?? editorContent;
                  
                  // Snapshot figé (Frozen Context)
                  const frozenContext = { 
                    ...currentContext,
                    notion: currentContext.notion ? { ...currentContext.notion } : undefined,
                    part: currentContext.part ? { ...currentContext.part } : undefined,
                  };
                  
                  queueSave(frozenContext, prevContent);
                }

                setCurrentContext({
                  type: '${type.toLowerCase()}',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  ${type === 'Notion' ? 'chapterTitle: ctx.chapterTitle,\n                  paraName: ctx.paraName,\n                  notionName: ctx.notionName,\n                  notion: ctx.notion' : 'part: ctx.part'}
                });

                const cached = localContentCacheRef.current[ctx.${type.toLowerCase()}.${type.toLowerCase()}_id];`;

    content = content.replace(regex, replacement);
}

// 1. & 3. Fix onSelectNotion and onSelectPart
replaceSelectionHandler('Notion');
replaceSelectionHandler('Part');

// Fix onSelectChapter and onSelectParagraph (Timer cleanup)
content = content.replace(/onSelectChapter=\{\(pName, cTitle, cId\) => \{/g, `onSelectChapter={(pName, cTitle, cId) => {
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }`);
content = content.replace(/onSelectParagraph=\{\(pName, cTitle, paName, paId\) => \{/g, `onSelectParagraph={(pName, cTitle, paName, paId) => {
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }`);


// 2. Fix onChange (Lock cache to active document)
const onChangeUpdateRegex = /\/\/ Toujours mettre à jour le cache RAM \(Prio n°1\)\s+localContentCacheRef\.current\[cleanId\] = val;\s+\/\/ Mise à jour de l'UI uniquement si c'est le document que l'utilisateur regarde\s+if \(isActive\) \{/s;

const onChangeReplacement = `// ✅ FIX 2: N'écrire dans le cache et l'UI QUE si c'est le document actif
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
                }`;

// Clean up previous structure if needed
content = content.replace(onChangeUpdateRegex, onChangeReplacement);

// Remove the leftover auto-save block if it was previously outside (to avoid duplication)
content = content.replace(/\/\/ ✅ AUTO-SAVE CONTINU \(Debounced\)[\s\S]*?1500\);\s+}/g, '}');

fs.writeFileSync(filePath, content);
console.log('Atomic Persistence fixes applied successfully.');
