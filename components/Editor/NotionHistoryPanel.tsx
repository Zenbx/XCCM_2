"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Clock, ChevronRight, RotateCcw } from "lucide-react";
import { granuleRevisionService, GranuleRevision } from "@/services/granuleRevisionService";

// ── Diff algorithm (word-level) ──────────────────────────────────────────────

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type DiffToken = { text: string; type: "equal" | "added" | "removed" };

function wordDiff(before: string, after: string): DiffToken[] {
    const a = stripHtml(before).split(/\s+/).filter(Boolean);
    const b = stripHtml(after).split(/\s+/).filter(Boolean);

    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

    const tokens: DiffToken[] = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
            tokens.unshift({ text: a[i - 1], type: "equal" });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            tokens.unshift({ text: b[j - 1], type: "added" });
            j--;
        } else {
            tokens.unshift({ text: a[i - 1], type: "removed" });
            i--;
        }
    }
    return tokens;
}

function DiffView({ before, after }: { before: string; after: string }) {
    const tokens = wordDiff(before, after);

    if (tokens.every((t) => t.type === "equal")) {
        return <p className="text-xs text-gray-400 dark:text-gray-500 italic">Aucun changement de texte détectable.</p>;
    }

    return (
        <div className="text-xs leading-relaxed font-mono bg-gray-100 dark:bg-gray-950 rounded-lg p-3 max-h-64 overflow-y-auto">
            {tokens.map((tok, idx) => {
                if (tok.type === "equal")
                    return <span key={idx} className="text-gray-700 dark:text-gray-300">{tok.text} </span>;
                if (tok.type === "added")
                    return <span key={idx} className="bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 rounded px-0.5">{tok.text} </span>;
                return <span key={idx} className="bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 line-through rounded px-0.5">{tok.text} </span>;
            })}
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `il y a ${d}j`;
}

function Avatar({ author, size = 7 }: { author: GranuleRevision["author"]; size?: number }) {
    const initials = `${author.firstname[0]}${author.lastname[0]}`.toUpperCase();
    if (author.profile_picture)
        return (
            <img
                src={author.profile_picture}
                alt={initials}
                className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
            />
        );
    return (
        <div className={`w-${size} h-${size} rounded-full bg-[#99334C] flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {initials}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface NotionHistoryPanelProps {
    projectName: string;
    notionId: string;
    notionName: string;
    onClose: () => void;
    onRestore?: (content: string) => void;
}

export function NotionHistoryPanel({
    projectName,
    notionId,
    notionName,
    onClose,
    onRestore,
}: NotionHistoryPanelProps) {
    const [revisions, setRevisions] = useState<GranuleRevision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<GranuleRevision | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await granuleRevisionService.getRevisions(projectName, notionId);
            setRevisions(data);
            if (data.length > 0) setSelected(data[0]);
        } catch {
            // silence — empty state shown
        } finally {
            setIsLoading(false);
        }
    }, [projectName, notionId]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#99334C]" />
                        <div>
                            <h2 className="font-bold text-base">Historique des modifications</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notionName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                        Chargement…
                    </div>
                ) : revisions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-sm gap-2">
                        <Clock className="w-10 h-10 opacity-30" />
                        <p>Aucune modification enregistrée pour cette notion.</p>
                        <p className="text-xs">Les modifications apparaîtront ici après la prochaine sauvegarde.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Liste des révisions */}
                        <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-white/10 overflow-y-auto">
                            {revisions.map((rev) => (
                                <button
                                    key={rev.id}
                                    onClick={() => setSelected(rev)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${
                                        selected?.id === rev.id
                                            ? "bg-gray-100 dark:bg-white/10"
                                            : "hover:bg-gray-50 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <Avatar author={rev.author} size={7} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                            {rev.author.firstname} {rev.author.lastname}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatRelative(rev.created_at)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                            {new Date(rev.created_at).toLocaleString("fr-FR", {
                                                day: "2-digit", month: "short",
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    {selected?.id === rev.id && (
                                        <ChevronRight className="w-3 h-3 text-[#99334C] shrink-0 mt-1" />
                                    )}
                                </button>
                            ))}
                        </aside>

                        {/* Vue diff */}
                        {selected && (
                            <main className="flex-1 overflow-y-auto p-5 space-y-5">
                                {/* Auteur + date */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar author={selected.author} size={9} />
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {selected.author.firstname} {selected.author.lastname}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(selected.created_at).toLocaleString("fr-FR", {
                                                    weekday: "long", day: "numeric", month: "long",
                                                    year: "numeric", hour: "2-digit", minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {onRestore && (
                                        <button
                                            onClick={() => onRestore(selected.content_before)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#99334C]/10 hover:bg-[#99334C]/20 dark:bg-[#99334C]/20 dark:hover:bg-[#99334C]/40 text-[#99334C] rounded-lg text-xs font-medium transition-colors"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Restaurer cette version
                                        </button>
                                    )}
                                </div>

                                {/* Diff */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Changements
                                    </p>
                                    <DiffView
                                        before={selected.content_before}
                                        after={selected.content_after}
                                    />
                                </div>

                                {/* Aperçu avant / après */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-2">
                                            Avant
                                        </p>
                                        <div
                                            className="text-xs text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-lg p-3 max-h-48 overflow-y-auto prose prose-xs dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: selected.content_before || "<em>Vide</em>" }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                                            Après
                                        </p>
                                        <div
                                            className="text-xs text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 rounded-lg p-3 max-h-48 overflow-y-auto prose prose-xs dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: selected.content_after || "<em>Vide</em>" }}
                                        />
                                    </div>
                                </div>
                            </main>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
