"use client";

import { Button } from "@/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    <main className="bg-muted min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <Link href="/" className="font-bold text-4xl text-blue-700">
          {texts.brand}
        </Link>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">
              {texts.cardTitlePrefix} {address}
            </CardTitle>
            <CardDescription>{texts.cardDescription}</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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

                <div className="grid gap-2">
                  <Label htmlFor="comment">{texts.commentLabel}</Label>
                  <textarea
                    id="comment"
                    name="comment"
                    className="min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? texts.submitting : texts.submit}
              </Button>

              <Field>
                <FieldDescription className="text-center">
                  {texts.hint}
                </FieldDescription>
              </Field>
            </form>
          </CardContent>

          <CardFooter />
        </Card>
      </div>
    </main>
  );
}
