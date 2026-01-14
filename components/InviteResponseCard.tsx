"use client";

import { useState } from "react";

type Props = {
  projectName: string;
  inviterName: string;
  recipientName: string;
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

export default function InviteResponseCard({ projectName, inviterName, recipientName }: Props) {
  const [status, setStatus] = useState<null | "accepted" | "declined">(null);

  async function handleAccept() {
    // TODO: replace with real API call
    console.log("Invitation accepted", { projectName, inviterName, recipientName });
    setStatus("accepted");
  }

  async function handleDecline() {
    // TODO: replace with real API call
    console.log("Invitation declined", { projectName, inviterName, recipientName });
    setStatus("declined");
  }

  return (
    <div className="max-w-2xl w-full bg-white rounded-lg border border-gray-200 shadow-sm mx-4">
      {/* Header similar to GitHub invite card */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-800">{projectName.split(" ")[0].slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="text-sm font-bold text-gray-900">{projectName}</div>
            <div className="text-xs text-gray-500">{inviterName} t'a invité(e) à collaborer</div>
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
        <div className="text-sm text-gray-600 mb-4">Tu peux accepter ou décliner l'invitation ci-dessous. Si tu acceptes, tu auras accès au projet et pourras contribuer immédiatement.</div>

        <div className="flex items-center gap-4">
          <Avatar name={inviterName} size={56} />
          <div>
            <div className="text-sm text-gray-500">Invité par</div>
            <div className="text-base font-semibold text-gray-900">{inviterName}</div>
            <div className="text-xs text-gray-500 mt-1">{projectName}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="text-sm text-gray-700 hover:underline px-3 py-2 rounded-md"
            aria-label="Décliner"
          >
            Décliner
          </button>

          <button
            onClick={handleAccept}
            className="ml-2 inline-flex items-center px-4 py-2 bg-[#99334C] hover:bg-[#] text-white rounded-md font-semibold shadow-sm"
            aria-label="Accepter"
          >
            Accepter
          </button>
        </div>

        {status === "accepted" && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">Merci — ta participation a été confirmée.</div>
        )}

        {status === "declined" && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">Invitation déclinée — l'invitant a été prévenu.</div>
        )}
      </div>

      {/* Footer small */}
      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-500">Invitation reçue • {new Date().toLocaleDateString()}</div>
    </div>
  );
}

