import { useCallback, useEffect, useState } from "react";
import {
  accentById,
  backgroundById,
  hexToRgbTriplet,
  paletteById,
  type Background,
} from "../lib/themes";
import { processImageFile } from "../lib/background";

const KEY = "tally.theme.v1";

interface Stored {
  accent: string;
  background: string;
  palette: string;
  /** data URL of a user-uploaded image, compressed */
  customImage: string | null;
}

function load(): Stored {
  const fallback: Stored = {
    accent: "volt",
    background: "arena",
    palette: "neon",
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

  /* drive every `volt` utility + glow via CSS variables */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-volt", accent.color);
    root.style.setProperty("--accent-rgb", hexToRgbTriplet(accent.color));
    document.body.style.setProperty("--accent", accent.color);
  }, [accent.color]);

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
    background,
    palette,
    customImage: state.customImage,
    setAccent,
    setBackground,
    setPalette,
    uploadBackground,
    removeCustomBackground,
  };
}
