import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  LeadEvent,
  MAX_TEAMS,
  PALETTE,
  RankShift,
  ScoreDelta,
  Team,
  colorForIndex,
  makeId,
} from "../types";
import { sfx } from "../lib/sound";

const STORAGE_KEY = "tally.teams.v2";
const SOUND_KEY = "tally.sound.v2";
const TITLE_KEY = "tally.title.v1";
const DEFAULT_TITLE = "STANDINGS";
const KICKER_KEY = "tally.kicker.v1";
const DEFAULT_KICKER = "LIVE";

const SEED: Team[] = [
  { id: "seed-1", name: "Neon Vipers", color: PALETTE[0], score: 24, createdAt: 1 },
  { id: "seed-2", name: "Quantum Flux", color: PALETTE[1], score: 21, createdAt: 2 },
  { id: "seed-3", name: "Crimson Circuit", color: PALETTE[2], score: 16, createdAt: 3 },
  { id: "seed-4", name: "Voidwalkers", color: PALETTE[3], score: 12, createdAt: 4 },
  { id: "seed-5", name: "Golden Hour", color: PALETTE[4], score: 8, createdAt: 5 },
];

export function sortTeams(list: Team[]): Team[] {
  return [...list].sort(
    (a, b) => b.score - a.score || a.createdAt - b.createdAt,
  );
}

function rankMapOf(list: Team[]): Map<string, number> {
  const map = new Map<string, number>();
  sortTeams(list)
    .filter((t) => t.score > 0)
    .forEach((t, i) => map.set(t.id, i + 1));
  return map;
}

function leadTeamOf(list: Team[]): Team | null {
  if (list.length === 0) return null;
  const top = sortTeams(list)[0];
  return top.score > 0 ? top : null;
}

function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Team[];
    if (!Array.isArray(parsed)) return SEED;
    const clean = parsed
      .filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.name === "string" &&
          typeof t.score === "number" &&
          Number.isFinite(t.score),
      )
      .map((t) => ({
        id: t.id,
        name: t.name,
        color: typeof t.color === "string" ? t.color : PALETTE[0],
        score: Math.max(0, Math.round(t.score)),
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }));
    return clean.length ? clean : SEED;
  } catch {
    return SEED;
  }
}

interface UndoEntry {
  teamId: string;
  prevScore: number;
}

