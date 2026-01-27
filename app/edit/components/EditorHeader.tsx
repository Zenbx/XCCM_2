import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Eye, Share2, Save, Loader2, Undo2, Redo2 } from 'lucide-react';
import RichTooltip from '@/components/UI/RichTooltip';
import { TactileButton } from '@/components/UI/TactileButton';
import { PresenceIndicator } from '@/components/Editor/CollaborativeCursors';

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
}) => {
    return (
        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
                <RichTooltip title="Accueil" description="Retourner à la gestion de vos projets." shortcut="Alt+H">
                    <Link
                        href="/edit-home"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#99334C]"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                </RichTooltip>

                <h1 className="text-lg font-bold text-gray-900 border-l pl-4 border-gray-200">
                    {projectData?.pr_name || projectName}
                </h1>

                {currentContext && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 ml-5 pl-5 border-l border-gray-100 dark:border-gray-700 max-w-xl truncate">
                        {currentContext.type === 'notion' ? (
                            <>
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.partTitle}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.chapterTitle}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.paraName}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                <span className="font-bold text-[#99334C] dark:text-[#ff9daf]">{currentContext.notionName}</span>
                            </>
                        ) : (
                            <>
                                <span className="uppercase text-[10px] font-bold tracking-wider">{t('part')}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                <span className="font-bold text-[#99334C] dark:text-[#ff9daf]">{currentContext.partTitle}</span>
                                <span className="ml-1 text-gray-400 font-normal dark:text-gray-500">(Intro)</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
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


                <div className="ml-2 pl-4 border-l border-gray-100 dark:border-gray-800">
                    <PresenceIndicator
                        users={connectedUsers}
                        localClientId={localClientId}
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
