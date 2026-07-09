import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookMarked, Copy } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Prompt Library — WorkAI" },
      {
        name: "description",
        content: "A curated library of workplace AI prompts you can copy and adapt.",
      },
    ],
  }),
  component: PromptsPage,
});

const categories = [
  "All",
  "Email Writing",
  "Meeting Productivity",
  "Time Management",
  "Communication",
  "Project Planning",
] as const;

type Category = Exclude<(typeof categories)[number], "All">;

const prompts: {
  title: string;
  description: string;
  category: Category;
  prompt: string;
}[] = [
  {
    title: "Polite Follow-up Email",
    description: "Nudge a stakeholder without sounding pushy.",
    category: "Email Writing",
    prompt:
      "Write a polite follow-up email to {recipient} regarding {topic}. Keep it warm and concise (under 120 words), include a clear ask, and offer to help unblock them.",
  },
  {
    title: "Decline a Meeting Gracefully",
    description: "Say no while protecting the relationship.",
    category: "Email Writing",
    prompt:
      "Draft a short, friendly email declining a meeting with {recipient} about {topic}. Thank them, explain briefly, and propose an async alternative such as a document review or a 10-minute Loom.",
  },
  {
    title: "Cold Outreach Intro",
    description: "Introduce yourself to a prospect.",
    category: "Email Writing",
    prompt:
      "Write a concise cold outreach email introducing {your role} at {company}, referencing {shared context}, and requesting a 15-minute call. Focus on the value to the recipient.",
  },
  {
    title: "Meeting Agenda Builder",
    description: "Create a focused agenda from goals.",
    category: "Meeting Productivity",
    prompt:
      "Build a 30-minute meeting agenda for {topic}. Include objectives, discussion items with time boxes, owners, and clear decisions to be made.",
  },
  {
    title: "Meeting Recap Message",
    description: "Send a crisp summary to attendees.",
    category: "Meeting Productivity",
    prompt:
      "Summarise the following meeting into a recap message for attendees: {notes}. Include decisions, action items with owners and dates, and next meeting.",
  },
  {
    title: "Stand-up Update Formatter",
    description: "Turn raw notes into a clean stand-up.",
    category: "Meeting Productivity",
    prompt:
      "Format the following into a daily stand-up: Yesterday, Today, Blockers. Keep each section to 2-3 bullets max. Notes: {notes}",
  },
  {
    title: "Time Block a Busy Day",
    description: "Batch tasks into focus blocks.",
    category: "Time Management",
    prompt:
      "Create a time-blocked schedule from {start} to {end} for these tasks: {tasks}. Group similar work, add 15-min breaks, and reserve one 90-minute deep work block.",
  },
  {
    title: "Weekly Priority Matrix",
    description: "Sort work by impact and urgency.",
    category: "Time Management",
    prompt:
      "Organise these tasks into an impact/urgency matrix and recommend what to do, schedule, delegate, or drop: {tasks}",
  },
  {
    title: "Difficult Feedback Message",
    description: "Deliver constructive feedback with care.",
    category: "Communication",
    prompt:
      "Draft a Slack message giving {recipient} constructive feedback about {behavior}. Use SBI (Situation, Behavior, Impact), be specific, and end with a supportive next step.",
  },
  {
    title: "Executive Summary",
    description: "One paragraph an exec will actually read.",
    category: "Communication",
    prompt:
      "Write a 4-sentence executive summary of {topic} covering: what, why it matters, current status, and the decision needed.",
  },
  {
    title: "Slack Announcement",
    description: "Post an update your team will read.",
    category: "Communication",
    prompt:
      "Draft a Slack announcement about {topic}. Lead with the TL;DR, use short bullets, include a call to action, and end with who to ping for questions.",
  },
  {
    title: "Project Kickoff Doc",
    description: "Align a team on a new initiative.",
    category: "Project Planning",
    prompt:
      "Create a project kickoff document for {project}. Include problem statement, goals, non-goals, key milestones, risks, and roles (DRI, contributors, stakeholders).",
  },
  {
    title: "Risk & Mitigation Register",
    description: "Surface risks before they surface you.",
    category: "Project Planning",
    prompt:
      "List the top 8 risks for {project}. For each: likelihood, impact, early warning signal, mitigation, and owner.",
  },
  {
    title: "Sprint Retrospective Prompts",
    description: "Guide a productive retro.",
    category: "Meeting Productivity",
    prompt:
      "Generate 6 focused retro questions for a team that just shipped {project}. Balance celebration, learning, and concrete process changes.",
  },
  {
    title: "OKR Draft from Objectives",
    description: "Turn goals into measurable outcomes.",
    category: "Project Planning",
    prompt:
      "Draft 3 OKRs for a {team} focused on {objective this quarter}. Each objective must be inspirational; each key result must be measurable, time-bound, and outcome-based.",
  },
];

function PromptsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const visible = useMemo(
    () => (category === "All" ? prompts : prompts.filter((p) => p.category === category)),
    [category],
  );

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Prompt copied");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<BookMarked className="h-5 w-5" />}
        title="Prompt Library"
        description="Copy-ready prompts for common workplace tasks."
      />

      <Tabs value={category} onValueChange={(v) => setCategory(v as (typeof categories)[number])}>
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-secondary p-1">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className="rounded-full px-4">
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <Card key={p.title} className="flex flex-col shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <CardHeader>
              <div className="mb-1 flex items-start justify-between gap-2">
                <Badge variant="secondary" className="rounded-full text-xs font-medium">
                  {p.category}
                </Badge>
              </div>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-3">
              <p className="rounded-lg bg-secondary/70 p-3 text-sm leading-relaxed text-foreground/80">
                {p.prompt}
              </p>
              <Button onClick={() => copy(p.prompt)} variant="outline" className="w-full rounded-full">
                <Copy className="mr-1 h-4 w-4" /> Copy Prompt
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
