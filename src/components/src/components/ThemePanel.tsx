import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Contrast,
  Image,
  Loader2,
  Moon,
  Palette as PaletteIcon,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import {
  ACCENTS,
  BACKGROUNDS,
  PALETTES,
  type Accent,
  type Background,
  type Mode,
  type Palette,
} from "../lib/themes";
import { cn } from "../utils/cn";

interface Props {
  accent: Accent;
  background: Background;
  palette: Palette;
  customImage: string | null;
  mode: Mode;
  boardOpacity: number;
  onBoardOpacity: (v: number) => void;
  onMode: (m: Mode) => void;
  onAccent: (id: string) => void;
  onBackground: (id: string) => void;
  onPalette: (id: string) => void;
  onUpload: (file: File) => Promise<void>;
  onRemoveCustom: () => void;
  onApplyPaletteToTeams: () => void;
  onClose: () => void;
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
      {icon}
      {children}
    </p>
  );
}

export default function ThemePanel({
  accent,
  background,
  palette,
  customImage,
  mode,
  boardOpacity,
  onBoardOpacity,
  onMode,
  onAccent,
  onBackground,
  onPalette,
  onUpload,
  onRemoveCustom,
  onApplyPaletteToTeams,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setProcessing(true);
    try {
      await onUpload(file);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not use that image",
      );
    } finally {
      setProcessing(false);
    }
  };

  const customActive = background.id === "custom";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[88] flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-label="Appearance settings"
    >
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />

      <motion.aside
        initial={{ x: 380, opacity: 0.6 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 380, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-panel"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-volt/15 text-volt">
              <Sparkles size={15} />
            </span>
            <div>
              <p className="font-display text-xs font-bold tracking-wide">
                APPEARANCE
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                Theme · background · palette
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close appearance settings"
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-all hover:-translate-y-px hover:text-white active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* mode */}
          <SectionLabel icon={<Sun size={11} />}>Appearance mode</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "dark", name: "Dark", icon: <Moon size={14} /> },
                { id: "light", name: "Light", icon: <Sun size={14} /> },
              ] as const
            ).map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMode(m.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 font-mono text-[10px] font-bold tracking-[0.18em] transition-all duration-150 hover:-translate-y-px active:scale-[0.98]",
                    active
                      ? "border-volt/60 bg-volt/12 text-volt"
                      : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white/80",
                  )}
                >
                  {m.icon}
                  {m.name.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* accent */}
          <div className="mt-7" />
          <SectionLabel icon={<Sparkles size={11} />}>Accent theme</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((a) => {
              const active = a.id === accent.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onAccent(a.id)}
                  title={a.name}
                  className={cn(
                    "group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all duration-150 hover:-translate-y-px active:scale-95",
                    active
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20",
                  )}
                >
                  <span
                    className="flex size-7 items-center justify-center rounded-full"
                    style={{
                      background: a.color,
                      boxShadow: `0 6px 18px -6px ${a.color}`,
                    }}
                  >
                    {active && (
                      <Check size={13} strokeWidth={3} className="text-black" />
                    )}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/45">
                    {a.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* background */}
          <div className="mt-7">
            <SectionLabel icon={<Image size={11} />}>Background</SectionLabel>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void handleFile(file);
              }}
            />

            <div className="grid grid-cols-3 gap-2">
              {/* custom upload tile */}
              {customImage ? (
                <div
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-150 hover:-translate-y-px",
                    customActive
                      ? "border-volt/60 ring-2 ring-volt/25"
                      : "border-white/10 hover:border-white/25",
                  )}
                  onClick={() => onBackground("custom")}
                  role="button"
                  aria-label="Use your uploaded background"
                >
                  <span
                    className="relative flex h-14 w-full items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: `url(${customImage})` }}
                  >
                    {customActive && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-volt text-black">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="block bg-white/[0.04] py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.15em] text-white/50">
                    Custom
                  </span>
                  <button
                    type="button"
                    aria-label="Remove uploaded background"
                    title="Remove uploaded image"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustom();
                    }}
                    className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/70 p-1 text-white/60 opacity-0 transition-all hover:text-white group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={processing}
                  className="cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/20 transition-all duration-150 hover:-translate-y-px hover:border-volt/50 active:scale-95 disabled:cursor-wait"
                >
                  <span className="flex h-14 w-full flex-col items-center justify-center gap-1 text-white/40">
                    {processing ? (
                      <Loader2 size={15} className="animate-spin text-volt" />
                    ) : (
                      <Upload size={15} />
                    )}
                    <span className="font-mono text-[7px] uppercase tracking-[0.15em]">
                      {processing ? "Shrinking" : "Upload"}
                    </span>
                  </span>
                  <span className="block bg-white/[0.04] py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.15em] text-white/50">
                    Your image
                  </span>
                </button>
              )}

              {/* presets */}
              {BACKGROUNDS.map((b) => {
                const active = b.id === background.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBackground(b.id)}
                    className={cn(
                      "group cursor-pointer overflow-hidden rounded-xl border transition-all duration-150 hover:-translate-y-px active:scale-95",
                      active
                        ? "border-volt/60 ring-2 ring-volt/25"
                        : "border-white/10 hover:border-white/25",
                    )}
                  >
                    <span
                      className="relative flex h-14 w-full items-center justify-center bg-cover bg-center"
                      style={
                        b.image
                          ? { backgroundImage: `url(${b.image})` }
                          : { background: b.swatch }
                      }
                    >
                      {active && (
                        <span className="flex size-6 items-center justify-center rounded-full bg-volt text-black">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="block bg-white/[0.04] py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.15em] text-white/50">
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {uploadError && (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-rose-300">
                {uploadError}
              </p>
            )}
            <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-white/25">
              Uploads are compressed and stored in this browser only.
            </p>
          </div>

          {/* board opacity */}
          <div className="mt-7">
            <SectionLabel icon={<Contrast size={11} />}>
              Leaderboard opacity
            </SectionLabel>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  Glass
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-volt">
                  {Math.round(boardOpacity * 100)}%
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  Solid
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(boardOpacity * 100)}
                onChange={(e) => onBoardOpacity(Number(e.target.value) / 100)}
                aria-label="Leaderboard opacity"
                className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-volt outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-volt [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-volt [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(var(--accent-rgb),0.6)]"
              />

              <div className="mt-3 flex gap-1.5">
                {[
                  { label: "GLASS", v: 0.2 },
                  { label: "BALANCED", v: 0.55 },
                  { label: "SOLID", v: 0.92 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onBoardOpacity(p.v)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg border py-1.5 font-mono text-[8px] font-bold tracking-[0.15em] transition-all hover:-translate-y-px active:scale-95",
                      Math.abs(boardOpacity - p.v) < 0.03
                        ? "border-volt/50 bg-volt/12 text-volt"
                        : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/80",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-white/25">
              Lower values let the wallpaper show through the rows.
            </p>
          </div>

          {/* palette */}
          <div className="mt-7">
            <SectionLabel icon={<PaletteIcon size={11} />}>
              Team palette
            </SectionLabel>
            <div className="flex flex-col gap-2">
              {PALETTES.map((p) => {
                const active = p.id === palette.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPalette(p.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150 hover:-translate-y-px active:scale-[0.98]",
                      active
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20",
                    )}
                  >
                    <span className="flex -space-x-1.5">
                      {p.colors.slice(0, 6).map((c) => (
                        <span
                          key={c}
                          className="size-4 rounded-full border border-black/40"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span className="flex-1 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                      {p.name}
                    </span>
                    {active && <Check size={13} className="text-volt" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onApplyPaletteToTeams}
              className="mt-3 w-full cursor-pointer rounded-xl border border-volt/45 bg-volt/10 py-2.5 font-mono text-[10px] font-bold tracking-[0.18em] text-volt transition-all hover:-translate-y-px hover:bg-volt/20 active:scale-[0.98]"
            >
              RECOLOR EXISTING TEAMS
            </button>
            <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-white/25">
              New teams always use the selected palette.
            </p>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
