import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { usePreferences } from "@/context/preferences";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkAI" },
      { name: "description", content: "Session-only interface preferences for WorkAI." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    theme,
    setTheme,
    defaultTone,
    setDefaultTone,
    notifications,
    setNotifications,
    language,
    setLanguage,
  } = usePreferences();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<SettingsIcon className="h-5 w-5" />}
        title="Settings"
        description="Interface preferences — session only. Nothing is stored."
      />

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>These reset when you refresh the page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Row label="Theme" description="Switch between light and dark appearance.">
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </Row>

          <Row label="Default email tone" description="Preselected in the Email Generator.">
            <Select
              value={defaultTone}
              onValueChange={(v) => setDefaultTone(v as "Formal" | "Friendly" | "Persuasive")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </Row>

          <Row label="Notifications" description="Show success and error toasts.">
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </Row>

          <Row label="Language" description="Interface language preference.">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b pb-6 last:border-0 last:pb-0">
      <div className="min-w-0">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
