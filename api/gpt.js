import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text, mode } = body;

  if (!text || !mode) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let prompt;
  if (mode === "summarize") {
    prompt = `Summarize the following text:\n\n${text}`;
  } else if (mode === "title") {
    prompt = `Generate a creative title for:\n\n${text}`;
  } else if (mode === "continue") {
    prompt = `Continue writing this:\n\n${text}`;
  } else {
    prompt = text;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices[0].message.content.trim();

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GPT Error:", err);
    return new Response(JSON.stringify({ error: err.message || "GPT error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
