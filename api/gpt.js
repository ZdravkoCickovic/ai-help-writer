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
    prompt = `Summarize the following text in a concise paragraph:\n\n${text}`;
  } else if (mode === "title") {
    prompt = `Generate a creative, catchy title for this text:\n\n${text}`;
  } else if (mode === "continue") {
    prompt = `Continue writing the following text in the same style:\n\n${text}`;
  } else {
    prompt = text;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices[0].message.content.trim();
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || "GPT error" });
  }
}
