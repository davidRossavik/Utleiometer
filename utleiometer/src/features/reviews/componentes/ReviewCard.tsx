"use client";

import { useState, type FormEvent } from "react";
import { Review } from "@/features/reviews/types";
import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/feedback/card";
import { EditReviewForm } from "./EditReviewForm";
import { StarRatingDisplay } from "./StarRatingDisplay";
import { LikeButton } from "./LikeButton";

type ReportReviewResult = {
    success?: boolean;
    alreadyReported?: boolean;
    error?: string;
};

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onSave: (updated: Review) => void;
    onDelete: (reviewId: string) => void;
    onToggleLike: (reviewId: string) => Promise<void>;
    onReport?: (reviewId: string, reason?: string) => Promise<ReportReviewResult>;
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
        report?: string;
        reportReasonLabel?: string;
        reportReasonPlaceholder?: string;
        reportSubmit?: string;
        reportCancel?: string;
        reportSubmitted?: string;
        reportAlreadySubmitted?: string;
        reportFailed?: string;
    };
}

function formatDate(ts: any) {
    if (!ts?.toDate) return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewCard({ review, currentUserId, onSave, onDelete, onToggleLike, onReport, texts }: ReviewCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportMessage, setReportMessage] = useState<string | null>(null);

    const isOwner = Boolean(currentUserId && review.userId && review.userId === currentUserId);
    const hasLiked = currentUserId ? Boolean(review.likedBy?.includes(currentUserId)) : false;
    const canReport = Boolean(currentUserId && !isOwner && onReport);
    const reviewHeading = review.userDisplayName?.trim() || texts.defaultTitle;
    const reportLabel = texts.report ?? "Report review";
    const reportReasonLabel = texts.reportReasonLabel ?? "Reason for report";
    const reportReasonPlaceholder = texts.reportReasonPlaceholder ?? "Optional: describe the issue";
    const reportSubmitText = texts.reportSubmit ?? "Submit report";
    const reportCancelText = texts.reportCancel ?? "Cancel";
    const reportSubmittedText = texts.reportSubmitted ?? "Report submitted";
    const reportAlreadySubmittedText = texts.reportAlreadySubmitted ?? "You already reported this review";
    const reportFailedText = texts.reportFailed ?? "Could not submit report";


    function handleSave(updated: Review) {
        onSave(updated);
        setIsEditing(false);
    }

    function handleDelete() {
        onDelete(review.id);
        setShowDeleteConfirm(false);
    }

    function handleOpenReport() {
        setShowReportForm(true);
        setReportMessage(null);
    }

    function handleCancelReport() {
        if (isSubmittingReport) return;
        setShowReportForm(false);
        setReportReason("");
    }

    async function handleSubmitReport(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!onReport) return;

        setIsSubmittingReport(true);
        setReportMessage(null);

        try {
            const result = await onReport(review.id, reportReason.trim());

            if (result?.error) {
                setReportMessage(result.error);
                return;
            }

            setReportMessage(result?.alreadyReported ? reportAlreadySubmittedText : reportSubmittedText);
            setShowReportForm(false);
            setReportReason("");
        } catch {
            setReportMessage(reportFailedText);
        } finally {
            setIsSubmittingReport(false);
        }
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
                    {reviewHeading}
                </CardTitle>
                <CardDescription>
                    <span className="mr-2">{texts.overall}</span>
                    <StarRatingDisplay
                        value={review.ratings?.overall ?? review.rating}
                        fallbackLabel={texts.notRated}
                        className="inline-flex"
                        showDecimalLabel
                    />
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

                {canReport && showReportForm ? (
                    <form onSubmit={handleSubmitReport} className="mt-4 rounded-md border p-3">
                        <label htmlFor={`report-reason-${review.id}`} className="mb-2 block text-sm font-medium">
                            {reportReasonLabel}
                        </label>
                        <textarea
                            id={`report-reason-${review.id}`}
                            value={reportReason}
                            onChange={(event) => setReportReason(event.target.value)}
                            placeholder={reportReasonPlaceholder}
                            className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                        />
                        <div className="mt-3 flex items-center gap-2">
                            <Button type="submit" size="sm" disabled={isSubmittingReport}>
                                {reportSubmitText}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleCancelReport}
                                disabled={isSubmittingReport}
                            >
                                {reportCancelText}
                            </Button>
                        </div>
                    </form>
                ) : null}

                {canReport && reportMessage ? (
                    <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">
                        {reportMessage}
                    </p>
                ) : null}
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                <LikeButton
                    reviewId={review.id}
                    initialLikeCount={review.likeCount || 0}
                    initialLiked={hasLiked}
                    onToggleLike={onToggleLike}
                    disabled={!currentUserId}
                />

                <div className="flex items-center gap-2">
                    {canReport && !showReportForm ? (
                        <Button variant="outline" size="sm" onClick={handleOpenReport}>
                            {reportLabel}
                        </Button>
                    ) : null}

                    {isOwner && (
                        <div className="flex gap-2">
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
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
