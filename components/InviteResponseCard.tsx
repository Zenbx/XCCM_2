"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { invitationService } from "@/services/invitationService";

type Props = {
  projectName: string;
  inviterName: string;
  recipientName: string;
  token: string; // ✅ NOUVEAU: token pour identifier l'invitation
};

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      aria-hidden
      className="flex items-center justify-center bg-gray-100 text-gray-800 font-semibold rounded-full"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function InviteResponseCard({
  projectName,
  inviterName,
  recipientName,
  token,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<null | "accepted" | "declined">(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    try {
      setIsProcessing(true);
      setError(null);

      const result = await invitationService.acceptInvitation(token);

      setStatus("accepted");

      // Rediriger vers le projet après 1.5 secondes
      setTimeout(() => {
        if (result.redirect_to) {
          router.push(result.redirect_to);
        } else {
          router.push("/edit-home");
        }
      }, 1500);
    } catch (err: any) {
      console.error("Erreur acceptation:", err);
      setError(err.message || "Erreur lors de l'acceptation de l'invitation");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDecline() {
    try {
      setIsProcessing(true);
      setError(null);

      await invitationService.declineInvitation(token);

      setStatus("declined");

      // Rediriger vers l'accueil après 1.5 secondes
      setTimeout(() => {
        router.push("/edit-home");
      }, 1500);
    } catch (err: any) {
      console.error("Erreur refus:", err);
      setError(err.message || "Erreur lors du refus de l'invitation");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-2xl w-full bg-white rounded-lg border border-gray-200 shadow-sm mx-4">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#99334C] to-[#7a283d] flex items-center justify-center text-sm font-bold text-white">
            {projectName.split(" ")[0].slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{projectName}</div>
            <div className="text-xs text-gray-500">
              {inviterName} t'a invité(e) à collaborer
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-xs text-gray-500">Pour :</div>
          <div className="flex items-center gap-2">
            <Avatar name={recipientName} size={28} />
            <div className="text-sm text-gray-800">{recipientName}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <div className="text-sm text-gray-600 mb-4">
          Tu peux accepter ou décliner l'invitation ci-dessous. Si tu acceptes, tu
          auras accès au projet et pourras contribuer immédiatement.
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={inviterName} size={56} />
          <div>
            <div className="text-sm text-gray-500">Invité par</div>
            <div className="text-base font-semibold text-gray-900">{inviterName}</div>
            <div className="text-xs text-gray-500 mt-1">{projectName}</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action buttons */}
        {!status && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="text-sm text-gray-700 hover:underline px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Décliner"
            >
              Décliner
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="ml-2 inline-flex items-center px-4 py-2 bg-[#99334C] hover:bg-[#7a283d] text-white rounded-md font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              aria-label="Accepter"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Accepter'
              )}
            </button>
          </div>
        )}

        {/* Status messages */}
        {status === "accepted" && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
            ✅ Merci — ta participation a été confirmée. Redirection vers le projet...
          </div>
        )}
        {status === "declined" && (
          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-md">
            Invitation déclinée — l'invitant a été prévenu. Redirection...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
        Invitation reçue • {new Date().toLocaleDateString("fr-FR")}
      </div>
    </div>
  );
}