## Plan

### 1. Add more blue to the theme (keep design intact)
Update `src/styles.css` tokens so the app reads distinctly bluer while keeping the current clean/professional look:
- Shift `--background` to a very subtle blue tint (near-white with a hint of blue) in light mode.
- Deepen `--primary` toward a richer navy-blue and brighten `--primary-glow` to a vivid azure.
- Tint `--secondary`, `--muted`, `--accent`, `--sidebar`, and `--border` with more blue chroma.
- Dark mode: shift backgrounds toward deeper navy-blue, primary toward bright azure.
- No layout, spacing, typography, or component structure changes.

### 2. Replace Meeting Notes Summarizer with an AI Chatbot Interface
Remove the summarizer feature and add a conversational assistant in its place.

**Files removed**
- `src/routes/summarize.tsx`
- `src/routes/api/summarize.ts`

**Files added**
- `src/routes/api/chat.ts` — TanStack server route using AI SDK `streamText` + Lovable AI Gateway (`openai/gpt-5.5`), returning `toUIMessageStreamResponse`. System prompt frames it as a workplace productivity assistant.
- `src/routes/chat.tsx` — new page at `/chat` using AI Elements (`Conversation`, `Message`, `MessageContent`, `MessageResponse`, `PromptInput`, `PromptInputTextarea`, `PromptInputFooter`, `PromptInputSubmit`, `Shimmer`) with `useChat` + `DefaultChatTransport({ api: "/api/chat" })`. Renders `message.parts`, autofocuses composer, session-only (no persistence, cleared on refresh), includes a "New conversation" button and `ResponsibleAIDisclaimer`.

**Files updated**
- `src/components/app-sidebar.tsx` — swap "Meeting Summarizer" nav entry for "AI Chatbot" pointing to `/chat` (MessageCircle icon).
- `src/routes/index.tsx` — replace the summarizer dashboard card with an "AI Chatbot" card linking to `/chat`.
- `src/routes/prompts.tsx` — if it links to `/summarize`, retarget the relevant prompts to `/chat`.
- `src/context/session-stats.tsx` — rename the `meetings` counter to `chats` (or add `chats`), bumped on each user message sent.
- `src/routes/help.tsx` — update FAQ copy referencing the summarizer.

### Conversation shape / storage
Per the app spec ("no account, no database, cleared on refresh"), the chatbot is **one conversation, no persistence** — a single-session chat kept in memory only. No thread list, no localStorage, no DB. A "New conversation" button clears in-memory messages.

### Technical notes
- AI Elements installed via `bun x ai-elements@latest add conversation message prompt-input shimmer` before writing `chat.tsx`.
- Server route reads `LOVABLE_API_KEY` inside the handler; existing `ai-gateway.server.ts` helper reused.
- Assistant messages: no bubble background; user messages: `primary` / `primary-foreground` bubble to match the bluer theme.
