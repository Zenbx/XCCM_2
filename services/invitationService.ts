/**
 * @fileoverview Service pour gérer les invitations côté frontend
 */

import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface InvitationEmailData {
    guestEmail: string;
    guestFirstname: string;
    hostFirstname: string;
    projectName: string;
    invitationLink: string;
}

export interface Invitation {
    id: string;
    projectName: string;
    projectId: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    inviterName: string;
    inviterEmail: string;
    recipientName: string;
    recipientEmail: string;
    invitedAt: string;
    responseAt?: string;
}

export interface InvitationResponse {
    success: boolean;
    data?: {
        invitation: Invitation;
        redirect_to?: string;
    };
    message?: string;
    error?: string;
}

export interface SendInvitationData {
    guestEmail: string;
}

export interface InvitationDetails {
    id: string;
    projectName: string;
    projectId: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    inviterName: string;
    inviterEmail: string;
    recipientName: string;
    recipientEmail: string;
    invitedAt: string;
    responseAt?: string;
}

class InvitationService {
    /**
     * Envoyer une invitation par email
     */
    async sendInvitation(projectName: string, data: SendInvitationData) {
        const response = await fetch(
            `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/invitations/email`,
            {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Récupérer les détails d'une invitation par token
     */
    async getInvitationByToken(token: string): Promise<InvitationDetails> {
        const response = await fetch(
            `${API_BASE_URL}/api/invitations/${token}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invitation non trouvée');
        }

        const result = await response.json();
        return result.data.invitation;
    }

    /**
     * Accepter une invitation
     */
    async acceptInvitation(token: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/invitations/${token}/accept`,
            {
                method: 'PATCH',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'acceptation');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Refuser une invitation
     */
    async declineInvitation(token: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/invitations/${token}/decline`,
            {
                method: 'PATCH',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors du refus');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Révoquer une invitation (pour le créateur)
     */
    async revokeInvitation(token: string) {
        const response = await fetch(
            `${API_BASE_URL}/api/invitations/${token}/revoke`,
            {
                method: 'DELETE',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la révocation');
        }

        const result = await response.json();
        return result.data;
    }
}

export const invitationService = new InvitationService();