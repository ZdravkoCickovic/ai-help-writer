import React, { useState, useEffect } from "react";
import clsx from "clsx";

const initialText = localStorage.getItem("writing") || "";

export default function App() {
  const [text, setText] = useState(initialText);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("summarize"); // summarize | title | continue

  useEffect(() => {
    localStorage.setItem("writing", text);
  }, [text]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  async function handleGPT() {
    setLoading(true);
    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${errorText}`);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setAiResponse(data.result || "No result returned.");
      } else {
        const rawText = await res.text();
        throw new Error(`Invalid JSON response: ${rawText}`);
      }
    } catch (err) {
      console.error("AI Error:", err);
      setAiResponse("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col",
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      )}
    >
      <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-xl font-semibold font-serif">
          AI Writing Companion
        </h1>
        <button
          onClick={() => setDark(!dark)}
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <main className="flex flex-1">
        <textarea
          className="flex-1 p-4 m-4 border rounded-md resize-none bg-white dark:bg-gray-800 dark:text-gray-100"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing here..."
        />

        <aside className="w-96 p-4 border-l border-gray-300 dark:border-gray-700 flex flex-col">
          <h2 className="font-semibold mb-2">AI Sidebar</h2>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mb-3 p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="summarize">Summarize</option>
            <option value="title">Generate Title</option>
            <option value="continue">Continue Writing</option>
          </select>

          <button
            onClick={handleGPT}
            disabled={loading || !text.trim()}
            className="mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
          >
            {loading ? "Thinking..." : "Run AI"}
          </button>

          <div className="flex-1 overflow-auto whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded">
            {aiResponse || <i>AI responses will appear here...</i>}
          </div>
        </aside>
      </main>

      <footer className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
        © 2025 AI Writing Companion — Built with React, GPT-4 & Tailwind
      </footer>
    </div>
  );
}
