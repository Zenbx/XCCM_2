import { getAuthHeaders } from "@/lib/apiHelper";

export interface RevisionAuthor {
    user_id: string;
    firstname: string;
    lastname: string;
    profile_picture: string | null;
}

export interface GranuleRevision {
    id: string;
    content_before: string;
    content_after: string;
    created_at: string;
    author: RevisionAuthor;
}

export interface BlameEntry {
    author: RevisionAuthor;
    modified_at: string;
}

export type BlameMap = Record<string, BlameEntry>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const granuleRevisionService = {
    async getRevisions(prName: string, notionId: string): Promise<GranuleRevision[]> {
        const res = await fetch(
            `${API_BASE}/api/projects/${encodeURIComponent(prName)}/granules/${notionId}/revisions`,
            { headers: getAuthHeaders() }
        );
        if (!res.ok) throw new Error("Impossible de charger l'historique");
        const json = await res.json();
        return json.data.revisions as GranuleRevision[];
    },

    async getBlame(prName: string): Promise<BlameMap> {
        const res = await fetch(
            `${API_BASE}/api/projects/${encodeURIComponent(prName)}/blame`,
            { headers: getAuthHeaders() }
        );
        if (!res.ok) return {};
        const json = await res.json();
        return (json.data.blame ?? {}) as BlameMap;
    },
};
