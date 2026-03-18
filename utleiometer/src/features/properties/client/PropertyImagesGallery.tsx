"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/ui/primitives/button";

type PropertyImagesGalleryProps = {
  imageUrls?: string[];
  propertyTitle: string;
};

/**
 * Displays property images in a carousel/gallery format.
 * Shows one large image with navigation controls.
 */
export function PropertyImagesGallery({
  imageUrls = [],
  propertyTitle,
}: PropertyImagesGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const currentImageUrl = imageUrls[selectedIndex];
  const hasMultiple = imageUrls.length > 1;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Gallery Display */}
      <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-background">
        {/* Main Image */}
        <div
          className="relative h-52 w-full cursor-pointer overflow-hidden bg-muted/20 transition-opacity hover:opacity-95 sm:h-64 md:h-72"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={currentImageUrl}
            alt={`${propertyTitle} - image ${selectedIndex + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
            {selectedIndex + 1} / {imageUrls.length}
          </div>
        </div>

        {/* Navigation Controls */}
        {hasMultiple && (
          <>
            {/* Previous Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Next Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === selectedIndex
                  ? "border-blue-500 ring-2 ring-blue-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              aria-label={`Select image ${index + 1}`}
            >
              <img
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative flex h-full w-full items-center justify-center p-4">
            {/* Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-white/20"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close fullscreen"
            >
              <X className="h-8 w-8" />
            </Button>

            {/* Fullscreen Image */}
            <div className="relative flex h-[82vh] w-[92vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={currentImageUrl}
                alt={`${propertyTitle} - fullscreen`}
                className="max-h-full max-w-full object-contain"
              />

              {hasMultiple && (
                <>
                  {/* Previous Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>

                  {/* Next Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>

                  {/* Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-3 py-1.5 text-white">
                    {selectedIndex + 1} / {imageUrls.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
