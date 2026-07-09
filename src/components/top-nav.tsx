import { Link } from "@tanstack/react-router";
import { Bell, HelpCircle, Search, Settings } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="hidden md:block h-6 w-px bg-border" />
      <div className="relative hidden md:block flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search features, prompts…"
          className="pl-9 h-10 rounded-full bg-secondary border-transparent focus-visible:bg-background"
        />
      </div>
      <div className="flex flex-1 md:flex-none items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
          <Link to="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Help">
          <Link to="/help">
            <HelpCircle className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
