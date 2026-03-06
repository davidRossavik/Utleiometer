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
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import { useState } from "react";
import { createReviewAction } from "@/app/[locale]/actions/reviews";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type ReviewCreateTexts = {
  brand: string;
  cardTitlePrefix: string;
  cardDescription: string;
  commentLabel: string;
  commentPlaceholder: string;
  ratingLabel: string;
  ratingPlaceholder: string;
  submit: string;
  submitting: string;
  hint: string;
  successAlert: string;
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

      alert(texts.successAlert);
      router.back();
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
                <div className="grid gap-2">
                  <Label htmlFor="comment">{texts.commentLabel}</Label>
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder={texts.commentPlaceholder}
                    className="min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rating">{texts.ratingLabel}</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    placeholder={texts.ratingPlaceholder}
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
