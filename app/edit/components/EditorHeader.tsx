import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Eye, Share2, Save, Loader2, Undo2, Redo2, Cloud, CloudOff, Check, Menu } from 'lucide-react';
import RichTooltip from '@/components/UI/RichTooltip';
import { TactileButton } from '@/components/UI/TactileButton';
import { PresenceIndicator, ConnectionStatus } from '@/components/Editor/CollaborativeCursors';

interface EditorHeaderProps {
    projectData: any;
    currentContext: any;
    t: any;
    hasUnsavedChanges: boolean;
    onSave: (isAuto?: boolean) => void;
    onShare: () => void;
    onPreview: () => void;
    isSaving: boolean;
    connectedUsers: any[];
    localClientId: number | null;
    authUser: any;
    projectName: string;
    connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error';
    onReconnect?: () => void;
    onToggleMobileTOC?: () => void;
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
}) => {
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

                <div className="flex flex-col min-w-0 max-w-[200px]">
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

                {/* Save & Sync Status Pill - Always visible, small on mobile */}
                <div className="ml-auto lg:ml-4 flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-full border border-gray-100 dark:border-gray-800 shrink-0 transition-all duration-500">
                    {isSaving ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 text-[#99334C] animate-spin" />
                            <span className="text-[10px] font-medium text-gray-500 animate-pulse">Enregistrement...</span>
                        </>
                    ) : hasUnsavedChanges ? (
                        <>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-amber-600">Modifications non enregistrées</span>
                        </>
                    ) : (
                        <>
                            <Cloud className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-medium text-green-600">Modifications enregistrées</span>
                        </>
                    )}
                </div>
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

                <RichTooltip title="Partager" description="Inviter des collaborateurs ou publier sur la marketplace.">
                    <TactileButton
                        variant="ghost"
                        onClick={onShare}
                        className="p-2 text-gray-500 hover:text-[#99334C] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                        <Share2 className="w-5 h-5" />
                    </TactileButton>
                </RichTooltip>


                <div className="ml-2 pl-4 border-l border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <PresenceIndicator
                        users={connectedUsers}
                        localClientId={localClientId}
                    />
                    {connectionStatus && (
                        <ConnectionStatus
                            status={connectionStatus}
                            onReconnect={onReconnect}
                        />
                    )}
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
