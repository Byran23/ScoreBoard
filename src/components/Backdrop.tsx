import type { Background } from "../lib/themes";

/**
 * Shared themed backdrop: optional photo layer, CSS pattern layer,
 * accent glow and film grain.
 */
export default function Backdrop({
  background,
  fixed = true,
  glow = "rgba(var(--accent-rgb), 0.13)",
}: {
  background: Background;
  fixed?: boolean;
  glow?: string;
}) {
  return (
    <div
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 -z-10`}
    >
      {background.image && (
        <img
          src={background.image}
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: background.opacity ?? 0.45 }}
        />
      )}

      {background.css && (
        <div
          className="absolute inset-0"
          style={{
            background: background.css,
            backgroundSize: background.id === "grid" ? "44px 44px" : undefined,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/45 to-ink" />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(85% 45% at 50% -6%, ${glow}, transparent 65%)`,
        }}
      />

      <div className="noise absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
