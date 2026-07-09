import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(
  lovableApiKey: string,
  options?: { structuredOutputs?: boolean },
) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function gatewayErrorResponse(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes("429") || lower.includes("rate")) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }
  if (lower.includes("402") || lower.includes("credit") || lower.includes("payment")) {
    return new Response(
      JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
      { status: 402, headers: { "content-type": "application/json" } },
    );
  }
  console.error("AI Gateway error:", err);
  return new Response(
    JSON.stringify({ error: "AI request failed. Please try again." }),
    { status: 500, headers: { "content-type": "application/json" } },
  );
}
