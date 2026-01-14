import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@/components/ui/context-menu";
import { usePlaylists } from "@/hooks/usePlaylists";
import { showSuccess, showError } from "@/utils/toast";
import { Plus, ListMusic } from "lucide-react";

interface AddToPlaylistMenuProps {
    children: React.ReactNode;
    songId: string;
}

export const AddToPlaylistMenu = ({ children, songId }: AddToPlaylistMenuProps) => {
    const { playlists, addToPlaylist } = usePlaylists();

    const handleAdd = (playlistId: string, playlistName: string) => {
        addToPlaylist.mutate({ playlistId, songId }, {
            onSuccess: () => showSuccess(`Ajouté à ${playlistName}`),
            onError: () => showError("Erreur lors de l'ajout (peut-être déjà présent)")
        });
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-[#1e1e1e] border-white/10 text-white">
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <ListMusic size={14} /> Ajouter à une playlist
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="bg-[#1e1e1e] border-white/10 text-white">
                        {playlists.length > 0 ? playlists.map(p => (
                            <ContextMenuItem
                                key={p.id}
                                onClick={() => handleAdd(p.id, p.name)}
                                className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                                {p.name}
                            </ContextMenuItem>
                        )) : (
                            <ContextMenuItem disabled className="text-gray-500">Aucune playlist</ContextMenuItem>
                        )}
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
};
