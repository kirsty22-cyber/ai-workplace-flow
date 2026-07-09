import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";
import { useSessionStats } from "@/context/session-stats";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — WorkAI" },
      {
        name: "description",
        content:
          "Chat with an interactive AI workplace assistant. Ask questions, draft messages, brainstorm — all in your browser session.",
      },
    ],
  }),
  component: ChatPage,
});

const suggestions = [
  "Draft a friendly follow-up to a client who hasn't replied in a week.",
  "Help me plan a focused 4-hour work block for tomorrow morning.",
  "Summarize the pros and cons of async standups.",
  "Rewrite this message to sound more confident: 'Sorry to bother you...'",
];

function ChatPage() {
  const { bump } = useSessionStats();
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId, status]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage({ text: trimmed });
    bump("chats");
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    await submit(message.text);
  };

  const newConversation = () => {
    if (isLoading) stop();
    setChatId(crypto.randomUUID());
    setInput("");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={<MessageCircle className="h-5 w-5" />}
        title="AI Chatbot"
        description="Your interactive workplace assistant. Ask, brainstorm, or draft anything."
        actions={
          <Button variant="outline" size="sm" onClick={newConversation}>
            <RefreshCw className="mr-1 h-4 w-4" /> New conversation
          </Button>
        }
      />

      <div className="flex min-h-[70vh] flex-col rounded-2xl border bg-card shadow-soft">
        <Conversation className="flex-1">
          <ConversationContent className="px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                }
                title="How can I help you today?"
                description="Ask anything about your work — drafts, plans, ideas, summaries."
              >
                <div className="mt-4 grid w-full gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-xl border bg-secondary/60 px-3 py-2.5 text-left text-sm text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m: UIMessage) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent p-0 text-foreground"
                    }
                  >
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return m.role === "assistant" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}

            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent className="bg-transparent p-0 text-muted-foreground">
                  <Shimmer>Thinking…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t bg-background/50 p-3 sm:p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message WorkAI…"
              disabled={false}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() && !isLoading}
                onStop={stop}
              />
            </PromptInputFooter>
          </PromptInput>
          {error && (
            <p className="mt-2 text-xs text-destructive">{error.message}</p>
          )}
        </div>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}
