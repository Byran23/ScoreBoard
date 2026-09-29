import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
  color: string;
  onSubmit: (amount: number) => void;
  /** slightly larger target for presentation mode */
  large?: boolean;
}

/**
 * Free-form points entry — type any number (negatives allowed) and press
 * Enter or the check to apply it in one go instead of repeat-clicking chips.
 */
export default function ScoreInput({ color, onSubmit, large = false }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const parsed = Math.round(Number(value));
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed !== 0;

  const apply = () => {
    if (!valid) return;
    onSubmit(parsed);
    setValue("");
  };

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-lg border transition-all duration-150",
        large ? "h-9" : "h-[34px]",
      )}
      style={{
        borderColor: focused ? `${color}80` : "rgba(255,255,255,0.1)",
        background: focused ? `${color}12` : "rgba(255,255,255,0.05)",
        boxShadow: focused ? `0 0 0 3px ${color}1f` : undefined,
      }}
    >
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 6))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
          if (e.key === "Escape") setValue("");
        }}
        placeholder="±"
        aria-label="Custom points amount"
        className={cn(
          "h-full bg-transparent text-center font-mono font-bold tabular-nums text-white outline-none placeholder:text-white/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          large ? "w-14 text-xs" : "w-12 text-[11px]",
        )}
      />
      <button
        type="button"
        onClick={apply}
        disabled={!valid}
        aria-label="Apply custom points"
        title="Apply points (Enter)"
        className={cn(
          "flex h-full cursor-pointer items-center justify-center border-l transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-25",
          large ? "w-8" : "w-7",
        )}
        style={{
          borderColor: "rgba(255,255,255,0.1)",
          background: valid ? color : "transparent",
          color: valid ? "#06070b" : "rgba(var(--fg-rgb), 0.5)",
        }}
      >
        <Check size={13} strokeWidth={3} />
      </button>
    </div>
  );
}
