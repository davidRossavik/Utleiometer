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
import { StarRatingInput } from "@/features/reviews/componentes/StarRatingInput";

type PropertyType = "house" | "apartment" | "bedsit";

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
  propertyTypeLabel: string;
  propertyTypeHouse: string;
  propertyTypeApartment: string;
  propertyTypeBedsit: string;
  areaSqmLabel: string;
  areaSqmPlaceholder: string;
  bedroomsLabel: string;
  bedroomsPlaceholder: string;
  bathroomsLabel: string;
  bathroomsPlaceholder: string;
  floorsLabel: string;
  floorsPlaceholder: string;
  buildYearLabel: string;
  buildYearPlaceholder: string;
  roomAreaSqmLabel: string;
  roomAreaSqmPlaceholder: string;
  hasPrivateBathroomLabel: string;
  hasPrivateBathroomYes: string;
  hasPrivateBathroomNo: string;
  otherBedsitsInUnitLabel: string;
  otherBedsitsInUnitPlaceholder: string;
  sectionReviewTitle: string;
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
  const [propertyType, setPropertyType] = useState<PropertyType>("house");
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
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{texts.sectionRegisterTitle}</h3>

              <div className="grid gap-2">
                <Label htmlFor="address">{texts.addressLabel}</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zipCode">{texts.zipCodeLabel}</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">{texts.cityLabel}</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="propertyType">{texts.propertyTypeLabel}</Label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  required
                >
                  <option value="house">{texts.propertyTypeHouse}</option>
                  <option value="apartment">{texts.propertyTypeApartment}</option>
                  <option value="bedsit">{texts.propertyTypeBedsit}</option>
                </select>
              </div>

              {(propertyType === "house" || propertyType === "apartment") && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="areaSqm">{texts.areaSqmLabel}</Label>
                    <Input
                      id="areaSqm"
                      name="areaSqm"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bedrooms">{texts.bedroomsLabel}</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bathrooms">{texts.bathroomsLabel}</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="floors">{texts.floorsLabel}</Label>
                    <Input
                      id="floors"
                      name="floors"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="buildYear">{texts.buildYearLabel}</Label>
                    <Input
                      id="buildYear"
                      name="buildYear"
                      type="number"
                      min={1800}
                      step={1}
                      required
                    />
                  </div>
                </>
              )}

              {propertyType === "bedsit" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="roomAreaSqm">{texts.roomAreaSqmLabel}</Label>
                    <Input
                      id="roomAreaSqm"
                      name="roomAreaSqm"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hasPrivateBathroom">{texts.hasPrivateBathroomLabel}</Label>
                    <select
                      id="hasPrivateBathroom"
                      name="hasPrivateBathroom"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      required
                    >
                      <option value="true">{texts.hasPrivateBathroomYes}</option>
                      <option value="false">{texts.hasPrivateBathroomNo}</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="otherBedsitsInUnit">{texts.otherBedsitsInUnitLabel}</Label>
                    <Input
                      id="otherBedsitsInUnit"
                      name="otherBedsitsInUnit"
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="border-t" />

            <div className="space-y-4">
              <h3 className="text-base font-semibold">{texts.sectionReviewTitle}</h3>

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
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? texts.submitting : texts.submit}
            </Button>

            <Field>
              <FieldDescription className="text-center">{texts.hint}</FieldDescription>
            </Field>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
