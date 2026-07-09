# AI Workplace Productivity Assistant

A stateless, no-login SaaS-style dashboard with three AI tools powered by Lovable AI Gateway (default model: `openai/gpt-5.5`). No database, no auth, no persistence — all outputs live only in the current browser session.

## Design

- Navy (#123A73) + white palette, light grey secondary surfaces, rounded cards, soft shadows
- Inter typography, Lucide icons, smooth hover/transition animations
- Fully responsive (desktop / tablet / mobile), collapsible sidebar on mobile
- Tokens defined in `src/styles.css` (`@theme` + `:root`), no hardcoded colors in components
- Light/Dark theme toggle (session only)

## Routes (TanStack Start)

```
src/routes/
  __root.tsx           shell + <SidebarProvider>, top nav, sidebar, Outlet
  index.tsx            Dashboard home (feature cards + productivity overview)
  email.tsx            Smart Email Generator
  summarize.tsx        Meeting Notes Summarizer
  planner.tsx          AI Task Planner
  prompts.tsx          Prompt Library
  settings.tsx         Session-only preferences
  help.tsx             FAQ + Responsible AI info
  api/
    email.ts           POST → streams/generates email
    summarize.ts       POST → returns structured summary JSON
    planner.ts         POST → returns structured schedule JSON
```

Each route has its own `head()` with unique title/description/OG tags.

## Backend (Lovable AI Gateway)

- Enable Lovable Cloud → provisions `LOVABLE_API_KEY`
- Shared provider helper `src/lib/ai-gateway.server.ts` (openai-compatible, `Lovable-API-Key` header)
- Three server routes under `src/routes/api/` using `streamText` / `generateText` with `Output.object` for the summarizer + planner (small schemas, no bounds)
- Model: `openai/gpt-5.5` for all three (good default all-rounder)
- Handle 429 (rate limit) and 402 (credits) with clear toast messages
- Nothing persisted server-side; no DB tables

## Feature 1: Smart Email Generator (`/email`)

Form: Recipient, Subject, Purpose, Key Points (textarea), Tone (Formal/Friendly/Persuasive), Length (Short/Medium/Detailed). "Generate Email" → streams into an editable `<Textarea>`. Actions: Copy, Edit (inline), Regenerate, Download (.txt). Loading skeleton while streaming.

## Feature 2: Meeting Notes Summarizer (`/summarize`)

Large textarea input. Server returns structured JSON:
`{ executiveSummary, keyDecisions[], actionItems[{item, owner?, deadline?}], deadlines[], discussionPoints[] }`
Rendered as 5 editable cards. Actions per card + global: Copy, Edit, Regenerate, Export (.md).

## Feature 3: AI Task Planner (`/planner`)

Form: Tasks (textarea, one per line), Working Hours (start/end), Priority Level, Deadline, Planning Type (Daily/Weekly). Structured output:
`{ morning[], afternoon[], evening[], priorityRanking[], estimatedCompletion, productivityTips[] }`
Rendered as timeline-style cards. Actions: Copy, Edit, Regenerate, Export (.md).

## Prompt Library (`/prompts`)

Static array of ~15–20 predefined prompts across 5 categories (Email Writing, Meeting Productivity, Time Management, Communication, Project Planning). Each card: title, description, prompt text, Copy button. Category filter tabs.

## Settings (`/settings`)

Session-only (React context + `useState`, no localStorage): Default Email Tone, Theme (Light/Dark, applies `.dark` class), Notifications toggle, Language dropdown. Reset on refresh.

## Help (`/help`)

Accordion FAQ + Responsible AI disclaimer block.

## Shared Components

- `AppSidebar` — shadcn sidebar with 7 nav items, active-route highlighting via `useRouterState`
- `TopNav` — logo, app name, search (visual), notifications/settings/help icons
- `ResponsibleAIDisclaimer` — shown on all 3 AI feature pages
- `FeatureCard`, `StatCard` — dashboard building blocks
- `SessionStatsContext` — in-memory counters (emails generated, meetings summarized, plans created, derived productivity score) reset on refresh
- Toaster (sonner) for copy/export success + error notifications

## Technical Notes

- No auth, no DB, no localStorage for user data
- All AI calls go through server routes; `LOVABLE_API_KEY` never touches the client
- Structured outputs use small `Output.object` schemas with no `.min/.max/format` (constraints described in prompt, validated in code)
- Downloads via client-side Blob + anchor
- shadcn: Button, Card, Input, Textarea, Select, Tabs, Accordion, Sidebar, Sonner, Switch, Label
