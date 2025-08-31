const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateNewsHeadline(baseLine, weather, pollution, sentiment) {
  const weatherInfo = weather
    ? `Weather: ${weather.description || "Unknown"} (${weather.temperature ?? "?"}°C)`
    : "Weather: Unknown";

  const airInfo = pollution
    ? `Air Quality: PM2.5=${pollution.pm2_5 ?? "?"} (${pollution.pm25_category || "Unknown"})`
    : "Air Quality: Unknown";

  const prompt = `
You are a journalist. Write a concise news headline in English (max 12 words).
Sentiment: ${sentiment}
- If NEGATIVE, highlight the issue factually, no exaggeration.
- If POSITIVE, highlight the good aspect.

Message: "${baseLine}"
${weatherInfo}
${airInfo}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // 🔑 dùng model này thay vì gpt-5-nano
      messages: [
        {
          role: "system",
          content: "You are a journalist AI that writes short, catchy, clear headlines.",
        },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 60,
    });

    const headline = response?.choices?.[0]?.message?.content?.trim() || baseLine;
    return headline;
  } catch (err) {
    console.error("OpenAI failed:", err.message);
    return baseLine;
  }
}

module.exports = { generateNewsHeadline };