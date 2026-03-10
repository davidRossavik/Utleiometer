"use client"

import {useState} from "react";
import { Button } from "@/ui/primitives/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
    reviewId: string;
    intiialLikeCount: number;
    initialLiked: boolean; 
    onToggleLike: (reviewId: strin) => Promise<void>;
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
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="gap-2"
        >
            <Heart 
                className={`h-5 w-5 transition-colors ${liked ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-pink-300'}`} 
            />
            <span className="text-sm">{likeCount}</span>
        </Button>
    );
}