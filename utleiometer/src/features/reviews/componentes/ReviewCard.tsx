"use client";

import { useState } from "react";
import { Review } from "@/features/reviews/types";
import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/feedback/card";
import { EditReviewForm } from "./EditReviewForm";
import { StarRatingDisplay } from "./StarRatingDisplay";

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onSave: (updated: Review) => void;
    onDelete: (reviewId: string) => void;
    texts: {
        editTitle: string;
        defaultTitle: string;
        notRated: string;
        overall: string;
        location: string;
        noise: string;
        landlord: string;
        condition: string;
        emptyComment: string;
        confirmDelete: string;
        deleteYes: string;
        deleteNo: string;
        edit: string;
        delete: string;
    };
}

function formatDate(ts: any) {
    if (!ts?.toDate) return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewCard({ review, currentUserId, onSave, onDelete, texts }: ReviewCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOwner = Boolean(currentUserId && review.userId && review.userId === currentUserId);

    function handleSave(updated: Review) {
        onSave(updated);
        setIsEditing(false);
    }

    function handleDelete() {
        onDelete(review.id);
        setShowDeleteConfirm(false);
    }

    // Redigeringsmodus
    if (isEditing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl text-blue-700">{texts.editTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditReviewForm
                        review={review}
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                    />
                </CardContent>
            </Card>
        );
    }

    // Normal visningsmodus
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <CardTitle className="text-xl text-blue-700">
                    {review.title?.trim() ? review.title : texts.defaultTitle}
                </CardTitle>
                <CardDescription>
                    <span className="mr-2">{texts.overall}</span>
                    <StarRatingDisplay
                        value={review.ratings?.overall ?? review.rating}
                        fallbackLabel={texts.notRated}
                        className="inline-flex"
                        showDecimalLabel
                    />
                    {review.userDisplayName ? `• ${review.userDisplayName}` : null}
                    {review.createdAt ? ` • ${formatDate(review.createdAt)}` : null}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                        <span className="text-sm font-medium">{texts.location}</span>
                        <StarRatingDisplay value={review.ratings?.location} fallbackLabel={texts.notRated} />
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                        <span className="text-sm font-medium">{texts.noise}</span>
                        <StarRatingDisplay value={review.ratings?.noise} fallbackLabel={texts.notRated} />
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                        <span className="text-sm font-medium">{texts.landlord}</span>
                        <StarRatingDisplay value={review.ratings?.landlord} fallbackLabel={texts.notRated} />
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                        <span className="text-sm font-medium">{texts.condition}</span>
                        <StarRatingDisplay value={review.ratings?.condition} fallbackLabel={texts.notRated} />
                    </div>
                </div>

                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {review.comment?.trim() ? review.comment : texts.emptyComment}
                </p>
            </CardContent>

            {isOwner && (
                <CardFooter className="gap-2">
                    {showDeleteConfirm ? (
                        <>
                            <span className="text-sm text-red-600 mr-2">{texts.confirmDelete}</span>
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                {texts.deleteYes}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                {texts.deleteNo}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                {texts.edit}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                                {texts.delete}
                            </Button>
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
