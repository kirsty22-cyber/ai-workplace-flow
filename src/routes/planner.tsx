import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarClock,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  TrendingUp,
  Wand2,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";
import { useSessionStats } from "@/context/session-stats";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkAI" },
      {
        name: "description",
        content:
          "Generate an efficient daily or weekly work schedule that prioritises the right tasks.",
      },
    ],
  }),
  component: PlannerPage,
});

type Block = { time: string; task: string; notes: string | null };
type Plan = {
  morning: Block[];
  afternoon: Block[];
  evening: Block[];
  priorityRanking: string[];
  estimatedCompletion: string;
  productivityTips: string[];
};

function PlannerPage() {
  const { bump } = useSessionStats();
  const [tasks, setTasks] = useState("");
  const [workingHours, setWorkingHours] = useState("9:00 AM - 5:00 PM");
  const [priority, setPriority] = useState("High");
  const [deadline, setDeadline] = useState("");
  const [planningType, setPlanningType] = useState<"Daily" | "Weekly">("Daily");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!tasks.trim()) {
      toast.error("Add at least one task to plan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tasks, workingHours, priority, deadline, planningType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(body.error ?? "Something went wrong.");
      }
      const data = (await res.json()) as { plan: Plan };
      setPlan(data.plan);
      bump("plans");
      toast.success("Plan generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const asMarkdown = (p: Plan) => {
    const block = (title: string, items: Block[]) =>
      items.length
        ? [`## ${title}`, ...items.map((b) => `- **${b.time}** — ${b.task}${b.notes ? ` _(${b.notes})_` : ""}`), ""]
        : [];
    return [
      `# ${planningType} Plan`,
      ``,
      ...block("Morning", p.morning),
      ...block("Afternoon", p.afternoon),
      ...block("Evening", p.evening),
      `## Priority Ranking`,
      ...(p.priorityRanking.length ? p.priorityRanking.map((r, i) => `${i + 1}. ${r}`) : ["-"]),
      ``,
      `## Estimated Completion`,
      p.estimatedCompletion || "-",
      ``,
      `## Productivity Tips`,
      ...(p.productivityTips.length ? p.productivityTips.map((t) => `- ${t}`) : ["-"]),
    ].join("\n");
  };

  const copyAll = async () => {
    if (!plan) return;
    await navigator.clipboard.writeText(asMarkdown(plan));
    toast.success("Plan copied");
  };

  const exportMd = () => {
    if (!plan) return;
    const blob = new Blob([asMarkdown(plan)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${planningType.toLowerCase()}-plan.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<CalendarClock className="h-5 w-5" />}
        title="AI Task Planner"
        description="Generate an organised daily or weekly schedule tuned for real productivity."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Plan inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tasks">Task list</Label>
              <Textarea
                id="tasks"
                placeholder={"One task per line…\n- Prep for Monday client demo\n- Review PR #482\n- Draft Q4 plan"}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Working hours</Label>
              <Input
                id="hours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Planning type</Label>
                <Select
                  value={planningType}
                  onValueChange={(v) => setPlanningType(v as "Daily" | "Weekly")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                placeholder="e.g. End of Friday"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full rounded-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={copyAll} disabled={!plan}>
              <Copy className="mr-1 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={generate} disabled={loading || !plan}>
              <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={exportMd} disabled={!plan}>
              <Download className="mr-1 h-4 w-4" /> Export
            </Button>
          </div>

          {loading && !plan ? (
            <Card className="shadow-soft">
              <CardContent className="space-y-3 p-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
                ))}
              </CardContent>
            </Card>
          ) : plan ? (
            <PlanView plan={plan} />
          ) : (
            <Card className="shadow-soft">
              <CardContent className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
                <CalendarClock className="mb-3 h-10 w-10 opacity-40" />
                Your schedule will appear here.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-4">
      <TimelineCard icon={<Sunrise className="h-4 w-4" />} title="Morning" blocks={plan.morning} />
      <TimelineCard icon={<Sun className="h-4 w-4" />} title="Afternoon" blocks={plan.afternoon} />
      {plan.evening.length > 0 && (
        <TimelineCard icon={<Sunset className="h-4 w-4" />} title="Evening" blocks={plan.evening} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <TrendingUp className="h-4 w-4" /> Priority Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.priorityRanking.length ? (
              <ol className="space-y-2 text-sm">
                {plan.priorityRanking.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{p}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No ranking provided.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <CalendarClock className="h-4 w-4" /> Estimated Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              {plan.estimatedCompletion || "No estimate provided."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Lightbulb className="h-4 w-4" /> Productivity Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.productivityTips.length ? (
            <ul className="space-y-2 text-sm">
              {plan.productivityTips.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No tips provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineCard({
  icon,
  title,
  blocks,
}: {
  icon: React.ReactNode;
  title: string;
  blocks: Block[];
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {blocks.map((b, i) => (
              <li key={i} className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-sm font-semibold text-primary">{b.time}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{b.task}</p>
                  {b.notes && <p className="mt-0.5 text-xs text-muted-foreground">{b.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
