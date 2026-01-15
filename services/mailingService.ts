// services/mailingService.ts

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

class MailingService {
    /**
     * S'abonner à la newsletter
     * @param email Email de l'abonné
     */
    async subscribeNewsletter(email: string): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Erreur lors de l'abonnement à la newsletter");
            }

            return await response.json();
        } catch (error) {
            console.error('subscribeNewsletter error:', error);
            throw error;
        }
    }

    /**
     * Envoyer un message de contact
     * @param data Données du formulaire de contact
     */
    async sendContact(data: ContactData): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Erreur lors de l'envoi du message");
            }

            return await response.json();
        } catch (error) {
            console.error('sendContact error:', error);
            throw error;
        }
    }
}

export const mailingService = new MailingService();
