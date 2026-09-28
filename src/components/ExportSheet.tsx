import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  ImageDown,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";

export interface ExportResult {
  kind: "png" | "csv";
  url: string;
  filename: string;
  blob: Blob;
  teamCount: number;
  text?: string;
}

/**
 * Bottom-sheet export result. Guarantees a working path even when the
 * browser/sandbox blocks automatic downloads: direct link, open-in-tab,
 * or copy to clipboard.
 */
export default function ExportSheet({
  result,
  onClose,
}: {
  result: ExportResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(result.url), [result.url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      if (result.kind === "png") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": result.blob }),
        ]);
      } else {
        await navigator.clipboard.writeText(result.text ?? "");
      }
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyFailed(true);
    }
  };

  const openTab = () => {
    window.open(result.url, "_blank", "noopener");
  };

  const isPng = result.kind === "png";
  const KindIcon = isPng ? ImageDown : FileSpreadsheet;
  const previewLines = (result.text ?? "").split("\n");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Export result"
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" />

      <motion.div
        initial={{ y: 48, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0c12] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:rounded-3xl"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-volt/15 text-volt">
              <KindIcon size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold tracking-wide md:text-sm">
                {isPng ? "STANDINGS IMAGE READY" : "STANDINGS CSV READY"}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {result.filename} · {result.teamCount} teams
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export"
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-all hover:-translate-y-px hover:text-white active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        {/* preview */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6">
          {isPng ? (
            <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-white/10 bg-black/40">
              <img
                src={result.url}
                alt="Standings export preview"
                className="block h-auto w-full"
              />
            </div>
          ) : (
            <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-white/60">
              {previewLines.slice(0, 14).join("\n")}
              {previewLines.length > 14 &&
                `\n… ${previewLines.length - 14} more rows`}
            </pre>
          )}
        </div>

        {/* actions */}
        <div className="border-t border-white/10 px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={result.url}
              download={result.filename}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-volt px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] text-black transition-all hover:-translate-y-px active:scale-95"
            >
              <Download size={13} />
              DOWNLOAD {result.kind.toUpperCase()}
            </a>
            <button
              type="button"
              onClick={openTab}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] text-white/70 transition-all hover:-translate-y-px hover:text-white active:scale-95"
            >
              <ExternalLink size={13} />
              OPEN IN TAB
            </button>
            <button
              type="button"
              onClick={() => void copy()}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] transition-all hover:-translate-y-px active:scale-95",
                copied
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white",
              )}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "COPIED" : isPng ? "COPY IMAGE" : "COPY TEXT"}
            </button>
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-white/30">
            {copyFailed
              ? "Clipboard is blocked — open in a new tab and save from there."
              : "Download blocked by your browser? Open in a new tab, or copy and paste anywhere."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
