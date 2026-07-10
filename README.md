# AI Workplace Productivity Assistant

A modern, responsive SaaS-style web application that helps professionals automate common workplace tasks using AI. No sign-up, no database — everything runs in your current browser session and clears on refresh.

## Project Overview

WorkAI is a privacy-focused productivity workspace inspired by tools like Microsoft Copilot, Notion AI, and Grammarly Business. Users can access every feature immediately from a clean, blue-accented dashboard. All AI-generated content lives only in memory for the active session — nothing is stored on a server or in a database.

- **No account required** — open the app and start working.
- **Zero persistence** — refresh the page and the session resets.
- **Session-only preferences** — theme and tone choices last only while the tab is open.
- **Responsible AI** — every tool ships with a visible disclaimer reminding users to review outputs.

## Features Implemented

- **Dashboard** — overview of the available tools with productivity stats for the current session.
- **Smart Email Generator** (`/email`) — drafts professional emails from a short prompt with configurable tone and length.
- **AI Chatbot** (`/chat`) — interactive workplace assistant with streaming responses, suggestion chips, and a "New conversation" reset button.
- **AI Task Planner** (`/planner`) — turns a list of tasks into a structured, time-blocked schedule.
- **Prompt Library** (`/prompts`) — 15+ ready-to-use workplace prompts across 5 categories, with copy-to-clipboard.
- **Settings** (`/settings`) — session-only theme (light/dark) and default tone preferences.
- **Help** (`/help`) — FAQ covering privacy, session behavior, and each feature.
- **Bluer, modern theme** — navy and azure palette, Inter typography, Lucide icons, responsive sidebar navigation.

## Technologies and Tools Used

- **Framework:** [TanStack Start](https://tanstack.com/start) v1 (React 19, SSR-capable, file-based routing)
- **Build tool:** Vite 7
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with semantic OKLCH design tokens in `src/styles.css`
- **UI components:** shadcn/ui + custom AI Elements (`Conversation`, `Message`, `PromptInput`, `Shimmer`)
- **Icons:** Lucide React
- **AI SDK:** [Vercel AI SDK](https://ai-sdk.dev) (`ai`, `@ai-sdk/react`) with `streamText` and `useChat`
- **AI provider:** Lovable AI Gateway (`openai/gpt-5.5`) — API key kept server-side via TanStack server routes
- **State:** React Context for session preferences and usage stats (in-memory only)
- **Notifications:** Sonner
- **Runtime:** Cloudflare Workers–compatible edge runtime

## Setup Instructions

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- A `LOVABLE_API_KEY` for the Lovable AI Gateway (auto-injected when running inside Lovable; set manually for local development)

### Install

```bash
bun install
```

### Configure environment

Create a `.env` file in the project root:

```bash
LOVABLE_API_KEY=your_lovable_ai_gateway_key
```

### Run the dev server

```bash
bun run dev
```

The app will start on <http://localhost:8080>.

### Build for production

```bash
bun run build
```

### Project structure

```
src/
├── components/         # UI, sidebar, page header, AI Elements
├── context/            # Session preferences and stats providers
├── lib/                # AI Gateway helper and utilities
├── routes/             # File-based routes
│   ├── __root.tsx      # App shell (sidebar + top nav)
│   ├── index.tsx       # Dashboard
│   ├── email.tsx       # Smart Email Generator
│   ├── chat.tsx        # AI Chatbot
│   ├── planner.tsx     # AI Task Planner
│   ├── prompts.tsx     # Prompt Library
│   ├── settings.tsx    # Session preferences
│   ├── help.tsx        # FAQ
│   └── api/            # Server routes calling the AI Gateway
└── styles.css          # Tailwind v4 tokens and theme
```

### Notes

- No database is used. Do not add persistence without updating the privacy messaging in `/help` and `ResponsibleAIDisclaimer`.
- Server routes under `src/routes/api/` read `LOVABLE_API_KEY` inside their handlers and must never expose it to the client.
