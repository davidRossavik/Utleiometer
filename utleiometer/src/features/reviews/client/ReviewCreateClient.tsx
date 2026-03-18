"use client";

import { Button } from "@/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card";
import { Field, FieldDescription } from "@/ui/primitives/field";
import { Label } from "@/ui/primitives/label";
import { useRef, useState } from "react";
import { createReviewAction } from "@/app/[locale]/actions/reviews";
import { uploadReviewImageAction } from "@/app/[locale]/actions/uploadReviewImage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import Link from "next/link";
import { StarRatingInput } from "../componentes/StarRatingInput";
import { Input } from "@/ui/primitives/input";

export type ReviewCreateTexts = {
  brand: string;
  cardTitlePrefix: string;
  cardDescription: string;
  commentLabel: string;
  commentPlaceholder: string;
  ratingsTitle: string;
  locationLabel: string;
  locationHelp: string;
  noiseLabel: string;
  noiseHelp: string;
  landlordLabel: string;
  landlordHelp: string;
  conditionLabel: string;
  conditionHelp: string;
  reviewImageLabel?: string;
  reviewImageHelp?: string;
  cancel: string;
  submit: string;
  submitting: string;
  hint: string;
};

export type ReviewCreateMessages = {
  notLoggedIn: string;
  missingPropertyId: string;
  unknownError: string;
};

type ReviewCreateClientProps = {
  propertyId: string;
  address: string;
  texts: ReviewCreateTexts;
  messages: ReviewCreateMessages;
};

