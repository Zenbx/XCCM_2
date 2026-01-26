"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import InviteResponseCard from "@/components/InviteResponseCard";
import { invitationService } from "@/services/invitationService";

type Props = {
  params: Promise<{ id: string }>;
};

export default function InvitationPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<{
    projectName: string;
    inviterName: string;
    recipientName: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await invitationService.getInvitationByToken(token);

        // Vérifier le statut
        if (data.status !== 'Pending') {
          if (data.status === 'Accepted') {
            setError('Cette invitation a déjà été acceptée');
          } else if (data.status === 'Rejected') {
            setError('Cette invitation a déjà été déclinée');
          }
          return;
        }

        setInvitationData({
          projectName: data.projectName,
          inviterName: data.inviterName,
          recipientName: data.recipientName,
          status: data.status,
        });
      } catch (err: any) {
        console.error('Erreur chargement invitation:', err);
        setError(err.message || 'Invitation non trouvée ou expirée');
      } finally {
        setIsLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#99334C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Invitation non valide
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/edit-home')}
                  className="px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all font-medium"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Invitation</h2>
          <p className="text-sm text-gray-500">
            Rejoignez l'équipe du projet pour commencer à collaborer
          </p>
        </div>

        {/* Invitation Card */}
        <InviteResponseCard
          projectName={invitationData.projectName}
          inviterName={invitationData.inviterName}
          recipientName={invitationData.recipientName}
          token={token}
        />

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Si tu ne connais pas cet auteur, contacte le support.
        </div>
      </div>
    </div>
  );
}