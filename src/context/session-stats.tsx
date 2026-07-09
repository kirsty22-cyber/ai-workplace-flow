import { createContext, useContext, useState, type ReactNode } from "react";

type Stats = {
  emails: number;
  meetings: number;
  plans: number;
};

type Ctx = Stats & {
  score: number;
  bump: (k: keyof Stats) => void;
};

const SessionStatsContext = createContext<Ctx | null>(null);

export function SessionStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({ emails: 0, meetings: 0, plans: 0 });
  const bump = (k: keyof Stats) => setStats((s) => ({ ...s, [k]: s[k] + 1 }));
  const total = stats.emails + stats.meetings + stats.plans;
  const score = Math.min(100, total * 8);
  return (
    <SessionStatsContext.Provider value={{ ...stats, score, bump }}>
      {children}
    </SessionStatsContext.Provider>
  );
}

export function useSessionStats() {
  const ctx = useContext(SessionStatsContext);
  if (!ctx) throw new Error("useSessionStats must be used within SessionStatsProvider");
  return ctx;
}
