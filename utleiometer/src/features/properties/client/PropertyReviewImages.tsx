"use client";

import { useState } from "react";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { X } from "lucide-react";
import { Button } from "@/ui/primitives/button";

type PropertyReviewImagesProps = {
  propertyId: string;
  maxImages?: number;
  showAsMainImage?: boolean;
  excludeImageUrl?: string;
  layout?: "grid" | "row";
};

/**
 * Displays a grid of images from reviews for a property.
 * Shows multiple images at once.
 */
export function PropertyReviewImages({
  propertyId,
  maxImages = 6,
  showAsMainImage = false,
  excludeImageUrl,
  layout = "grid",
}: PropertyReviewImagesProps) {
  const { reviews } = useReviews({ propertyId });
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const normalizedExcludedImageUrl = excludeImageUrl?.trim();

  // Get only unique, non-empty review images and optionally exclude the main image.
  const uniqueImageUrls = new Set<string>();
  reviews.forEach((review) => {
    const url = review.imageUrl?.trim();
    if (!url) return;
    if (normalizedExcludedImageUrl && url === normalizedExcludedImageUrl) return;
    uniqueImageUrls.add(url);
  });

  // Limit to maxImages
  const displayImages = Array.from(uniqueImageUrls).slice(0, maxImages);

  if (displayImages.length === 0) {
    // Show placeholder only when used as main image
    if (showAsMainImage) {
      return (
        <div
          className={
            layout === "row"
              ? "flex aspect-square w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/20 text-xs text-muted-foreground"
              : "mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border bg-muted/20 text-sm text-muted-foreground"
          }
        >
          Ikke oppgitt
        </div>
      );
    }
    return null;
  }

  // When used as main image, show in a 2-column grid
  if (showAsMainImage) {
    if (layout === "row") {
      return (
        <>
          <div className="flex flex-wrap gap-2">
            {displayImages.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImageUrl(image)}
                className="relative aspect-square w-24 overflow-hidden rounded-lg border bg-muted/20 transition-opacity hover:opacity-80"
                aria-label={`Review image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Lightbox Modal */}
          {selectedImageUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setSelectedImageUrl(null)}
            >
              <div className="relative max-h-[90vh] max-w-2xl">
                <img
                  src={selectedImageUrl}
                  alt="Review image fullscreen"
                  className="h-full w-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImageUrl(null)}
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/10 p-0 text-white hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={image}
              onClick={() => setSelectedImageUrl(image)}
              className="relative overflow-hidden rounded-lg border bg-muted/20 aspect-square hover:opacity-80 transition-opacity"
              aria-label={`Review image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImageUrl && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImageUrl(null)}
          >
            <div className="max-w-2xl max-h-[90vh] relative">
              <img
                src={selectedImageUrl}
                alt="Review image fullscreen"
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImageUrl(null)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/10 p-0 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  // When used as gallery section, show in a 3-column grid
  if (layout === "row") {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {displayImages.map((image, index) => (
            <button
              key={image}
              onClick={() => setSelectedImageUrl(image)}
              className="relative aspect-square w-24 overflow-hidden rounded-lg border bg-muted/10 transition-opacity hover:opacity-80"
              aria-label={`Review image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImageUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImageUrl(null)}
          >
            <div className="relative max-h-[90vh] max-w-2xl">
              <img
                src={selectedImageUrl}
                alt="Review image fullscreen"
                className="h-full w-full object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImageUrl(null)}
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/10 p-0 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Bilder fra anmeldelser ({displayImages.length})
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        {displayImages.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelectedImageUrl(image)}
            className="relative overflow-hidden rounded-lg border bg-muted/10 aspect-square hover:opacity-80 transition-opacity"
            aria-label={`Review image ${index + 1}`}
          >
            <img
              src={image}
              alt={`Review image ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="max-w-2xl max-h-[90vh] relative">
            <img
              src={selectedImageUrl}
              alt="Review image fullscreen"
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/10 p-0 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
