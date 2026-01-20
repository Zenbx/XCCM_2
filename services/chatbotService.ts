import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const chatbotService = {
    rephraseNotion: async (
        prName: string,
        partTitle: string,
        chapterTitle: string,
        paraName: string,
        notionName: string,
        style: string,
        content?: string
    ): Promise<{ rephrased_content: string }> => {
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const res = await fetch(
            `${API_URL}/api/projects/${encodeURIComponent(prName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions/${encodeURIComponent(notionName)}/rephrase`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    style,
                    content, // Optionnel : utilise le contenu local si fourni
                    previewOnly: true
                })
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de la reformulation');
        }

        const data = await res.json();
        return data.data; // { original_content, rephrased_content, preview_only }
    }
};
