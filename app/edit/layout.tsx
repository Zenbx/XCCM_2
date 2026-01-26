export default function EditLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Layout dédié pour la page d'édition
    // N'inclut PAS le Header global ni le Footer pour une expérience immersive plein écran
    // Retire également le padding-top qui compensait le header
    return <div style={{ position: 'relative' }}>{children}</div>;
}
