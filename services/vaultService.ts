import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface VaultItem {
    id: string; // The ID in the Vault table 
    type: 'img' | 'video' | 'text' | 'pdf' | 'audio' | 'part' | 'chapter' | 'paragraph' | 'notion';
    title: string;
    content?: string; // For text/notions
    file_url?: string; // For media
    original_id: string; // The ID of the original object (part_id, etc.)
    source_doc_id?: string;
    source_doc_name?: string;
    added_at: string;
}

class VaultService {

    async addToVault(item: {
        type: string;
        title: string;
        original_id: string;
        source_doc_id?: string;
        source_doc_name?: string;
        content?: string;
    }): Promise<VaultItem> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vault`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur Vault (${response.status})`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('addToVault error:', error);
            throw error;
        }
    }

    async getVaultItems(): Promise<VaultItem[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vault`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la récupération du Vault (${response.status})`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('getVaultItems error:', error);
            throw error;
        }
    }

    async removeFromVault(vaultItemId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vault/${vaultItemId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la suppression du Vault (${response.status})`);
            }
        } catch (error) {
            console.error('removeFromVault error:', error);
            throw error;
        }
    }
}

export const vaultService = new VaultService();
