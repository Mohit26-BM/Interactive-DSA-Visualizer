import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { algorithm, stepExplanation, stepIndex, totalSteps, additionalContext } =
    await req.json() as {
      algorithm: string;
      stepExplanation: string;
      stepIndex: number;
      totalSteps: number;
      additionalContext?: string;
    };

  const stream = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    stream: true,
    max_tokens: 150,
    temperature: 0.65,
    messages: [
      {
        role: "system",
        content:
          "You are a friendly CS tutor explaining algorithm visualization steps to a student. " +
          "Keep your response to 2–3 concise sentences. Focus on the WHY — the insight the algorithm is applying " +
          "and what it achieves. Never repeat the step description verbatim. Be direct and conversational.",
      },
      {
        role: "user",
        content:
          `Algorithm: ${algorithm}\n` +
          `Step ${stepIndex + 1} of ${totalSteps}: "${stepExplanation}"` +
          (additionalContext ? `\nContext: ${additionalContext}` : "") +
          `\n\nExplain what happened and why in plain English.`,
      },
    ],
  });

  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(enc.encode(text));
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
