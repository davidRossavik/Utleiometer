"use client";

import { useState } from "react";
import type { Review, ReviewRatings } from "@/features/reviews/types";
import { Button } from "@/ui/primitives/button";
import { Label } from "@/ui/primitives/label";
import { StarRatingInput } from "./StarRatingInput";

interface EditReviewFormProps {
    review: Review;
    onSave: (updated: Review) => void;
    onCancel: () => void;
}

export function EditReviewForm({ review, onSave, onCancel }: EditReviewFormProps) {
    const initialCategoryValue = typeof review.rating === "number" ? review.rating : 3;
    const [ratingLocation, setRatingLocation] = useState<number>(review.ratings?.location ?? initialCategoryValue);
    const [ratingNoise, setRatingNoise] = useState<number>(review.ratings?.noise ?? initialCategoryValue);
    const [ratingLandlord, setRatingLandlord] = useState<number>(review.ratings?.landlord ?? initialCategoryValue);
    const [ratingCondition, setRatingCondition] = useState<number>(review.ratings?.condition ?? initialCategoryValue);
    const [comment, setComment] = useState<string>(review.comment ?? "");
    const [error, setError] = useState<string | null>(null);

    function calculateOverall(ratings: Omit<ReviewRatings, "overall">) {
        return Number((((ratings.location + ratings.noise + ratings.landlord + ratings.condition) / 4)).toFixed(1));
    }

    function handleSave() {
        const categoryValues = [ratingLocation, ratingNoise, ratingLandlord, ratingCondition];
        const hasInvalidCategory = categoryValues.some((value) => value < 1 || value > 5 || !Number.isInteger(value));

        if (hasInvalidCategory) {
            setError("Alle kategorier må være mellom 1 og 5.");
            return;
        }
        if (!comment.trim()) {
            setError("Kommentar kan ikke være tom.");
            return;
        }

        const ratingsWithoutOverall = {
            location: ratingLocation,
            noise: ratingNoise,
            landlord: ratingLandlord,
            condition: ratingCondition,
        };
        const ratings: ReviewRatings = {
            ...ratingsWithoutOverall,
            overall: calculateOverall(ratingsWithoutOverall),
        };

        setError(null);
        onSave({
            ...review,
            rating: ratings.overall, // legacy support
            ratings,
            comment: comment.trim(),
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-rating-location-${review.id}`}>Beliggenhet</Label>
                <StarRatingInput
                    id={`edit-rating-location-${review.id}`}
                    name="editRatingLocation"
                    value={ratingLocation}
                    onChange={setRatingLocation}
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-rating-noise-${review.id}`}>Støy</Label>
                <StarRatingInput
                    id={`edit-rating-noise-${review.id}`}
                    name="editRatingNoise"
                    value={ratingNoise}
                    onChange={setRatingNoise}
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-rating-landlord-${review.id}`}>Utleier</Label>
                <StarRatingInput
                    id={`edit-rating-landlord-${review.id}`}
                    name="editRatingLandlord"
                    value={ratingLandlord}
                    onChange={setRatingLandlord}
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`edit-rating-condition-${review.id}`}>Standard</Label>
                <StarRatingInput
                    id={`edit-rating-condition-${review.id}`}
                    name="editRatingCondition"
                    value={ratingCondition}
                    onChange={setRatingCondition}
                    required
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
