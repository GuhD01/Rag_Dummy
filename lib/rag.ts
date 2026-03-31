import fs from "fs";
import path from "path";

export type ChunkRecord = {
  id: string;
  sheet: string;
  row_number: number;
  text: string;
  embedding: number[];
};

export type RetrievedChunk = {
  score: number;
  chunk: ChunkRecord;
};

let cachedIndex: ChunkRecord[] | null = null;

export function loadIndex(): ChunkRecord[] {
  if (cachedIndex) return cachedIndex;

  const filePath = path.join(process.cwd(), "data", "openpages-index.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedIndex = JSON.parse(raw) as ChunkRecord[];
  return cachedIndex;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding length mismatch.");
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (!denom) return 0;

  return dot / denom;
}

export function retrieveTopK(
  queryEmbedding: number[],
  topK = 5
): RetrievedChunk[] {
  const index = loadIndex();

  const scored = index.map((chunk) => ({
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
    chunk,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

export function formatContext(results: RetrievedChunk[]): string {
  return results
    .map(
      (item, i) =>
        `[Context ${i + 1}]
Similarity: ${item.score.toFixed(4)}
Sheet: ${item.chunk.sheet}
Row: ${item.chunk.row_number}
Text: ${item.chunk.text}`
    )
    .join("\n\n");
}