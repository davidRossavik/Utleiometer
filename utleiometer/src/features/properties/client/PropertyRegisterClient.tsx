"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { lookupPropertyByAddressAction, submitUnifiedReviewAction } from "@/app/[locale]/actions/properties";
import { uploadReviewImageAction } from "@/app/[locale]/actions/uploadReviewImage";

import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import { Field, FieldDescription } from "@/ui/primitives/field";
import {
  Card,
  CardContent,
} from "@/ui/feedback/card";
import { StarRatingInput } from "@/features/reviews/componentes/StarRatingInput";

type PropertyType = "house" | "apartment" | "bedsit";
type WizardStep = "address" | "propertyDetails" | "review";

export type PropertyRegisterTexts = {
  cardTitle: string;
  cardDescription: string;
  addressStepTitle: string;
  propertyDetailsStepTitle: string;
  reviewStepTitle: string;
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
  continueButton: string;
  cancelButton: string;
  submitButton: string;
  submittingButton: string;
  propertyFoundMessage: string;
  propertyNotFoundMessage: string;
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

  const [step, setStep] = useState<WizardStep>("address");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [existingPropertyId, setExistingPropertyId] = useState<string | null>(null);

  const [propertyType, setPropertyType] = useState<PropertyType>("house");
  const [areaSqm, setAreaSqm] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [floors, setFloors] = useState("");
  const [buildYear, setBuildYear] = useState("");
  const [roomAreaSqm, setRoomAreaSqm] = useState("");
  const [hasPrivateBathroom, setHasPrivateBathroom] = useState("true");
  const [otherBedsitsInUnit, setOtherBedsitsInUnit] = useState("");

  const [ratingLocation, setRatingLocation] = useState<number | undefined>(undefined);
  const [ratingNoise, setRatingNoise] = useState<number | undefined>(undefined);
  const [ratingLandlord, setRatingLandlord] = useState<number | undefined>(undefined);
  const [ratingCondition, setRatingCondition] = useState<number | undefined>(undefined);
  const [comment, setComment] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const reviewImageInputRef = useRef<HTMLInputElement | null>(null);
  const baseInputClass =
    "h-11 rounded-xl border-slate-300/80 bg-white shadow-xs transition-colors focus-visible:border-blue-400 focus-visible:ring-blue-200";
  const baseSelectClass =
    "h-11 rounded-xl border border-slate-300/80 bg-white px-3 text-sm shadow-xs transition-colors focus:border-blue-400 focus:outline-none focus:ring-3 focus:ring-blue-100";
  const formBlockClass = "space-y-4";

  function handleCancel() {
    router.push("/");
  }

  async function handleAddressLookup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setIsLookingUp(true);

    const formData = new FormData();
    formData.append("address", address);
    formData.append("zipCode", zipCode);
    formData.append("city", city);

    try {
      const result = await lookupPropertyByAddressAction(formData);

      if ("error" in result) {
        setError(result.error ?? messages.unknownError);
        return;
      }

      if (result.exists) {
        setExistingPropertyId(result.propertyId);
        setStep("review");
        return;
      }

      setExistingPropertyId(null);
      setStep("propertyDetails");
    } catch {
      setError(messages.unknownError);
    } finally {
      setIsLookingUp(false);
    }
  }

  function handleContinueToReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStep("review");
  }

  function clearReviewImageSelection() {
    setReviewImageFile(null);
    if (reviewImageInputRef.current) {
      reviewImageInputRef.current.value = "";
    }
  }

  function appendPropertyDetails(formData: FormData) {
    formData.append("propertyType", propertyType);

    if (propertyType === "house" || propertyType === "apartment") {
      formData.append("areaSqm", areaSqm);
      formData.append("bedrooms", bedrooms);
      formData.append("bathrooms", bathrooms);
      formData.append("floors", floors);
      formData.append("buildYear", buildYear);
      return;
    }

    formData.append("roomAreaSqm", roomAreaSqm);
    formData.append("hasPrivateBathroom", hasPrivateBathroom);
    formData.append("otherBedsitsInUnit", otherBedsitsInUnit);
  }

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentUser) {
      setError(messages.notLoggedIn);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("registeredByUid", currentUser.uid);
    formData.append("address", address);
    formData.append("zipCode", zipCode);
    formData.append("city", city);

    if (!existingPropertyId) {
      appendPropertyDetails(formData);
    }

    formData.append("ratingLocation", String(ratingLocation ?? ""));
    formData.append("ratingNoise", String(ratingNoise ?? ""));
    formData.append("ratingLandlord", String(ratingLandlord ?? ""));
    formData.append("ratingCondition", String(ratingCondition ?? ""));
    formData.append("comment", comment);

    try {
      if (reviewImageFile) {
        const reviewFormData = new FormData();
        reviewFormData.append("file", reviewImageFile);
        reviewFormData.append("userId", currentUser.uid);

        const reviewImageResult = await uploadReviewImageAction(reviewFormData);
        if (reviewImageResult.error) {
          setError(reviewImageResult.error);
          setIsSubmitting(false);
          return;
        }
        if (reviewImageResult.url) {
          formData.append("reviewImageUrl", reviewImageResult.url);
        }
      }

      const result = await submitUnifiedReviewAction(formData);

      if ("error" in result) {
        setError(result.error ?? messages.unknownError);
        return;
      }

      router.replace(`/properties/${result.propertyId}/reviews?submitted=review`);
    } catch {
      setError(messages.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <Card className="w-full border-blue-100/90 bg-white/92 shadow-xl backdrop-blur-sm">
        <CardContent className="space-y-6 p-6 md:p-8">
          {step === "address" ? (
            <form className="flex flex-col gap-6" onSubmit={handleAddressLookup}>
              <div className={`space-y-4 ${formBlockClass}`}>
                <h3 className="text-base font-semibold text-blue-800">{texts.addressStepTitle}</h3>

                <div className="grid gap-2">
                  <Label htmlFor="address">{texts.addressLabel}</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder={texts.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={baseInputClass}
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
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={baseInputClass}
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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={baseInputClass}
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              ) : null}

              <div className="flex items-center justify-center gap-3">
                <Button type="button" variant="outline" className="w-40 rounded-xl border-slate-300 bg-white hover:bg-slate-50" onClick={handleCancel}>
                  {texts.cancelButton}
                </Button>
                <Button
                  type="submit"
                  className="w-40 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
                  disabled={isLookingUp}
                >
                  {isLookingUp ? texts.submittingButton : texts.continueButton}
                </Button>
              </div>
            </form>
          ) : null}

          {step === "propertyDetails" ? (
            <form className="flex flex-col gap-6" onSubmit={handleContinueToReview}>
              <div className={`space-y-4 ${formBlockClass}`}>
                <h3 className="text-base font-semibold text-blue-800">{texts.propertyDetailsStepTitle}</h3>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  {texts.propertyNotFoundMessage}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="propertyType">{texts.propertyTypeLabel}</Label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    className={baseSelectClass}
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
                        placeholder={texts.areaSqmPlaceholder}
                        value={areaSqm}
                        onChange={(e) => setAreaSqm(e.target.value)}
                        className={baseInputClass}
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
                        placeholder={texts.bedroomsPlaceholder}
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className={baseInputClass}
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
                        placeholder={texts.bathroomsPlaceholder}
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className={baseInputClass}
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
                        placeholder={texts.floorsPlaceholder}
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        className={baseInputClass}
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
                        placeholder={texts.buildYearPlaceholder}
                        value={buildYear}
                        onChange={(e) => setBuildYear(e.target.value)}
                        className={baseInputClass}
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
                        placeholder={texts.roomAreaSqmPlaceholder}
                        value={roomAreaSqm}
                        onChange={(e) => setRoomAreaSqm(e.target.value)}
                        className={baseInputClass}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hasPrivateBathroom">{texts.hasPrivateBathroomLabel}</Label>
                      <select
                        id="hasPrivateBathroom"
                        name="hasPrivateBathroom"
                        className={baseSelectClass}
                        value={hasPrivateBathroom}
                        onChange={(e) => setHasPrivateBathroom(e.target.value)}
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
                        placeholder={texts.otherBedsitsInUnitPlaceholder}
                        value={otherBedsitsInUnit}
                        onChange={(e) => setOtherBedsitsInUnit(e.target.value)}
                        className={baseInputClass}
                        required
                      />
                    </div>
                  </>
                )}

              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              ) : null}

              <div className="flex items-center justify-center gap-3">
                <Button type="button" variant="outline" className="w-40 rounded-xl border-slate-300 bg-white hover:bg-slate-50" onClick={handleCancel}>
                  {texts.cancelButton}
                </Button>
                <Button type="submit" className="w-40 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700">
                  {texts.continueButton}
                </Button>
              </div>
            </form>
          ) : null}

          {step === "review" ? (
            <form className="flex flex-col gap-6" onSubmit={handleFinalSubmit}>
              <div className={`space-y-4 ${formBlockClass}`}>
                <h3 className="text-base font-semibold text-blue-800">{texts.reviewStepTitle}</h3>

                <section className="space-y-3">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">{texts.ratingsTitle}</h4>

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
                    className="min-h-[120px] rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus:border-blue-400 focus:outline-none"
                    placeholder={texts.commentPlaceholder}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
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
                    className={baseInputClass}
                    onChange={(e) => setReviewImageFile(e.target.files?.[0] ?? null)}
                  />
                  {reviewImageFile ? (
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                      <span className="truncate text-slate-700">{reviewImageFile.name}</span>
                      <Button type="button" variant="ghost" className="h-auto px-2 py-1 text-xs" onClick={clearReviewImageSelection}>
                        Fjern bilde
                      </Button>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {texts.reviewImageHelp ?? "PNG/JPG/WebP, maks 5 MB"}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              ) : null}

              <div className="flex items-center justify-center gap-3">
                <Button type="button" variant="outline" className="w-40 rounded-xl border-slate-300 bg-white hover:bg-slate-50" onClick={handleCancel}>
                  {texts.cancelButton}
                </Button>
                <Button
                  type="submit"
                  className="w-40 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? texts.submittingButton : texts.submitButton}
                </Button>
              </div>

              <Field>
                <FieldDescription className="text-center">{texts.hint}</FieldDescription>
              </Field>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
