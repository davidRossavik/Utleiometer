"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPropertyAndReviewAction } from "@/app/actions/properties";

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

export default function PropertyRegisterClient() {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!currentUser) {
            setError("Du må være logget inn for å registere en bolig");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        formData.append("registeredByUid", currentUser.uid);

        try {
            const result = await createPropertyAndReviewAction(formData);

            if ("error" in result) {
                setError(result.error ?? "Noe gikk galt");
                return;
            }

            router.push("/");
        } catch {
            setError("Noe gikk galt");
        } finally {
            setIsSubmitting(false);
        }
    }

     return (
            <div className="flex w-full max-w-lg flex-col items-center gap-6">
                <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl">Registrer og anmeld bolig</CardTitle>
                    <CardDescription>Registrer adressen og del din erfaring</CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                    {/* === 1. REGISTRER BOLIG === */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">📍 Registrer bolig</h3>

                        <div className="grid gap-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="F.eks. Elgeseter gate 1"
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="zipCode">Postnummer</Label>
                        <Input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            placeholder="7030"
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="city">By</Label>
                        <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Trondheim"
                            required
                        />
                        </div>
                    </div>

                    <div className="border-t" />

                    {/* === 2. ANMELDELSE AV BOLIG === */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">🏠 Anmeld bolig</h3>

                        <div className="grid gap-2">
                        <Label htmlFor="comment">Beskriv boligen</Label>
                        <textarea
                            id="comment"
                            name="comment"
                            placeholder="F.eks. Stille nabolag, litt langt fra sentrum"
                            className="min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="rating">Vurdering (1–5)</Label>
                        <Input
                            id="rating"
                            name="rating"
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            placeholder="3"
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
                        {isSubmitting ? "Registrerer..." : "Registrer bolig"}
                    </Button>

                    <Field>
                        <FieldDescription className="text-center">
                        Du kan redigere anmeldelsen senere
                        </FieldDescription>
                    </Field>
                    </form>
                </CardContent>

                <CardFooter />
                </Card>
            </div>
    );
}