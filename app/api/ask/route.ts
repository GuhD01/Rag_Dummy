import OpenAI from "openai";
import { formatContext, retrieveTopK } from "@/lib/rag";
import { buildGroundedPrompt } from "@/lib/prompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = String(body?.question || "").trim();

    if (!question) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    const embeddingResponse = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    const retrieved = retrieveTopK(queryEmbedding, 5);
    const context = formatContext(retrieved);

    const prompt = buildGroundedPrompt(question, context);

    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: prompt,
    });

    return Response.json({
      answer: response.output_text,
      retrieved: retrieved.map((r) => ({
        score: r.score,
        sheet: r.chunk.sheet,
        row_number: r.chunk.row_number,
        text: r.chunk.text,
      })),
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Something went wrong while answering the question." },
      { status: 500 }
    );
  }
}