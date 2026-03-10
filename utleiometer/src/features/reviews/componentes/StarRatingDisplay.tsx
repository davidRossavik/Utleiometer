import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingDisplayProps = {
    value?: number;
    fallbackLabel?: string;
    className?: string;
    showDecimalLabel?: boolean;
};

export function StarRatingDisplay({
    value,
    fallbackLabel = "Ikke vurdert",
    className,
    showDecimalLabel = false,
}: StarRatingDisplayProps) {
    if (typeof value !== "number") {
        return <span className={cn("text-sm text-muted-foreground", className)}>{fallbackLabel}</span>;
    }

    const clamped = Math.min(5, Math.max(0, value));
    const roundedToHalf = Math.round(clamped * 2) / 2;
    const labelValue = showDecimalLabel ? clamped.toFixed(1) : String(Math.round(clamped));

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }, (_, index) => {
                    const level = roundedToHalf - index;
                    const fillWidth = level >= 1 ? "100%" : level >= 0.5 ? "50%" : "0%";

                    return (
                        <span key={`star-${index}`} className="relative inline-flex h-4 w-4">
                            <Star className="h-4 w-4 fill-transparent text-amber-500" />
                            {fillWidth !== "0%" ? (
                                <span className="absolute inset-0 overflow-hidden" style={{ width: fillWidth }}>
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                </span>
                            ) : null}
                        </span>
                    );
                })}
            </div>
            <span className="text-sm text-muted-foreground">{labelValue}/5</span>
        </div>
    );
}
