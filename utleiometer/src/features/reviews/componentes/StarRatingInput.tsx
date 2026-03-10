"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/primitives/button";

type StarRatingInputProps = {
    id: string;
    name: string;
    value?: number;
    onChange: (value: number) => void;
    required?: boolean;
    className?: string;
    showValue?: boolean;
};

export function StarRatingInput({
    id,
    name,
    value,
    onChange,
    required = false,
    className,
    showValue = true,
}: StarRatingInputProps) {
    const [hoveredValue, setHoveredValue] = useState<number | null>(null);
    const selectedValue = typeof value === "number" ? value : undefined;
    const displayValue = hoveredValue ?? selectedValue;

    return (
        <div
            className={cn("flex items-center gap-1", className)}
            onMouseLeave={() => setHoveredValue(null)}
        >
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                const active = displayValue !== undefined && starValue <= displayValue;

                return (
                    <Button
                        key={`${id}-${starValue}`}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onMouseEnter={() => setHoveredValue(starValue)}
                        onFocus={() => setHoveredValue(starValue)}
                        onClick={() => onChange(starValue)}
                        aria-label={`${starValue} av 5`}
                        className="text-amber-500 hover:text-amber-500"
                    >
                        <Star className={cn("h-5 w-5", active ? "fill-amber-500" : "fill-transparent")} />
                    </Button>
                );
            })}

            <input type="hidden" id={id} name={name} value={selectedValue ?? ""} required={required} />
            {showValue && displayValue !== undefined ? (
                <span className="ml-2 text-sm text-muted-foreground">{displayValue}/5</span>
            ) : null}
        </div>
    );
}
