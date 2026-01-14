/**
 * Composant de section commentaires pour un titre
 * Intégration fluide sous le lecteur audio
 */

import { useState } from 'react';
import { MessageCircle, Send, Trash2, User, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/components/AuthProvider';
import { CommentWithUser } from '@/types/comment';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SongCommentsProps {
    songId: string | null;
    songTitle?: string;
    onLoginRequired?: () => void;
}

export const SongComments = ({ songId, songTitle, onLoginRequired }: SongCommentsProps) => {
    const { user } = useAuth();
    const {
        comments,
        isLoading,
        totalCount,
        addComment,
        deleteComment,
        canDelete
    } = useComments(songId);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            onLoginRequired?.();
            return;
        }

        if (!newComment.trim()) return;

        setIsSubmitting(true);
        const success = await addComment(newComment);
        if (success) {
            setNewComment('');
            setIsExpanded(true);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        await deleteComment(commentId);
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: fr
            });
        } catch {
            return 'Date inconnue';
        }
    };

    const getUserDisplayName = (comment: CommentWithUser) => {
        return comment.user?.display_name ||
            comment.user?.name ||
            comment.user?.email?.split('@')[0] ||
            'Utilisateur';
    };

    if (!songId) return null;

    return (
        <div className="border-t border-white/5 pt-4 mt-4">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-2 group"
            >
                <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-primary" />
                    <span className="font-bold text-sm">Commentaires</span>
                    {totalCount > 0 && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {totalCount}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                ) : (
                    <ChevronDown size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                )}
            </button>

            {/* Form - Toujours visible */}
            <form onSubmit={handleSubmit} className="mt-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={user ? "Écrivez un commentaire..." : "Connectez-vous pour commenter"}
                            disabled={!user || isSubmitting}
                            maxLength={500}
                            className={cn(
                                "min-h-[60px] max-h-[120px] resize-none bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl text-sm pr-12",
                                !user && "cursor-not-allowed opacity-50"
                            )}
                            onClick={() => !user && onLoginRequired?.()}
                        />
                        <span className="absolute bottom-2 right-2 text-[10px] text-gray-600">
                            {newComment.length}/500
                        </span>
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!user || !newComment.trim() || isSubmitting}
                        className="h-[60px] w-12 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            {isExpanded && (
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                canDelete={canDelete(comment)}
                                onDelete={() => handleDelete(comment.id)}
                                formatDate={formatDate}
                                getUserDisplayName={getUserDisplayName}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                            <p>Aucun commentaire pour le moment.</p>
                            <p className="text-xs mt-1">Soyez le premier à commenter !</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Composant individuel de commentaire
interface CommentItemProps {
    comment: CommentWithUser;
    canDelete: boolean;
    onDelete: () => void;
    formatDate: (date: string) => string;
    getUserDisplayName: (comment: CommentWithUser) => string;
}

const CommentItem = ({
    comment,
    canDelete,
    onDelete,
    formatDate,
    getUserDisplayName
}: CommentItemProps) => {
    return (
        <div className="group flex gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {comment.user?.avatar_url ? (
                    <img
                        src={comment.user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User size={14} className="text-gray-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-white truncate">
                        {getUserDisplayName(comment)}
                    </span>
                    <span className="text-[10px] text-gray-600">
                        {formatDate(comment.created_at)}
                    </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                </p>
            </div>

            {/* Delete button */}
            {canDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce commentaire ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/10 hover:bg-white/20">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};
