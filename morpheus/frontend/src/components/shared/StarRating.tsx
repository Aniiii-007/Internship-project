import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface StarRatingProps {
  rating: number; // 1-5
  size?: number;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  size = 14,
  showValue = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-morpheus-border"
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm text-morpheus-text font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
