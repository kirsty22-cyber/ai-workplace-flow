import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, gatewayErrorResponse } from "@/lib/ai-gateway.server";

const Body = z.object({
  tasks: z.string().min(1),
  workingHours: z.string().default("9:00 AM - 5:00 PM"),
  priority: z.string().default("Medium"),
  deadline: z.string().default(""),
  planningType: z.enum(["Daily", "Weekly"]),
});

const Block = z.object({
  time: z.string(),
  task: z.string(),
  notes: z.string().nullable(),
});

const PlanSchema = z.object({
  morning: z.array(Block),
  afternoon: z.array(Block),
  evening: z.array(Block),
  priorityRanking: z.array(z.string()),
  estimatedCompletion: z.string(),
  productivityTips: z.array(z.string()),
});

export type Plan = z.infer<typeof PlanSchema>;

function empty(): Plan {
  return {
    morning: [],
    afternoon: [],
    evening: [],
    priorityRanking: [],
    estimatedCompletion: "",
    productivityTips: [],
  };
}

export const Route = createFileRoute("/api/planner")({
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

        const prompt = `Create an efficient workplace schedule (${input.planningType}).

Working Hours: ${input.workingHours}
Tasks:
${input.tasks}
Deadline: ${input.deadline || "(not specified)"}
Priority: ${input.priority}

Requirements:
- Prioritise urgent tasks
- Group similar tasks together
- Include short breaks
- Balance workload
- Estimate completion times
- Maximise productivity

Return a structured plan with morning, afternoon, and evening blocks (evening may be empty for a normal workday). Each block: time slot like "9:00 - 10:30", the task, and optional notes (or null). Also return priorityRanking (ordered task list), estimatedCompletion (a short sentence), and 3-5 productivityTips.`;

        try {
          const { output } = await generateText({
            model,
            output: Output.object({ schema: PlanSchema }),
            prompt,
          });
          return Response.json({ plan: output });
        } catch (err) {
          if (NoObjectGeneratedError.isInstance(err)) {
            try {
              const parsed = JSON.parse(err.text ?? "{}");
              const safe = PlanSchema.safeParse(parsed);
              return Response.json({ plan: safe.success ? safe.data : empty() });
            } catch {
              return Response.json({ plan: empty() });
            }
          }
          return gatewayErrorResponse(err);
        }
      },
    },
  },
});
