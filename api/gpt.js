import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("📥 Incoming request to /api/gpt");

  if (req.method !== "POST") {
    console.error("❌ Invalid method:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, mode } = req.body;
  console.log("📦 Payload:", { text, mode });

  if (!text || !mode) {
    console.error("❌ Missing text or mode");
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
    console.log("🧠 Sending prompt to OpenAI:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices[0].message.content.trim();
    console.log("✅ OpenAI result:", result);

    res.status(200).json({ result });
  } catch (error) {
    console.error("🔥 GPT Error:", error);
    res.status(500).json({ error: error.message || "GPT error" });
  }
}
