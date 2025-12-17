import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not configured");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates concise, informative summaries of news articles. Summarize the key points in 2-3 sentences.",
        },
        {
          role: "user",
          content: `Summarize this article in 2-3 sentences:\n\n${content.substring(0, 3000)}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Unable to generate summary";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate summary");
  }
}


