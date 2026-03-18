"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { uploadPropertyImageAction } from "@/app/[locale]/actions/uploadPropertyImage";
import { updatePropertyImageUrlsAction } from "@/app/[locale]/actions/properties";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/feedback/card";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/features/properties/types";

type PropertyEditClientProps = {
  property: Property;
};

export default function PropertyEditClient({ property }: PropertyEditClientProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [propertyImageFiles, setPropertyImageFiles] = useState<File[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>(property.imageUrls ?? []);
  const propertyImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) {
    return (
      <div className="text-center text-red-600">
        Du må være logget inn for å redigere en eiendom.
      </div>
    );
  }

  // Check if user owns this property
  const isOwner = (property as any).registeredByUid === currentUser.uid;
  if (!isOwner) {
    return (
      <div className="text-center text-red-600">
        Du har ikke tillatelse til å redigere denne eiendommen.
      </div>
    );
  }

  function removeCurrentImage(index: number) {
    setCurrentImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    setPropertyImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveImages(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    setIsUploadingImages(true);

    try {
      let imageUrls = [...currentImageUrls];

      // Upload new images
      if (propertyImageFiles.length > 0) {
        console.log(`Uploading ${propertyImageFiles.length} new property images...`);

        for (const file of propertyImageFiles) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);
          uploadFormData.append("userId", currentUser!.uid);

          const result = await uploadPropertyImageAction(uploadFormData);

          if (result.error) {
            console.error("Property image upload failed:", result.error);
            setError(result.error);
            setIsSubmitting(false);
            setIsUploadingImages(false);
            return;
          }

          if (result.url) {
            console.log("Property image uploaded successfully:", result.url);
            imageUrls.push(result.url);
          }
        }
      }

      // Update property with image URLs
      console.log(`Updating property with ${imageUrls.length} images...`);
      const updateResult = await updatePropertyImageUrlsAction(property.id, imageUrls);

      if (!updateResult.success) {
        setError(updateResult.error || "Kunne ikke oppdatere bildene");
        setIsSubmitting(false);
        setIsUploadingImages(false);
        return;
      }

      setSuccess("Bilder oppdatert!");
      setPropertyImageFiles([]);
      if (propertyImageInputRef.current) {
        propertyImageInputRef.current.value = "";
      }

      // Redirect back to property page
      setTimeout(() => {
        router.push(`/properties/${property.id}/reviews`);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Noe gikk galt";
      console.error("Save images error:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-background to-blue-100/70 p-6">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <Link href={`/properties/${property.id}/reviews`} className="font-bold text-4xl text-blue-700 drop-shadow-sm transition-colors hover:text-blue-800">
          {property.address}
        </Link>

        <Card className="w-full border-blue-100/90 bg-white/92 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-2xl text-balance text-blue-800">
              Rediger bilder
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSaveImages}>
              {/* Current Images */}
              {currentImageUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-blue-800">Nåværende bilder ({currentImageUrls.length})</div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {currentImageUrls.map((url, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-lg border border-blue-100">
                        <div className="relative aspect-square w-full">
                          <img
                            src={url}
                            alt={`Property image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCurrentImage(index)}
                          disabled={isUploadingImages}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <span className="text-white text-sm font-medium">Fjern</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Input */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="propertyImages">Legg til nye bilder (valgfritt)</Label>
                  <Input
                    id="propertyImages"
                    name="propertyImages"
                    type="file"
                    accept="image/*"
                    multiple
                    ref={propertyImageInputRef}
                    className="mt-2 h-11 rounded-xl border-slate-300/80 bg-white shadow-xs transition-colors focus-visible:border-blue-400 focus-visible:ring-blue-200"
                    onChange={(e) => {
                      setPropertyImageFiles(Array.from(e.target.files ?? []));
                    }}
                    disabled={isUploadingImages}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG/JPG/WebP, maks 15 MB per bilde
                  </p>
                </div>

                {propertyImageFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
                      <p className="text-xs font-medium text-blue-700 mb-2">Nye bilder ({propertyImageFiles.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {propertyImageFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1 text-xs gap-2">
                            <span className="truncate text-slate-700 max-w-xs">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto px-1 py-0 text-xs text-red-600 hover:text-red-700"
                              onClick={() => removeNewImage(index)}
                              disabled={isUploadingImages}
                            >
                              Fjern
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {isUploadingImages && (
                      <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                        <span className="text-blue-700">Laster opp {propertyImageFiles.length} bilde(r)...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {success}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-40 rounded-xl border-slate-300 bg-white hover:bg-slate-50"
                  onClick={() => router.push(`/properties/${property.id}/reviews`)}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="w-40 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
                  disabled={isSubmitting || (propertyImageFiles.length === 0 && currentImageUrls.length === (property.imageUrls?.length ?? 0))}
                >
                  {isSubmitting ? "Lagrer..." : "Lagre"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
