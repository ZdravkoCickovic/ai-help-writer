import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, mode } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ error: "Missing parameters" });
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
    return res.status(200).json({ result });
  } catch (err) {
    console.error("GPT Error:", err);
    return res.status(500).json({ error: err.message || "GPT error" });
  }
}