export default function ReviewCreateClient({
  propertyId,
  address,
  texts,
  messages,
}: ReviewCreateClientProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [skipImageUpload, setSkipImageUpload] = useState(false);
  const [ratingLocation, setRatingLocation] = useState<number | undefined>(undefined);
  const [ratingNoise, setRatingNoise] = useState<number | undefined>(undefined);
  const [ratingLandlord, setRatingLandlord] = useState<number | undefined>(undefined);
  const [ratingCondition, setRatingCondition] = useState<number | undefined>(undefined);
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const reviewImageInputRef = useRef<HTMLInputElement | null>(null);

  function handleCancel() {
    router.push(`/properties/${propertyId}/reviews`);
  }

  function clearReviewImageSelection() {
    setReviewImageFile(null);
    setSkipImageUpload(false);
    if (reviewImageInputRef.current) {
      reviewImageInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentUser) {
      setError(messages.notLoggedIn);
      return;
    }

    if (!propertyId) {
      setError(messages.missingPropertyId);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("propertyId", propertyId);
    formData.append("userId", currentUser.uid);
    if (currentUser.displayName?.trim()) {
      formData.append("userDisplayName", currentUser.displayName.trim());
    }

    try {
      if (reviewImageFile && !skipImageUpload) {
        setIsUploadingImage(true);
        console.log("Starting server-side image upload...");
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", reviewImageFile);
          uploadFormData.append("userId", currentUser.uid);

          const result = await uploadReviewImageAction(uploadFormData);

          if (result.error) {
            console.error("Server upload failed:", result.error);
            setError(result.error);
            setIsSubmitting(false);
            setIsUploadingImage(false);
            return;
          }

          if (result.url) {
            console.log("Image upload successful, URL:", result.url);
            formData.append("reviewImageUrl", result.url);
          }
        } catch (uploadErr) {
          console.error("Image upload error:", uploadErr);
          const uploadErrMsg = uploadErr instanceof Error ? uploadErr.message : "Failed to upload image";
          setError(uploadErrMsg);
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const result = await createReviewAction(formData);

      if ("error" in result) {
        setError(result.error ?? messages.unknownError);
        setIsSubmitting(false);
        return;
      }

      router.replace(`/properties/${propertyId}/reviews?submitted=review`);
    } catch (err) {
      const message = err instanceof Error ? err.message : messages.unknownError;
      console.error("Review submission error:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-background to-blue-100/70 p-6">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <Link href="/" className="font-bold text-4xl text-blue-700 drop-shadow-sm transition-colors hover:text-blue-800">
          {texts.brand}
        </Link>

        <Card className="w-full border-blue-100/90 bg-white/92 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-2xl text-balance text-blue-800">
              {texts.cardTitlePrefix} {address}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">{texts.cardDescription}</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <section className="space-y-3">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
                    {texts.ratingsTitle}
                  </h3>

                  <div className="space-y-3">
                    <div className="grid gap-2">
                    <Label htmlFor="ratingLocation">{texts.locationLabel}</Label>
                    <p className="text-xs text-muted-foreground">{texts.locationHelp}</p>
                    <StarRatingInput
                      id="ratingLocation"
                      name="ratingLocation"
                      value={ratingLocation}
                      onChange={setRatingLocation}
                      showValue={false}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ratingNoise">{texts.noiseLabel}</Label>
                    <p className="text-xs text-muted-foreground">{texts.noiseHelp}</p>
                    <StarRatingInput
                      id="ratingNoise"
                      name="ratingNoise"
                      value={ratingNoise}
                      onChange={setRatingNoise}
                      showValue={false}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ratingLandlord">{texts.landlordLabel}</Label>
                    <p className="text-xs text-muted-foreground">{texts.landlordHelp}</p>
                    <StarRatingInput
                      id="ratingLandlord"
                      name="ratingLandlord"
                      value={ratingLandlord}
                      onChange={setRatingLandlord}
                      showValue={false}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ratingCondition">{texts.conditionLabel}</Label>
                    <p className="text-xs text-muted-foreground">{texts.conditionHelp}</p>
                    <StarRatingInput
                      id="ratingCondition"
                      name="ratingCondition"
                      value={ratingCondition}
                      onChange={setRatingCondition}
                      showValue={false}
                      required
                    />
                  </div>
                  </div>
                </section>

                <div className="grid gap-2">
                  <Label htmlFor="comment">{texts.commentLabel}</Label>
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder={texts.commentPlaceholder}
                    className="min-h-[120px] rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reviewImage">{texts.reviewImageLabel ?? "Bilde i anmeldelsen (valgfritt)"}</Label>
                  <Input
                    id="reviewImage"
                    name="reviewImage"
                    type="file"
                    accept="image/*"
                    ref={reviewImageInputRef}
                    className="h-11 rounded-xl border-slate-300/80 bg-white shadow-xs transition-colors focus-visible:border-blue-400 focus-visible:ring-blue-200"
                    onChange={(e) => {
                      setReviewImageFile(e.target.files?.[0] ?? null);
                      setSkipImageUpload(false);
                    }}
                    disabled={isUploadingImage}
                  />
                  {reviewImageFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <span className="truncate text-slate-700">{reviewImageFile.name}</span>
                        <Button type="button" variant="ghost" className="h-auto px-2 py-1 text-xs" onClick={clearReviewImageSelection} disabled={isUploadingImage}>
                          Fjern bilde
                        </Button>
                      </div>
                      {isUploadingImage && (
                        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                          <span className="text-blue-700 flex-1">Laster opp bilde...</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => setSkipImageUpload(true)}
                          >
                            Hopp over
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {texts.reviewImageHelp ?? "PNG/JPG/WebP, maks 5 MB"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-40 rounded-xl border-slate-300 bg-white hover:bg-slate-50"
                  onClick={handleCancel}
                >
                  {texts.cancel}
                </Button>
                <Button
                  type="submit"
                  className="w-40 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md transition hover:from-blue-800 hover:to-blue-700"
                  disabled={isSubmitting && !skipImageUpload}
                >
                  {isUploadingImage && !skipImageUpload ? "Laster opp bilde..." : isSubmitting ? texts.submitting : texts.submit}
                </Button>
              </div>

              <Field>
                <FieldDescription className="text-center">
                  {texts.hint}
                </FieldDescription>
              </Field>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
