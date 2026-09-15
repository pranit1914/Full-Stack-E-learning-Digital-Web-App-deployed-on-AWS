import { TryCatch } from "../middlewares/TryCatch.js";

const systemPrompt =
  "You are a patient tutor for an e-learning platform. Explain concepts clearly, use short examples, and guide students without doing graded work for them. If a question is unclear, ask one brief clarifying question. Keep answers under 400 words.";

export const askTutor = TryCatch(async (req, res) => {
  const question = typeof req.body.question === "string" ? req.body.question.trim() : "";

  if (!question) {
    return res.status(400).json({ message: "Please enter a question" });
  }

  if (question.length > 2000) {
    return res.status(400).json({ message: "Question is too long" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      message: "AI tutor is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  let response;
  try {
    response = await fetch(
      process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
        }),
      },
    );
  } catch (error) {
    return res.status(503).json({ message: "AI tutor service is unreachable" });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage = data.error?.message;
    if (response.status === 429 && data.error?.code === "credit_balance_exhausted") {
      return res.status(429).json({
        message: "AI tutor credits are exhausted. Add API credits or configure a funded OpenAI key.",
      });
    }
    return res.status(502).json({
      message: providerMessage || "AI tutor could not answer right now",
    });
  }

  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    return res.status(502).json({ message: "AI tutor returned an empty answer" });
  }

  res.json({ answer });
});