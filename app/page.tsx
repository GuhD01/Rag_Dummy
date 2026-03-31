"use client";

import { FormEvent, useState } from "react";

type Retrieved = {
  score: number;
  sheet: string;
  row_number: number;
  text: string;
};

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [retrieved, setRetrieved] = useState<Retrieved[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnswer("");
    setRetrieved([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setAnswer(data.answer);
      setRetrieved(data.retrieved || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "40px 20px 80px"
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>
        OpenPages Dummy Policy RAG
      </h1>
      <p style={{ color: "#b8c2d6", marginBottom: 28 }}>
        Ask a question about the dummy policy workbook and inspect retrieved rows.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: What must researchers disclose before using AI?"
          rows={5}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #293247",
            background: "#121933",
            color: "#f4f7fb",
            resize: "vertical"
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            marginTop: 12,
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#7c9cff",
            color: "#08101f",
            fontWeight: 700
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <div
          style={{
            background: "#3a1320",
            border: "1px solid #80304a",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20
          }}
        >
          {error}
        </div>
      )}

      {answer && (
        <section
          style={{
            background: "#121933",
            border: "1px solid #293247",
            padding: 20,
            borderRadius: 16,
            marginBottom: 24
          }}
        >
          <h2 style={{ marginTop: 0 }}>Answer</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{answer}</div>
        </section>
      )}

      {retrieved.length > 0 && (
        <section
          style={{
            background: "#121933",
            border: "1px solid #293247",
            padding: 20,
            borderRadius: 16
          }}
        >
          <h2 style={{ marginTop: 0 }}>Retrieved Chunks</h2>
          {retrieved.map((item, index) => (
            <div
              key={`${item.sheet}-${item.row_number}-${index}`}
              style={{
                padding: "14px 0",
                borderTop: index === 0 ? "none" : "1px solid #24304f"
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {index + 1}. {item.sheet} — Row {item.row_number}
              </div>
              <div style={{ color: "#9fb0cf", marginBottom: 6 }}>
                Score: {item.score.toFixed(4)}
              </div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {item.text}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}