import InviteResponseCard from "@/components/InviteResponseCard";

type Props = {
  params: { id: string };
};

// This page displays an invitation and lets the user accept/decline
export default function InvitationPage({ params }: Props) {
  // For now we'll render with placeholder data; later this can fetch the invitation by id
  const id = params.id;
  const fakeData = {
    projectName: `Projet ${id}`,
    inviterName: "Marie Dupont",
    recipientName: "Jeff Belekotan",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Centered header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Invitation</h2>
          <p className="text-sm text-gray-500">Réponds à l'invitation pour accéder au projet</p>
        </div>

        <InviteResponseCard
          projectName={fakeData.projectName}
          inviterName={fakeData.inviterName}
          recipientName={fakeData.recipientName}
        />

        <div className="mt-6 text-center text-xs text-gray-400">Si tu ne connais pas cet invité, contacte le support.</div>
      </div>
    </div>
  );
}
