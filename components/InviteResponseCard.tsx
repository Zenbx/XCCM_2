"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, AlertCircle } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center p-4">
      <div className="max-w-[440px] w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all hover:shadow-xl">
        {/* GitHub style Header - Project Path */}
        <div className="bg-[#f6f8fa] px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#99334C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {projectName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm text-gray-600 truncate">{inviterName}</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-bold text-gray-900 truncate">{projectName}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Avatar name={inviterName} size={84} />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
              <div className="w-6 h-6 bg-[#99334C] rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invitation à collaborer
          </h1>

          <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
            <span className="font-semibold text-gray-900">{inviterName}</span> vous a invité à contribuer au projet <span className="font-semibold text-gray-900">{projectName}</span>.
          </p>

          {!status ? (
            <div className="w-full space-y-3">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-5 py-2.5 bg-[#99334C] hover:bg-[#7a283d] text-white rounded-lg font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Rejoindre l'équipe
                  </>
                )}
              </button>

              <button
                onClick={handleDecline}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Décliner
              </button>
            </div>
          ) : (
            <div className="w-full">
              {status === "accepted" && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <span className="font-bold text-lg">C'est fait !</span>
                  <p className="text-sm">Vous faites maintenant partie de l'équipe ! Préparation de votre espace...</p>
                  <Loader2 className="w-5 h-5 animate-spin mt-2" />
                </div>
              )}
              {status === "declined" && (
                <div className="p-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg animate-in fade-in zoom-in duration-300">
                  Invitation déclinée. Redirection...
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
            XCCM2 Collaboration Environment • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}