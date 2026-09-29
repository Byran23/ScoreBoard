import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  FileSpreadsheet,
  Flag,
  Ghost,
  ImageDown,
  Maximize2,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Moon,
  Search,
  Sparkles,
  Sun,
  Trophy,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import AddTeam from "./components/AddTeam";
import AnimatedScore from "./components/AnimatedScore";
import Backdrop from "./components/Backdrop";
import ThemePanel from "./components/ThemePanel";
import { useTheme } from "./hooks/useTheme";
import ExportSheet, { type ExportResult } from "./components/ExportSheet";
import MaxView from "./components/MaxView";
import Podium from "./components/Podium";
import TeamRow from "./components/TeamRow";
import { useScoreboard } from "./hooks/useScoreboard";
import {
  fileStamp,
  makeCsvText,
  renderStandingsPng,
  triggerDownload,
} from "./lib/download";
import { cn } from "./utils/cn";

/* ------------------------------- header pieces ------------------------------- */

function HeaderButton({
  onClick,
  label,
  active,
  disabled,
  children,
  wide,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  wide?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={wide ? label : undefined}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.18em] transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0",
        active
          ? "border-volt bg-volt text-black shadow-[0_10px_30px_-10px_rgba(200,245,66,0.6)]"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
      {wide ?? <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}

/* --------------------------------- lead banner -------------------------------- */

function LeadBanner({
  lead,
}: {
  lead: { at: number; name: string; color: string } | null;
}) {
  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          key={lead.at}
          initial={{ opacity: 0, y: -28, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="fixed left-1/2 top-20 z-50 flex items-center gap-2.5 rounded-full border bg-ink/85 py-2 pl-3 pr-5 backdrop-blur-xl"
          style={{
            borderColor: `${lead.color}59`,
            boxShadow: `0 18px 60px -18px ${lead.color}66, 0 0 0 4px ${lead.color}14`,
          }}
        >
          <span
            className="flex size-7 items-center justify-center rounded-full"
            style={{ background: `${lead.color}1f`, color: lead.color }}
          >
            <Crown size={14} strokeWidth={2.5} />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            <span className="font-bold" style={{ color: lead.color }}>
              {lead.name}
            </span>{" "}
            takes the lead
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------ app ------------------------------------ */

function titleFont(len: number): string {
  if (len <= 9) return "clamp(2.9rem, 10vw, 6.25rem)";
  if (len <= 14) return "clamp(2.1rem, 7.5vw, 4.5rem)";
  return "clamp(1.45rem, 5.5vw, 3rem)";
}

export default function App() {
  const theme = useTheme();
  const sb = useScoreboard(theme.palette.colors);
  const [themeOpen, setThemeOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [ended, setEnded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(sb.title);
  const [editingKicker, setEditingKicker] = useState(false);
  const [kickerDraft, setKickerDraft] = useState(sb.kicker);

  const exitMax = useCallback(() => {
    setMaximized(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setMaximized(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const enterMax = () => {
    setMaximized(true);
    try {
      void document.documentElement.requestFullscreen();
    } catch {
      /* fullscreen unavailable */
    }
  };

  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [query, setQuery] = useState("");

  const endBoard = useCallback(() => {
    if (sb.simOn) sb.actions.toggleSim();
    setEnded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb.simOn, sb.actions]);

  const handleRematch = useCallback(() => {
    sb.actions.resetScores();
    setEnded(false);
  }, [sb.actions]);

  const startTitleEdit = () => {
    setTitleDraft(sb.title);
    setEditingTitle(true);
  };

  const commitTitle = () => {
    sb.actions.setTitle(titleDraft);
    setEditingTitle(false);
  };

  const startKickerEdit = () => {
    setKickerDraft(sb.kicker);
    setEditingKicker(true);
  };

  const commitKicker = () => {
    sb.actions.setKicker(kickerDraft);
    setEditingKicker(false);
  };

  const handlePng = useCallback(async () => {
    const blob = await renderStandingsPng(sb.teams, sb.title, sb.kicker);
    if (!blob) return;
    const filename = `tally-board-${fileStamp()}.png`;
    triggerDownload(blob, filename);
    setExportResult({
      kind: "png",
      url: URL.createObjectURL(blob),
      filename,
      blob,
      teamCount: sb.teams.length,
    });
  }, [sb.teams, sb.title, sb.kicker]);

  const handleCsv = useCallback(() => {
    const raw = makeCsvText(sb.teams);
    const blob = new Blob(["\ufeff" + raw], { type: "text/csv;charset=utf-8" });
    const filename = `tally-board-${fileStamp()}.csv`;
    triggerDownload(blob, filename);
    setExportResult({
      kind: "csv",
      url: URL.createObjectURL(blob),
      filename,
      blob,
      text: raw,
      teamCount: sb.teams.length,
    });
  }, [sb.teams]);

  const q = query.trim().toLowerCase();
  const visibleTeams = sb.ranked.filter(
    ({ team }) => !q || team.name.toLowerCase().includes(q),
  );
  const scoredRows = visibleTeams.filter((r) => r.rank !== null);
  const unrankedRows = visibleTeams.filter((r) => r.rank === null);

  useEffect(() => {
    if (!confirmReset) return;
    const t = window.setTimeout(() => setConfirmReset(false), 2400);
    return () => window.clearTimeout(t);
  }, [confirmReset]);

  const leadInfo = (() => {
    const event = sb.lead;
    if (!event) return null;
    const team = sb.teams.find((t) => t.id === event.teamId);
    if (!team) return null;
    return { at: event.at, name: team.name, color: team.color };
  })();

  return (
    <div className="relative min-h-screen">
      {/* --------------------------------- backdrop --------------------------------- */}
      <Backdrop background={theme.background} isLight={theme.isLight} />

      <LeadBanner lead={leadInfo} />

      {/* ---------------------------------- header ---------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-8 xl:px-12">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-volt text-black shadow-[0_8px_24px_-8px_rgba(200,245,66,0.7)]">
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-sm font-bold tracking-wide">
              TALLY<span className="text-white/35">/BOARD</span>
            </span>
            <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-white/40 sm:flex">
              <span className="size-1.5 animate-pulse rounded-full bg-volt" />
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <HeaderButton
              label={sb.simOn ? "PAUSE SIM" : "SIMULATE"}
              active={sb.simOn}
              onClick={sb.actions.toggleSim}
            >
              {sb.simOn ? <Pause size={13} /> : <Play size={13} />}
            </HeaderButton>
            <HeaderButton
              label="UNDO"
              disabled={!sb.canUndo}
              onClick={sb.actions.undo}
            >
              <Undo2 size={13} />
            </HeaderButton>
            <HeaderButton
              label="RESET"
              onClick={() => {
                if (confirmReset) {
                  sb.actions.resetScores();
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                }
              }}
              wide={
                confirmReset ? (
                  <span className="hidden text-rose-300 lg:inline">SURE?</span>
                ) : (
                  <span className="hidden lg:inline">RESET</span>
                )
              }
            >
              <RotateCcw
                size={13}
                className={cn(confirmReset && "text-rose-300")}
              />
            </HeaderButton>
            <HeaderButton
              label="SFX"
              active={sb.soundOn}
              onClick={sb.actions.toggleSound}
              wide={<span className="hidden lg:inline">SFX</span>}
            >
              {sb.soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </HeaderButton>
            <HeaderButton
              label={theme.isLight ? "LIGHT" : "DARK"}
              onClick={theme.toggleMode}
              wide={
                <span className="hidden lg:inline">
                  {theme.isLight ? "LIGHT" : "DARK"}
                </span>
              }
            >
              {theme.isLight ? <Sun size={13} /> : <Moon size={13} />}
            </HeaderButton>
            <HeaderButton
              label="THEME"
              active={themeOpen}
              onClick={() => setThemeOpen(true)}
            >
              <Sparkles size={13} />
            </HeaderButton>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
        {/* ---------------------------------- hero ---------------------------------- */}
        <section className="pb-8 pt-12 md:pt-16">
          <div className="flex items-center gap-3">
            <span className="size-2 animate-pulse rounded-full bg-volt" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45 md:text-[11px]">
              Live session — click a title line below to rename it
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <h1 className="font-display font-extrabold leading-[0.94]">
              {editingKicker ? (
                <input
                  autoFocus
                  value={kickerDraft}
                  maxLength={16}
                  onChange={(e) => setKickerDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitKicker();
                    if (e.key === "Escape") setEditingKicker(false);
                  }}
                  onBlur={commitKicker}
                  placeholder="LIVE"
                  aria-label="Kicker text"
                  className="w-full min-w-0 max-w-lg bg-transparent font-display font-extrabold uppercase text-volt caret-white outline-none placeholder:text-white/20"
                  style={{
                    fontSize: titleFont(Math.max(4, kickerDraft.length)),
                  }}
                />
              ) : (
                <span className="group/kicker relative inline-block">
                  <button
                    type="button"
                    onClick={startKickerEdit}
                    aria-label="Edit kicker text"
                    title="Click to edit"
                    className="cursor-text text-left uppercase leading-[0.94] text-volt transition-opacity hover:opacity-70"
                    style={{ fontSize: titleFont(sb.kicker.length) }}
                  >
                    {sb.kicker.toUpperCase()}
                  </button>
                  <Pencil
                    size={15}
                    className="pointer-events-none absolute -right-7 top-2 hidden text-white/0 transition-colors duration-200 group-hover/kicker:text-volt/70 md:block"
                  />
                </span>
              )}
              <br />
              {editingTitle ? (
                <input
                  autoFocus
                  value={titleDraft}
                  maxLength={24}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  onBlur={commitTitle}
                  placeholder="COMPETITION TITLE"
                  aria-label="Competition title"
                  className="w-full min-w-0 max-w-lg bg-transparent font-display font-extrabold uppercase text-white caret-volt outline-none placeholder:text-white/20"
                  style={{
                    fontSize: titleFont(Math.max(4, titleDraft.length)),
                  }}
                />
              ) : (
                <span className="group/title relative inline-block">
                  <button
                    type="button"
                    onClick={startTitleEdit}
                    aria-label="Rename competition"
                    title="Click to rename competition"
                    className="text-outline cursor-text text-left uppercase leading-[0.94] transition-opacity hover:opacity-70"
                    style={{ fontSize: titleFont(sb.title.length) }}
                  >
                    {sb.title.toUpperCase()}
                  </button>
                  <Pencil
                    size={15}
                    className="pointer-events-none absolute -right-7 top-2 hidden text-white/0 transition-colors duration-200 group-hover/title:text-white/60 md:block"
                  />
                </span>
              )}
            </h1>
            <p className="max-w-xs pb-2 text-sm leading-relaxed text-white/45 lg:max-w-sm lg:text-base">
              Tap the quick chips or type an exact amount in the ± field. The
              moment totals change, the board reshuffles — leaders get crowned
              mid-play.
            </p>
          </div>

          {/* stats strip */}
          <div className="mt-10 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10">
            <div className="px-4 py-4 md:px-6">
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                <Trophy size={11} /> Leader
              </p>
              <p
                className="mt-2 truncate text-sm font-bold uppercase tracking-wide md:text-base"
                style={{ color: sb.leader?.color ?? "rgba(var(--fg-rgb), 0.45)" }}
              >
                {sb.leader
                  ? sb.leaderTied
                    ? `Tied — ${sb.leader.name}`
                    : sb.leader.name
                  : "No leader yet"}
              </p>
            </div>
            <div className="px-4 py-4 md:px-6">
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                <Zap size={11} /> Points in play
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums md:text-3xl">
                <AnimatedScore value={sb.totalPoints} />
              </p>
            </div>
            <div className="px-4 py-4 md:px-6">
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                <Users size={11} /> Teams
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums md:text-3xl">
                {String(sb.teamCount).padStart(2, "0")}
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------- board ---------------------------------- */}
        <section className="pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
              Leaderboard — auto-sorted
            </p>

            <div className="relative order-last w-full sm:order-none sm:w-auto sm:max-w-[220px] sm:flex-1">
              <Search
                size={12}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team"
                aria-label="Search team"
                className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-8 pr-7 font-mono text-[10px] uppercase tracking-[0.15em] text-white outline-none transition-colors placeholder:text-white/25 focus:border-volt/40 focus:bg-white/[0.07]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-white/40 transition-colors hover:text-white"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePng}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.18em] text-white/60 transition-all duration-150 hover:-translate-y-px hover:border-white/25 hover:text-white active:translate-y-0 active:scale-95"
              >
                <ImageDown size={11} />
                PNG
              </button>
              <button
                type="button"
                onClick={handleCsv}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.18em] text-white/60 transition-all duration-150 hover:-translate-y-px hover:border-white/25 hover:text-white active:translate-y-0 active:scale-95"
              >
                <FileSpreadsheet size={11} />
                CSV
              </button>
              <button
                type="button"
                onClick={enterMax}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-volt/50 bg-volt/10 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.18em] text-volt transition-all duration-150 hover:-translate-y-px hover:bg-volt/20 active:translate-y-0 active:scale-95"
              >
                <Maximize2 size={11} />
                MAXIMIZE
              </button>
              <button
                type="button"
                onClick={endBoard}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.18em] text-amber-300 transition-all duration-150 hover:-translate-y-px hover:bg-amber-400/20 active:translate-y-0 active:scale-95"
              >
                <Flag size={11} />
                END
              </button>
            </div>
          </div>

          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {scoredRows.map(({ team, rank, tied }) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  rank={rank}
                  tied={tied}
                  isLeader={rank === 1 && team.score > 0}
                  topScore={sb.topScore}
                  delta={sb.deltas[team.id]}
                  shift={sb.shifts[team.id]}
                  onAdd={(amount) => sb.actions.addScore(team.id, amount)}
                  onRename={(name) => sb.actions.renameTeam(team.id, name)}
                  onRemove={() => sb.actions.removeTeam(team.id)}
                />
              ))}
            </AnimatePresence>

            {unrankedRows.length > 0 && (
              <>
                {scoredRows.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
                      Unranked — score to join
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {unrankedRows.map(({ team }) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      rank={null}
                      isLeader={false}
                      unranked
                      topScore={sb.topScore}
                      delta={sb.deltas[team.id]}
                      shift={sb.shifts[team.id]}
                      onAdd={(amount) => sb.actions.addScore(team.id, amount)}
                      onRename={(name) => sb.actions.renameTeam(team.id, name)}
                      onRemove={() => sb.actions.removeTeam(team.id)}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}

            {sb.teams.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 py-14 text-center">
                <Ghost size={22} className="text-white/30" />
                <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  No teams on the board
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Add a squad below to start the tally
                </p>
              </div>
            )}

            {sb.teams.length > 0 && visibleTeams.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 py-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                No teams match “{query.trim()}”
              </div>
            )}
          </motion.div>

          <AddTeam teamCount={sb.teamCount} onAdd={sb.actions.addTeam} />
        </section>
      </main>

      {/* --------------------------- presentation mode ---------------------------- */}
      <AnimatePresence>
        {maximized && (
          <MaxView
            teams={sb.teams}
            title={sb.title}
            background={theme.background}
            isLight={theme.isLight}
            totalPoints={sb.totalPoints}
            topScore={sb.topScore}
            deltas={sb.deltas}
            onClose={exitMax}
            onPng={handlePng}
            onCsv={handleCsv}
            onAdd={sb.actions.addScore}
            onEnd={endBoard}
          />
        )}
      </AnimatePresence>

      {/* ------------------------------ end ceremony ------------------------------ */}
      <AnimatePresence>
        {ended && (
          <Podium
            teams={sb.teams}
            title={sb.title}
            background={theme.background}
            isLight={theme.isLight}
            totalPoints={sb.totalPoints}
            onClose={() => setEnded(false)}
            onPng={() => void handlePng()}
            onCsv={handleCsv}
            onRematch={handleRematch}
          />
        )}
      </AnimatePresence>

      {/* ------------------------------ theme panel ------------------------------- */}
      <AnimatePresence>
        {themeOpen && (
          <ThemePanel
            accent={theme.accent}
            background={theme.background}
            palette={theme.palette}
            customImage={theme.customImage}
            mode={theme.mode}
            boardOpacity={theme.boardOpacity}
            onBoardOpacity={theme.setBoardOpacity}
            onMode={theme.setMode}
            onAccent={theme.setAccent}
            onBackground={theme.setBackground}
            onPalette={theme.setPalette}
            onUpload={theme.uploadBackground}
            onRemoveCustom={theme.removeCustomBackground}
            onApplyPaletteToTeams={sb.actions.recolorTeams}
            onClose={() => setThemeOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ------------------------------ export sheet ------------------------------ */}
      <AnimatePresence>
        {exportResult && (
          <ExportSheet
            result={exportResult}
            onClose={() => setExportResult(null)}
          />
        )}
      </AnimatePresence>

      {/* --------------------------------- marquee ---------------------------------- */}
      <footer className="mt-14 border-t border-white/10">
        <div className="overflow-hidden py-3.5">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((half) => (
              <span
                key={half}
                aria-hidden={half === 1}
                className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.4em] text-white/25"
              >
                {Array.from({ length: 4 })
                  .map(
                    () =>
                      "Live ranking — scores sort themselves — every point shifts the board — crown the leaders — ",
                  )
                  .join("")}
              </span>
            ))}
          </div>
        </div>
        <p className="border-t border-white/5 py-4 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
          Tally/Board — scores persist in this browser
        </p>
      </footer>
    </div>
  );
}
