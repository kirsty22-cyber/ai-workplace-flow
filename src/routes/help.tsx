import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — WorkAI" },
      { name: "description", content: "Frequently asked questions about WorkAI." },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "How does the Smart Email Generator work?",
    a: "You provide the recipient, subject, purpose, key points, tone, and length. WorkAI drafts a complete email you can edit, copy, or download. Nothing is saved.",
  },
  {
    q: "How accurate are AI-generated summaries?",
    a: "Summaries are usually a strong starting point but may miss nuance or misattribute action items. Always review before sharing.",
  },
  {
    q: "Can I edit AI-generated content?",
    a: "Yes — every output is editable in-place before you copy, download, or export it.",
  },
  {
    q: "What information should I avoid sharing with AI?",
    a: "Avoid pasting personally identifiable information, secrets, contracts, or anything confidential you don't have permission to share with a third-party AI service.",
  },
  {
    q: "Is my information stored?",
    a: "No. There is no account, no database, and no history. Everything lives only in your current browser session and disappears on refresh.",
  },
];

function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<HelpCircle className="h-5 w-5" />}
        title="Help & FAQ"
        description="Answers to common questions about how WorkAI works."
      />

      <Card className="shadow-soft">
        <CardContent className="p-2 sm:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <ResponsibleAIDisclaimer />
    </div>
  );
}
