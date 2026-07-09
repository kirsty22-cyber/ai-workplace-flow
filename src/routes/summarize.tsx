import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, FileText, Loader2, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";
import { useSessionStats } from "@/context/session-stats";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkAI" },
      {
        name: "description",
        content: "Turn lengthy meeting notes into concise summaries with decisions and action items.",
      },
    ],
  }),
  component: SummarizePage,
});

type Summary = {
  executiveSummary: string;
  keyDecisions: string[];
  actionItems: { item: string; owner: string | null; deadline: string | null }[];
  deadlines: string[];
  discussionPoints: string[];
};

const emptySummary: Summary = {
  executiveSummary: "",
  keyDecisions: [],
  actionItems: [],
  deadlines: [],
  discussionPoints: [],
};

function SummarizePage() {
  const { bump } = useSessionStats();
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (notes.trim().length < 20) {
      toast.error("Paste at least a few sentences of meeting notes.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(body.error ?? "Something went wrong.");
      }
      const data = (await res.json()) as { summary: Summary };
      setSummary(data.summary);
      bump("meetings");
      toast.success("Summary generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  const asMarkdown = (s: Summary) =>
    [
      `# Meeting Summary`,
      ``,
      `## Executive Summary`,
      s.executiveSummary || "-",
      ``,
      `## Key Decisions`,
      ...(s.keyDecisions.length ? s.keyDecisions.map((d) => `- ${d}`) : ["-"]),
      ``,
      `## Action Items`,
      ...(s.actionItems.length
        ? s.actionItems.map(
            (a) =>
              `- ${a.item}${a.owner ? ` — @${a.owner}` : ""}${a.deadline ? ` (due ${a.deadline})` : ""}`,
          )
        : ["-"]),
      ``,
      `## Deadlines`,
      ...(s.deadlines.length ? s.deadlines.map((d) => `- ${d}`) : ["-"]),
      ``,
      `## Important Discussion Points`,
      ...(s.discussionPoints.length ? s.discussionPoints.map((d) => `- ${d}`) : ["-"]),
    ].join("\n");

  const copyAll = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(asMarkdown(summary));
    toast.success("Summary copied");
  };

  const exportMd = () => {
    if (!summary) return;
    const blob = new Blob([asMarkdown(summary)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-summary.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Meeting Notes Summarizer"
        description="Turn long meeting notes into a structured, actionable summary."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Meeting notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your meeting notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={18}
            />
            <Button onClick={generate} disabled={loading} className="w-full rounded-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={copyAll} disabled={!summary}>
              <Copy className="mr-1 h-4 w-4" /> Copy all
            </Button>
            <Button variant="outline" size="sm" onClick={generate} disabled={loading || !summary}>
              <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={exportMd} disabled={!summary}>
              <Download className="mr-1 h-4 w-4" /> Export
            </Button>
          </div>

          {loading && !summary ? (
            <SummarySkeleton />
          ) : summary ? (
            <SummaryView value={summary} onChange={setSummary} />
          ) : (
            <Card className="shadow-soft">
              <CardContent className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
                <FileText className="mb-3 h-10 w-10 opacity-40" />
                Your structured summary will appear here.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="shadow-soft">
          <CardContent className="space-y-2 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SummaryView({
  value,
  onChange,
}: {
  value: Summary;
  onChange: (s: Summary) => void;
}) {
  const update = <K extends keyof Summary>(key: K, v: Summary[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <SectionCard title="Executive Summary">
        <Textarea
          value={value.executiveSummary}
          onChange={(e) => update("executiveSummary", e.target.value)}
          rows={4}
        />
      </SectionCard>

      <SectionCard title="Key Decisions">
        <EditableList
          items={value.keyDecisions}
          onChange={(items) => update("keyDecisions", items)}
          placeholder="Add a decision"
        />
      </SectionCard>

      <SectionCard title="Action Items">
        <div className="space-y-2">
          {value.actionItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No action items.</p>
          )}
          {value.actionItems.map((a, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_160px_160px]">
              <Textarea
                value={a.item}
                onChange={(e) => {
                  const next = [...value.actionItems];
                  next[i] = { ...a, item: e.target.value };
                  update("actionItems", next);
                }}
                rows={2}
              />
              <input
                className="h-9 rounded-md border bg-background px-3 text-sm"
                placeholder="Owner"
                value={a.owner ?? ""}
                onChange={(e) => {
                  const next = [...value.actionItems];
                  next[i] = { ...a, owner: e.target.value || null };
                  update("actionItems", next);
                }}
              />
              <input
                className="h-9 rounded-md border bg-background px-3 text-sm"
                placeholder="Deadline"
                value={a.deadline ?? ""}
                onChange={(e) => {
                  const next = [...value.actionItems];
                  next[i] = { ...a, deadline: e.target.value || null };
                  update("actionItems", next);
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Deadlines">
        <EditableList
          items={value.deadlines}
          onChange={(items) => update("deadlines", items)}
          placeholder="Add a deadline"
        />
      </SectionCard>

      <SectionCard title="Important Discussion Points">
        <EditableList
          items={value.discussionPoints}
          onChange={(items) => update("discussionPoints", items)}
          placeholder="Add a discussion point"
        />
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing here yet. {placeholder} above will appear as bullet items.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <Textarea
            value={it}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            rows={1}
            className="min-h-[36px] py-1.5"
          />
        </li>
      ))}
    </ul>
  );
}
