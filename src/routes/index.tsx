import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  MessageCircle,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSessionStats } from "@/context/session-stats";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const features = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    description: "Generate professional workplace emails in seconds.",
    cta: "Open Generator",
  },
  {
    to: "/chat" as const,
    icon: MessageCircle,
    title: "AI Chatbot",
    description: "Interactive assistant for drafts, ideas, and quick answers.",
    cta: "Start Chatting",
  },
  {
    to: "/planner" as const,
    icon: CalendarClock,
    title: "AI Task Planner",
    description: "Generate organised daily or weekly work schedules.",
    cta: "Generate Schedule",
  },
];

function Dashboard() {
  const stats = useSessionStats();
  const cards = [
    { label: "Emails Generated", value: stats.emails, icon: Mail },
    { label: "Chat Messages", value: stats.chats, icon: MessageCircle },
    { label: "Plans Created", value: stats.plans, icon: CalendarClock },
    { label: "Productivity Score", value: `${stats.score}%`, icon: TrendingUp },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary-glow p-6 text-primary-foreground shadow-elegant sm:p-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              AI Workplace Productivity
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Do more meaningful work, faster.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
              Draft polished emails, summarize meetings, and plan your day — powered by AI. No
              login, no history, no stored data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="lg" className="rounded-full">
                <Link to="/email">
                  Draft an Email <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              >
                <Link to="/prompts">Browse Prompts</Link>
              </Button>
            </div>
          </div>
          <div className="hidden shrink-0 md:block">
            <div className="grid h-32 w-32 place-items-center rounded-3xl bg-white/10 backdrop-blur">
              <Sparkles className="h-16 w-16 text-white/90" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Get started</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.to}
              className="group relative overflow-hidden border-border/70 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full rounded-full">
                  <Link to={f.to}>
                    {f.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Productivity Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{c.value}</p>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-4 shadow-soft">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Session productivity</p>
              <p className="text-sm text-muted-foreground">{stats.score}%</p>
            </div>
            <Progress value={stats.score} />
            <p className="mt-3 text-xs text-muted-foreground">
              Session counters reset when you refresh — nothing is stored.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border bg-secondary/60 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">Privacy-first, by design</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This app doesn't require an account and doesn't save any AI outputs or personal data.
              Everything you generate lives only in this browser session.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
