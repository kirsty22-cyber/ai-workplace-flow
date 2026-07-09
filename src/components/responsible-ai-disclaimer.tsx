import { ShieldCheck } from "lucide-react";

export function ResponsibleAIDisclaimer() {
  return (
    <div className="mt-8 rounded-xl border bg-secondary/60 p-4 text-sm text-muted-foreground">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Responsible AI Disclaimer</p>
          <p>
            This application uses artificial intelligence to assist with workplace productivity.
            AI-generated responses may occasionally contain inaccuracies or omit important context.
            Always review, edit, and verify generated content before using it for professional
            communication or business decisions. No user information or generated content is stored —
            everything is processed for the current session only and cleared when the page is refreshed
            or closed.
          </p>
        </div>
      </div>
    </div>
  );
}
