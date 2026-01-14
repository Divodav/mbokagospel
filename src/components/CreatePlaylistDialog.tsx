import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";

interface CreatePlaylistDialogProps {
    onPlaylistCreated?: () => void;
    trigger?: React.ReactNode;
}

export const CreatePlaylistDialog = ({ onPlaylistCreated, trigger }: CreatePlaylistDialogProps) => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        if (!user) {
            showError("Vous devez être connecté");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('playlists')
                .insert({
                    name: name.trim(),
                    user_id: user.id
                });

            if (error) throw error;

            showSuccess("Playlist créée avec succès");
            setName("");
            setOpen(false);
            onPlaylistCreated?.();
        } catch (error) {
            console.error(error);
            showError("Impossible de créer la playlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-full bg-primary hover:bg-primary/90 gap-2 h-10 px-6 font-black text-xs">
                        <Plus size={16} /> CRÉER UNE PLAYLIST
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#1e1e1e] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nouvelle Playlist</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Input
                        placeholder="Nom de la playlist"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:ring-primary"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={loading || !name.trim()}
                        className="bg-primary hover:bg-primary/90 font-bold"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Créer"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
