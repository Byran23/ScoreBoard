import type { Background } from "../lib/themes";

/**
 * Shared themed backdrop: optional photo layer, CSS pattern layer,
 * accent glow and film grain. Adapts for light mode.
 */
export default function Backdrop({
  background,
  isLight = false,
  fixed = true,
  glow = "rgba(var(--accent-rgb), 0.13)",
}: {
  background: Background;
  isLight?: boolean;
  fixed?: boolean;
  glow?: string;
}) {
  const imgOpacity = background.opacity ?? 0.45;

  return (
    <div
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 -z-10`}
    >
      {background.image && (
        <img
          src={background.image}
          alt=""
          className="h-full w-full object-cover"
          style={{
            opacity: isLight ? imgOpacity * 0.55 : imgOpacity,
            filter: isLight ? "brightness(1.25) saturate(0.85)" : undefined,
          }}
        />
      )}

      {background.css && (
        <div
          className="absolute inset-0"
          style={{
            background: background.css,
            backgroundSize: background.id === "grid" ? "44px 44px" : undefined,
            opacity: isLight ? 0.55 : 1,
          }}
        />
      )}

      {/* light readability mask — kept subtle so the wallpaper stays visible */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/10 to-ink/55"
        style={{ opacity: isLight ? 0.75 : 1 }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(85% 45% at 50% -6%, ${glow}, transparent 65%)`,
        }}
      />

      <div
        className="noise absolute inset-0"
        style={{ opacity: "var(--grain-opacity)" }}
      />
    </div>
  );
}
