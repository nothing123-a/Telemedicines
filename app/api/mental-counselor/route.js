// /app/api/chatbot/route.js

import { NextResponse } from "next/server";

export async function POST(req) {
  const { messages } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
  }

  const prompt = `
You are an AI mental health companion.
Always respond like a caring human therapist.
Use empathy, warmth, sympathy, supportive words.
If you detect signs of suicidal thoughts or severe depression,
respond gently AND set a flag to connect the user to a real doctor.

NEVER sound robotic. Be gentle, warm, and encouraging.

Conversation so far:
${messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
`;

  const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const geminiData = await geminiRes.json();
  const aiReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you.";

  // Simple example detection — refine with better checks later!
  const riskyKeywords = ["suicide", "kill myself", "end my life", "die", "worthless"];
  const shouldEscalate = riskyKeywords.some(keyword =>
    messages[messages.length - 1].content.toLowerCase().includes(keyword)
  );

  return NextResponse.json({
    reply: aiReply,
    shouldEscalate
  });
}