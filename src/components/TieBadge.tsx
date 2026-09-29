import { Equal } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * Pill shown on teams that share a rank with someone else.
 * Uses the team color so it reads as part of that row.
 */
export default function TieBadge({
  color,
  rank,
  large = false,
  className,
}: {
  color: string;
  rank: number;
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-mono font-bold uppercase tracking-[0.16em]",
        large ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[9px]",
        className,
      )}
      style={{
        color,
        borderColor: `${color}59`,
        background: `${color}1a`,
      }}
      title={`Tied for rank ${rank}`}
      aria-label={`Tied for rank ${rank}`}
    >
      <Equal size={large ? 11 : 9} strokeWidth={3} />
      TIED
    </span>
  );
}
