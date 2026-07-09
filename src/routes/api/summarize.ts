import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, gatewayErrorResponse } from "@/lib/ai-gateway.server";

const Body = z.object({ notes: z.string().min(10) });

const SummarySchema = z.object({
  executiveSummary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      item: z.string(),
      owner: z.string().nullable(),
      deadline: z.string().nullable(),
    }),
  ),
  deadlines: z.array(z.string()),
  discussionPoints: z.array(z.string()),
});

export type MeetingSummary = z.infer<typeof SummarySchema>;

function empty(): MeetingSummary {
  return {
    executiveSummary: "",
    keyDecisions: [],
    actionItems: [],
    deadlines: [],
    discussionPoints: [],
  };
}

export const Route = createFileRoute("/api/summarize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let input: z.infer<typeof Body>;
        try {
          input = Body.parse(await request.json());
        } catch {
          return new Response("Invalid input", { status: 400 });
        }

        const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });
        const model = gateway("openai/gpt-5.5");

        const prompt = `Summarize the following workplace meeting notes. Use professional language.

Provide:
- executiveSummary: 2-4 sentence overview
- keyDecisions: list of decisions made
- actionItems: each with the task, owner (name or null), and deadline (or null)
- deadlines: notable deadlines mentioned
- discussionPoints: important topics discussed

If a field has nothing to report, return an empty array (or short string for executiveSummary).

MEETING NOTES:
${input.notes}`;

        try {
          const { output } = await generateText({
            model,
            output: Output.object({ schema: SummarySchema }),
            prompt,
          });
          return Response.json({ summary: output });
        } catch (err) {
          if (NoObjectGeneratedError.isInstance(err)) {
            try {
              const parsed = JSON.parse(err.text ?? "{}");
              const safe = SummarySchema.safeParse(parsed);
              return Response.json({ summary: safe.success ? safe.data : empty() });
            } catch {
              return Response.json({ summary: empty() });
            }
          }
          return gatewayErrorResponse(err);
        }
      },
    },
  },
});
