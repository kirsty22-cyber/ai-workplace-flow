import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, Loader2, Mail, RefreshCw, Wand2 } from "lucide-react";
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
import { usePreferences } from "@/context/preferences";
import { useSessionStats } from "@/context/session-stats";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkAI" },
      {
        name: "description",
        content: "Generate professional workplace emails with AI. Nothing saved, session only.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "Formal" | "Friendly" | "Persuasive";
type Length = "Short" | "Medium" | "Detailed";

function EmailPage() {
  const { defaultTone } = usePreferences();
  const { bump } = useSessionStats();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<Tone>(defaultTone);
  const [length, setLength] = useState<Length>("Medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const canGenerate = recipient.trim() && subject.trim() && purpose.trim();

  const generate = async () => {
    if (!canGenerate) {
      toast.error("Fill in recipient, subject, and purpose to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipient, subject, purpose, keyPoints, tone, length }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(body.error ?? "Something went wrong.");
      }
      const data = (await res.json()) as { email: string };
      setOutput(data.email);
      bump("emails");
      toast.success("Email generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([`Subject: ${subject}\n\n${output}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.replace(/[^\w\s-]/g, "").slice(0, 40) || "email"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<Mail className="h-5 w-5" />}
        title="Smart Email Generator"
        description="Generate polished, professional workplace emails in seconds."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Email details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. Sarah, Marketing Team"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Q3 campaign update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Email</Label>
              <Input
                id="purpose"
                placeholder="What is this email about?"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyPoints">Key Points</Label>
              <Textarea
                id="keyPoints"
                placeholder="List the main points to include, one per line."
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Generated email</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={generate} disabled={loading || !output}>
                <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={download} disabled={!output}>
                <Download className="mr-1 h-4 w-4" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !output ? (
              <div className="space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Your generated email will appear here. You can edit it freely before copying or downloading."
                rows={18}
                className="font-sans leading-relaxed"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}
