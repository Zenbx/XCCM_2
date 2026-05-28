import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Eye, Share2, Save, Menu } from 'lucide-react';
import RichTooltip from '@/components/UI/RichTooltip';
import { TactileButton } from '@/components/UI/TactileButton';
import { ProjectPresenceIndicator } from '@/components/Editor/CollaborativeCursors';
import { DiscoveryTooltip } from '@/components/Onboarding/DiscoveryTooltip';
import type { UserPresence } from '@/hooks/useSynapseSync';
import type { ProjectMember } from '@/hooks/useRealtimeSync';

interface EditorHeaderProps {
    projectData: any;
    currentContext: any;
    t: any;
    hasUnsavedChanges: boolean;
    onSave: (isAuto?: boolean) => void;
    onShare: () => void;
    onPreview: () => void;
    isSaving: boolean;
    connectedUsers: UserPresence[];
    localClientId: number | null;
    authUser: any;
    projectName: string;
    connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error';
    onReconnect?: () => void;
    onToggleMobileTOC?: () => void;
    isMindMapOpen?: boolean;
    onToggleMindMap?: () => void;
    onUserClick?: (user: UserPresence) => void;
    // Project-level presence (Ably)
    projectMembers?: ProjectMember[];
    onProjectMemberClick?: (member: ProjectMember) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
    projectData,
    currentContext,
    t,
    hasUnsavedChanges,
    onSave,
    onShare,
    onPreview,
    isSaving,
    connectedUsers,
    localClientId,
    authUser,
    projectName,
    connectionStatus,
    onReconnect,
    onToggleMobileTOC,
    isMindMapOpen,
    onToggleMindMap,
    onUserClick,
    projectMembers = [],
    onProjectMemberClick,
}) => {
    const currentGranuleId = currentContext?.type === 'notion'
        ? `notion-${currentContext?.notion?.notion_id || ''}`
        : currentContext?.type === 'part'
            ? `part-${currentContext?.part?.part_id || ''}`
            : '';

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16 shrink-0 z-30 transition-colors">
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <TactileButton
                    variant="ghost"
                    onClick={onToggleMobileTOC}
                    className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-[#99334C] dark:hover:text-[#ff9daf]"
                >
                    <Menu className="w-5 h-5" />
                </TactileButton>

                <RichTooltip title="Accueil" description="Retourner à la gestion de vos projets." shortcut="Alt+H">
                    <Link
                        href="/edit-home"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-[#99334C] dark:hover:text-[#ff9daf]"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                </RichTooltip>

                <div className="flex flex-col min-w-0 max-w-50">
                    <h1 className="text-base font-bold text-gray-900 dark:text-white border-l pl-4 border-gray-200 dark:border-gray-700 truncate">
                        {projectData?.pr_name || projectName}
                    </h1>
                    {projectData && projectData.owner_id !== authUser?.user_id && (
                        <div className="pl-4 flex items-center gap-2 truncate">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Projet Partagé</span>
                            {projectData.owner && (
                                <span className="text-[10px] text-gray-400 italic">
                                    Propriétaire : {projectData.owner.firstname} {projectData.owner.lastname}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {currentContext && (
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 ml-5 pl-5 border-l border-gray-100 dark:border-gray-700 min-w-0 flex-1 truncate">
                        {currentContext.type === 'notion' ? (
                            <>
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[9px] font-bold tracking-wider shrink-0">{currentContext.partTitle}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[9px] font-bold tracking-wider shrink-0">{currentContext.chapterTitle}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[9px] font-bold tracking-wider shrink-0">{currentContext.paraName}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
                                <span className="font-bold text-[#99334C] dark:text-[#ff9daf] truncate">{currentContext.notionName}</span>
                            </>
                        ) : (
                            <>
                                <span className="uppercase text-[9px] font-bold tracking-wider shrink-0">{t('part')}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
                                <span className="font-bold text-[#99334C] dark:text-[#ff9daf] truncate">{currentContext.partTitle}</span>
                                <span className="ml-1 text-gray-400 font-normal dark:text-gray-500 shrink-0">(Intro)</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
                <RichTooltip title="Aperçu" description="Visualiser le projet tel qu'il sera publié." shortcut="Alt+P">
                    <TactileButton
                        variant="ghost"
                        onClick={onPreview}
                        className="p-2 text-gray-500 hover:text-[#99334C] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                        <Eye className="w-5 h-5" />
                    </TactileButton>
                </RichTooltip>

                <DiscoveryTooltip featureId="collaboration-share" title="Collaboration temps réel" description="Invitez des coauteurs pour éditer simultanément. Chaque collaborateur a un curseur coloré visible en direct." placement="bottom">
                    <RichTooltip title="Partager" description="Inviter des collaborateurs ou publier sur la marketplace.">
                        <TactileButton
                            id="share-button"
                            variant="ghost"
                            onClick={onShare}
                            className="p-2 text-gray-500 hover:text-[#99334C] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                            <Share2 className="w-5 h-5" />
                        </TactileButton>
                    </RichTooltip>
                </DiscoveryTooltip>

                <div className="ml-2 pl-4 border-l border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <ProjectPresenceIndicator
                        projectMembers={projectMembers}
                        connectedUsers={connectedUsers}
                        currentUserId={authUser?.user_id || ''}
                        currentGranuleId={currentGranuleId}
                        onMemberClick={onProjectMemberClick}
                    />
                </div>

                <RichTooltip title="Enregistrer" description="Sauvegarder manuellement vos modifications." shortcut="Ctrl+S">
                    <TactileButton
                        variant="ghost"
                        onClick={() => onSave(false)}
                        disabled={isSaving}
                        isLoading={isSaving}
                        className="p-2 text-gray-500 hover:text-[#99334C] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                        {!isSaving && <Save className="w-5 h-5" />}
                    </TactileButton>
                </RichTooltip>
            </div>
        </div>
    );
};

export default EditorHeader;
