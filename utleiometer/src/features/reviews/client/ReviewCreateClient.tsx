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
import { useState } from "react";
import { createReviewAction } from "@/app/[locale]/actions/reviews";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarRatingInput } from "../componentes/StarRatingInput";

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
  const [ratingLocation, setRatingLocation] = useState<number | undefined>(undefined);
  const [ratingNoise, setRatingNoise] = useState<number | undefined>(undefined);
  const [ratingLandlord, setRatingLandlord] = useState<number | undefined>(undefined);
  const [ratingCondition, setRatingCondition] = useState<number | undefined>(undefined);

  function handleCancel() {
    router.push(`/properties/${propertyId}/reviews`);
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

    try {
      const result = await createReviewAction(formData);

      if ("error" in result) {
        setError(result.error ?? messages.unknownError);
        setIsSubmitting(false);
        return;
      }

      router.replace(`/properties/${propertyId}/reviews?submitted=review`);
    } catch {
      setError(messages.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-background to-cyan-50 p-6">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? texts.submitting : texts.submit}
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
