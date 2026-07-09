import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, gatewayErrorResponse } from "@/lib/ai-gateway.server";

const Body = z.object({
  recipient: z.string().min(1),
  subject: z.string().min(1),
  purpose: z.string().min(1),
  keyPoints: z.string().default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  length: z.enum(["Short", "Medium", "Detailed"]),
});

export const Route = createFileRoute("/api/email")({
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

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("openai/gpt-5.5");

        try {
          const { text } = await generateText({
            model,
            prompt: `Generate a professional workplace email using the following information.

Recipient: ${input.recipient}
Subject: ${input.subject}
Purpose: ${input.purpose}
Key Points: ${input.keyPoints || "(none provided)"}
Tone: ${input.tone}
Length: ${input.length}

Produce a polished email with:
- Professional greeting
- Clear introduction
- Well-structured body
- Appropriate closing
- Professional signature (use "[Your Name]" as a placeholder)

Return ONLY the email body text. Do not wrap in markdown or code fences. Do not include a "Subject:" line at the top.`,
          });
          return Response.json({ email: text.trim() });
        } catch (err) {
          return gatewayErrorResponse(err);
        }
      },
    },
  },
});
