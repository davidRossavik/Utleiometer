"use client";

import { useState } from "react";
import { Review } from "@/features/reviews/types";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

interface EditReviewFormProps {
    review: Review;
    onSave: (updated: Review) => void;
    onCancel: () => void;
}

export function EditReviewForm({ review, onSave, onCancel }: EditReviewFormProps) {
    const [rating, setRating] = useState<number>(review.rating ?? 1);
    const [comment, setComment] = useState<string>(review.comment ?? "");
    const [error, setError] = useState<string | null>(null);

    function handleSave() {
        // Validering
        if (rating < 1 || rating > 5) {
            setError("Rating må være mellom 1 og 5.");
            return;
        }
        if (!comment.trim()) {
            setError("Kommentar kan ikke være tom.");
            return;
        }

        setError(null);
        onSave({
            ...review,
            rating,
            comment: comment.trim(),
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-rating-${review.id}`}>Rating (1–5)</Label>
                <Input
                    id={`edit-rating-${review.id}`}
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-comment-${review.id}`}>Kommentar</Label>
                <textarea
                    id={`edit-comment-${review.id}`}
                    className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
                <Button onClick={handleSave}>Lagre</Button>
                <Button variant="secondary" onClick={onCancel}>Avbryt</Button>
            </div>
        </div>
    );
}