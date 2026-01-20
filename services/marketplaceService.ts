import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface MarketplaceItem {
    id: string;
    type: 'part' | 'chapter' | 'paragraph' | 'notion';
    title: string;
    description?: string;
    price: number;
    content?: string;
    tags: string[];
    category?: string;
    downloads: number;
    rating?: number;
    published_at: string;
    seller_id: string;
    seller: {
        user_id: string;
        firstname: string;
        lastname: string;
    };
}

export const marketplaceService = {
    /**
     * Récupère tous les items de la marketplace
     */
    async getItems(filters?: {
        type?: string;
        category?: string;
        search?: string;
    }): Promise<MarketplaceItem[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.type) params.append('type', filters.type);
            if (filters?.category) params.append('category', filters.category);
            if (filters?.search) params.append('search', filters.search);

            const response = await fetch(
                `${API_BASE_URL}/api/marketplace?${params.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la récupération (${response.status})`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error: any) {
            console.error('Error in getItems:', error);
            throw error;
        }
    },

    /**
     * Publie un granule sur la marketplace
     */
    async publishItem(data: {
        type: string;
        title: string;
        description?: string;
        price?: number;
        content?: string;
        tags?: string[];
        category?: string;
    }): Promise<MarketplaceItem> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/marketplace`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la publication (${response.status})`);
            }

            const result = await response.json();
            return result.data;
        } catch (error: any) {
            console.error('Error in publishItem:', error);
            throw error;
        }
    },

    /**
     * Supprime un item de la marketplace
     */
    async deleteItem(itemId: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/marketplace/${itemId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la suppression (${response.status})`);
            }
        } catch (error: any) {
            console.error('Error in deleteItem:', error);
            throw error;
        }
    },

    /**
     * Enregistre un téléchargement
     */
    async recordDownload(itemId: string): Promise<void> {
        try {
            await fetch(
                `${API_BASE_URL}/api/marketplace/${itemId}`,
                {
                    method: 'PATCH',
                    headers: getAuthHeaders()
                }
            );
        } catch (error) {
            console.error('Error recording download:', error);
        }
    }
};
