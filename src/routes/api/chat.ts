import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createLovableAiGatewayProvider, gatewayErrorResponse } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are WorkAI, an interactive AI workplace productivity assistant.
You help professionals with everyday work tasks: drafting emails and messages, brainstorming, summarizing content, planning their day, structuring documents, and thinking through decisions.

Guidelines:
- Be concise, professional, and warm. Prefer short paragraphs and bullet lists.
- Ask a brief clarifying question when the request is ambiguous.
- Use Markdown for structure (headings, lists, code) when it aids readability.
- Never claim to remember past sessions — this conversation is stateless and cleared on refresh.
- Do not fabricate personal or company-specific facts; ask instead.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("openai/gpt-5.5");
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err) {
          return gatewayErrorResponse(err);
        }
      },
    },
  },
});
