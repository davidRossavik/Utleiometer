"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPropertyAndReviewAction } from "@/app/[locale]/actions/properties";

import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import { Field, FieldDescription } from "@/ui/primitives/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card";

export type PropertyRegisterTexts = {
    cardTitle: string;
    cardDescription: string;
    sectionRegisterTitle: string;
    addressLabel: string;
    addressPlaceholder: string;
    zipCodeLabel: string;
    zipCodePlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    sectionReviewTitle: string;
    commentLabel: string;
    commentPlaceholder: string;
    ratingLabel: string;
    ratingPlaceholder: string;
    submit: string;
    submitting: string;
    hint: string;
};

export type PropertyRegisterMessages = {
    notLoggedIn: string;
    unknownError: string;
};

type PropertyRegisterClientProps = {
    texts: PropertyRegisterTexts;
    messages: PropertyRegisterMessages;
};

export default function PropertyRegisterClient({ texts, messages }: PropertyRegisterClientProps) {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!currentUser) {
            setError(messages.notLoggedIn);
            return;
        }

        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        formData.append("registeredByUid", currentUser.uid);

        try {
            const result = await createPropertyAndReviewAction(formData);

            if ("error" in result) {
                setError(result.error ?? messages.unknownError);
                return;
            }

            router.push("/");
        } catch {
            setError(messages.unknownError);
        } finally {
            setIsSubmitting(false);
        }
    }

     return (
            <div className="flex w-full max-w-lg flex-col items-center gap-6">
                <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl">{texts.cardTitle}</CardTitle>
                    <CardDescription>{texts.cardDescription}</CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                    {/* === 1. REGISTRER BOLIG === */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">{texts.sectionRegisterTitle}</h3>

                        <div className="grid gap-2">
                        <Label htmlFor="address">{texts.addressLabel}</Label>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder={texts.addressPlaceholder}
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="zipCode">{texts.zipCodeLabel}</Label>
                        <Input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            placeholder={texts.zipCodePlaceholder}
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="city">{texts.cityLabel}</Label>
                        <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder={texts.cityPlaceholder}
                            required
                        />
                        </div>
                    </div>

                    <div className="border-t" />

                    {/* === 2. ANMELDELSE AV BOLIG === */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">{texts.sectionReviewTitle}</h3>

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
    );
}