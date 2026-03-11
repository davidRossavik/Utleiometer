"use client"

import {useState, useEffect} from "react";
import { Button } from "@/ui/primitives/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
    reviewId: string;
    initialLikeCount: number;
    initialLiked: boolean; 
    onToggleLike: (reviewId: string) => Promise<void>;
    disabled?: boolean;
}

export function LikeButton({
    reviewId, 
    initialLikeCount, 
    initialLiked, 
    onToggleLike,
    disabled 
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with props when they change (e.g., after refetch)
    useEffect(() => {
        setLiked(initialLiked);
        setLikeCount(initialLikeCount);
    }, [initialLiked, initialLikeCount]);

    async function handleClick() {
        if (disabled || isLoading) return;

        setIsLoading(true);
        const previousLiked = liked;
        const previousCount = likeCount;

        // Optimistic update
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        try {
            await onToggleLike(reviewId);
        } catch (error) {
            // Revert on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
            console.error("Failed to toggle like:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="gap-2"
        >
            <Heart 
                className={`h-5 w-5 transition-all ${liked ? 'fill-pink-500 text-pink-500' : 'fill-white text-pink-500 stroke-pink-500 stroke-2 hover:fill-pink-100'}`} 
            />
            <span className="text-sm">{likeCount}</span>
        </Button>
    );
}