import OpenAI from "openai";
import { CreateMessage } from "../types/message.types";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateMessage(data: CreateMessage) {
  const completion = await openai.chat.completions.create({
    // model: "gpt-4o-mini",
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: `Create a concise, friendly LinkedIn connection request for:
Name: ${data.name}
Title: ${data.job_title}
Company: ${data.company}
Location: ${data.location}
Summary: ${data.summary ?? "N/A"}
Context: I'm reaching out to professionals who might benefit from automating their LinkedIn outreach to scale their outbound workflows. Our platform, Outflo.io, helps sales teams and lead-gen agencies book more meetings by automating connection requests and follow-ups. Let's connect!`,
      },
    ],
  });

  return completion.choices[0].message?.content?.trim() ?? "";
}
