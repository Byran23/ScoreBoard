import { useCallback, useEffect, useState } from "react";
import {
  accentById,
  backgroundById,
  darkenHex,
  hexToRgbTriplet,
  paletteById,
  type Background,
  type Mode,
} from "../lib/themes";
import { processImageFile } from "../lib/background";

const KEY = "tally.theme.v1";

interface Stored {
  accent: string;
  background: string;
  palette: string;
  mode: Mode;
  /** data URL of a user-uploaded image, compressed */
  customImage: string | null;
}

function load(): Stored {
  const prefersLight =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches;
  const fallback: Stored = {
    accent: "volt",
    background: "arena",
    palette: "neon",
    mode: prefersLight ? "light" : "dark",
    customImage: null,
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      accent: typeof p.accent === "string" ? p.accent : fallback.accent,
      background:
        typeof p.background === "string" ? p.background : fallback.background,
      palette: typeof p.palette === "string" ? p.palette : fallback.palette,
      mode: p.mode === "light" || p.mode === "dark" ? p.mode : fallback.mode,
      customImage:
        typeof p.customImage === "string" ? p.customImage : fallback.customImage,
    };
  } catch {
    return fallback;
  }
}

export function useTheme() {
  const [state, setState] = useState<Stored>(load);

  const accent = accentById(state.accent);
  const palette = paletteById(state.palette);

  const customBackground: Background | null = state.customImage
    ? {
        id: "custom",
        name: "Custom",
        image: state.customImage,
        opacity: 0.45,
        swatch: "linear-gradient(135deg,#101014,#23232e)",
      }
    : null;

  const background: Background =
    state.background === "custom" && customBackground
      ? customBackground
      : backgroundById(state.background);

  const mode = state.mode;
  const isLight = mode === "light";

  /* light surfaces need a deeper accent to stay legible */
  const accentColor = isLight ? darkenHex(accent.color, 0.45) : accent.color;

  /* toggle the light scope + drive every `volt` utility and glow */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", isLight);
    root.style.colorScheme = isLight ? "light" : "dark";
    root.style.setProperty("--color-volt", accentColor);
    root.style.setProperty("--accent-rgb", hexToRgbTriplet(accentColor));
    document.body.style.setProperty("--accent", accentColor);
  }, [accentColor, isLight]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — custom image lives for this session only */
    }
  }, [state]);

  const setAccent = useCallback(
    (id: string) => setState((s) => ({ ...s, accent: id })),
    [],
  );
  const setBackground = useCallback(
    (id: string) => setState((s) => ({ ...s, background: id })),
    [],
  );
  const setPalette = useCallback(
    (id: string) => setState((s) => ({ ...s, palette: id })),
    [],
  );
  const setMode = useCallback(
    (m: Mode) => setState((s) => ({ ...s, mode: m })),
    [],
  );
  const toggleMode = useCallback(
    () =>
      setState((s) => ({ ...s, mode: s.mode === "light" ? "dark" : "light" })),
    [],
  );

  /** compress + store an uploaded photo, then activate it */
  const uploadBackground = useCallback(async (file: File) => {
    const dataUrl = await processImageFile(file);
    setState((s) => ({ ...s, customImage: dataUrl, background: "custom" }));
  }, []);

  const removeCustomBackground = useCallback(() => {
    setState((s) => ({
      ...s,
      customImage: null,
      background: s.background === "custom" ? "arena" : s.background,
    }));
  }, []);

  return {
    accent,
    accentColor,
    background,
    palette,
    mode,
    isLight,
    customImage: state.customImage,
    setAccent,
    setBackground,
    setPalette,
    setMode,
    toggleMode,
    uploadBackground,
    removeCustomBackground,
  };
}