export function useScoreboard() {
  const [teams, setTeams] = useState<Team[]>(loadTeams);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const [simOn, setSimOn] = useState(false);
  const [title, setTitleState] = useState<string>(() => {
    try {
      const t = localStorage.getItem(TITLE_KEY);
      return t && t.trim() ? t.slice(0, 24) : DEFAULT_TITLE;
    } catch {
      return DEFAULT_TITLE;
    }
  });
  const [kicker, setKickerState] = useState<string>(() => {
    try {
      const k = localStorage.getItem(KICKER_KEY);
      return k && k.trim() ? k.slice(0, 16) : DEFAULT_KICKER;
    } catch {
      return DEFAULT_KICKER;
    }
  });
  const [canUndo, setCanUndo] = useState(false);
  const [deltas, setDeltas] = useState<Record<string, ScoreDelta>>({});
  const [shifts, setShifts] = useState<Record<string, RankShift>>({});
  const [lead, setLead] = useState<LeadEvent | null>(null);

  const teamsRef = useRef(teams);
  teamsRef.current = teams;
  const undoRef = useRef<UndoEntry[]>([]);

  /* ---------------------------------- persist --------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch {
      /* private mode */
    }
  }, [teams]);

  useEffect(() => {
    sfx.enabled = soundOn;
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {
      /* noop */
    }
  }, [soundOn]);

  useEffect(() => {
    try {
      localStorage.setItem(TITLE_KEY, title);
    } catch {
      /* noop */
    }
  }, [title]);

  useEffect(() => {
    try {
      localStorage.setItem(KICKER_KEY, kicker);
    } catch {
      /* noop */
    }
  }, [kicker]);

  /* ------------------------------- transient cues ------------------------------ */
  const scheduleDelta = useCallback((teamId: string, amount: number) => {
    const at = Date.now();
    setDeltas((d) => ({ ...d, [teamId]: { amount, at } }));
    window.setTimeout(() => {
      setDeltas((d) => {
        if (d[teamId]?.at !== at) return d;
        const next = { ...d };
        delete next[teamId];
        return next;
      });
    }, 1500);
  }, []);

  const scheduleShift = useCallback((teamId: string, places: number) => {
    const at = Date.now();
    setShifts((s) => ({ ...s, [teamId]: { places, at } }));
    window.setTimeout(() => {
      setShifts((s) => {
        if (s[teamId]?.at !== at) return s;
        const next = { ...s };
        delete next[teamId];
        return next;
      });
    }, 2100);
  }, []);

  /* ----------------------------------- commit ---------------------------------- */
  const commit = useCallback(
    (
      next: Team[],
      opts: { movedTeamId?: string; sound?: "up" | "down"; celebrate?: boolean } = {},
    ) => {
      const prev = teamsRef.current;
      const prevRanks = rankMapOf(prev);
      const nextRanks = rankMapOf(next);

      if (opts.movedTeamId) {
        const prevRank = prevRanks.get(opts.movedTeamId);
        const nextRank = nextRanks.get(opts.movedTeamId);
        if (prevRank !== undefined && nextRank !== undefined) {
          const shift = prevRank - nextRank;
          if (shift !== 0) scheduleShift(opts.movedTeamId, shift);
        }
      }

      setTeams(next);

      const prevLead = leadTeamOf(prev);
      const nextLead = leadTeamOf(next);

      if (nextLead && prevLead?.id !== nextLead.id && opts.celebrate !== false) {
        const at = Date.now();
        setLead({ teamId: nextLead.id, at });
        window.setTimeout(() => {
          setLead((l) => (l?.at === at ? null : l));
        }, 2800);
        confetti({
          particleCount: 130,
          spread: 85,
          startVelocity: 44,
          scalar: 0.9,
          origin: { x: 0.5, y: 0.22 },
          colors: [nextLead.color, "#ffffff", "#c8f542"],
          disableForReducedMotion: true,
        });
        sfx.lead();
      } else if (opts.sound === "up") {
        sfx.up();
      } else if (opts.sound === "down") {
        sfx.down();
      }
    },
    [scheduleShift],
  );

  /* ---------------------------------- actions ---------------------------------- */
  const addScore = useCallback(
    (teamId: string, amount: number) => {
      const prev = teamsRef.current;
      const team = prev.find((t) => t.id === teamId);
      if (!team || !Number.isFinite(amount)) return;

      const next = prev.map((t) =>
        t.id === teamId
          ? { ...t, score: Math.max(0, t.score + Math.round(amount)) }
          : t,
      );

      undoRef.current.push({ teamId, prevScore: team.score });
      if (undoRef.current.length > 40) undoRef.current.shift();
      setCanUndo(true);

      scheduleDelta(teamId, amount);
      commit(next, {
        movedTeamId: teamId,
        sound: amount >= 0 ? "up" : "down",
      });
    },
    [commit, scheduleDelta],
  );

  const addScoreRef = useRef(addScore);
  addScoreRef.current = addScore;

  const undo = useCallback(() => {
    const entry = undoRef.current.pop();
    setCanUndo(undoRef.current.length > 0);
    if (!entry) return;

    const prev = teamsRef.current;
    const team = prev.find((t) => t.id === entry.teamId);
    if (!team || team.score === entry.prevScore) return;

    const next = prev.map((t) =>
      t.id === entry.teamId ? { ...t, score: entry.prevScore } : t,
    );
    scheduleDelta(entry.teamId, entry.prevScore - team.score);
    commit(next, { movedTeamId: entry.teamId, sound: "down" });
  }, [commit, scheduleDelta]);

  const addTeam = useCallback((name: string): boolean => {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return false;
    const prev = teamsRef.current;
    if (prev.length >= MAX_TEAMS) return false;
    const team: Team = {
      id: makeId(),
      name: clean,
      color: colorForIndex(prev.length),
      score: 0,
      createdAt: Date.now(),
    };
    setTeams([...prev, team]);
    sfx.up();
    return true;
  }, []);

  const removeTeam = useCallback((teamId: string) => {
    const prev = teamsRef.current;
    const next = prev.filter((t) => t.id !== teamId);
    undoRef.current = undoRef.current.filter((u) => u.teamId !== teamId);
    setCanUndo(undoRef.current.length > 0);
    setTeams(next);
    sfx.click();
  }, []);

  const renameTeam = useCallback((teamId: string, name: string) => {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return;
    setTeams(
      teamsRef.current.map((t) => (t.id === teamId ? { ...t, name: clean } : t)),
    );
  }, []);

  const resetScores = useCallback(() => {
    undoRef.current = [];
    setCanUndo(false);
    setShifts({});
    setDeltas({});
    setTeams(teamsRef.current.map((t) => ({ ...t, score: 0 })));
    sfx.down();
  }, []);

  const setTitle = useCallback((value: string) => {
    const clean = value.trim().replace(/\s+/g, " ").slice(0, 24);
    setTitleState(clean || DEFAULT_TITLE);
  }, []);

  const setKicker = useCallback((value: string) => {
    const clean = value.trim().replace(/\s+/g, " ").slice(0, 16);
    setKickerState(clean || DEFAULT_KICKER);
  }, []);

  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);
  const toggleSim = useCallback(() => {
    setSimOn((s) => !s);
    sfx.click();
  }, []);

  /* --------------------------------- simulation -------------------------------- */
  useEffect(() => {
    if (!simOn) return;
    const iv = window.setInterval(() => {
      const list = teamsRef.current;
      if (list.length === 0) return;
      const target = list[Math.floor(Math.random() * list.length)];
      const amounts = [1, 2, 3, 5, 5, 8, 10];
      addScoreRef.current(
        target.id,
        amounts[Math.floor(Math.random() * amounts.length)],
      );
    }, 1000);
    return () => window.clearInterval(iv);
  }, [simOn]);

  /* ---------------------------------- derived ---------------------------------- */
  const sortedTeams = useMemo(() => sortTeams(teams), [teams]);
  const leader =
    sortedTeams.length > 0 && sortedTeams[0].score > 0 ? sortedTeams[0] : null;
  const topScore = leader?.score ?? 0;
  const totalPoints = useMemo(
    () => teams.reduce((sum, t) => sum + t.score, 0),
    [teams],
  );

  return {
    teams: sortedTeams,
    leader,
    topScore,
    totalPoints,
    title,
    kicker,
    deltas,
    shifts,
    lead,
    soundOn,
    simOn,
    canUndo,
    teamCount: teams.length,
    actions: {
      addScore,
      addTeam,
      removeTeam,
      renameTeam,
      resetScores,
      undo,
      setTitle,
      setKicker,
      toggleSound,
      toggleSim,
    },
  };
}
