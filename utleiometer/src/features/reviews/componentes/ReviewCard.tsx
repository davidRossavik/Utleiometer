"use client";

import { useState } from "react";
import { Review } from "@/features/reviews/types";
import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/feedback/card";
import { EditReviewForm } from "./EditReviewForm";

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onSave: (updated: Review) => void;
    onDelete: (reviewId: string) => void;
}

function formatDate(ts: any) {
    if (!ts?.toDate) return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewCard({ review, currentUserId, onSave, onDelete }: ReviewCardProps) {
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
                    <CardTitle className="text-xl text-blue-700">Rediger anmeldelse</CardTitle>
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
                    {review.title?.trim() ? review.title : "Anmeldelse"}
                </CardTitle>
                <CardDescription>
                    <span className="mr-2">
                        {typeof review.rating === "number" ? `${review.rating}/5` : "Ingen rating"}
                    </span>
                    {review.userDisplayName ? `• ${review.userDisplayName}` : null}
                    {review.createdAt ? ` • ${formatDate(review.createdAt)}` : null}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {review.comment?.trim() ? review.comment : "Ingen tekst."}
                </p>
            </CardContent>

            {isOwner && (
                <CardFooter className="gap-2">
                    {showDeleteConfirm ? (
                        <>
                            <span className="text-sm text-red-600 mr-2">Er du sikker?</span>
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                Ja, slett
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                Nei
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                Rediger
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                                Slett
                            </Button>
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}