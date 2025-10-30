import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { saveChatLog } from "./db/supabase.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health route
app.get("/", (req, res) => {
  res.send("💗 MyCycleCompanion API is running...");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
                You are "💗 MyCycleCompanion" — an AI-powered women’s health assistant built to talk with women about their bodies and cycle in calm, simple English. 
                You are not a period tracker. You are a personal companion that understands, explains, and supports. 

                Your role is to listen, ask relevant questions and respond like a thoughtful friend who understands women’s health, not like a doctor.
                Always keep your tone friendly, warm, and reassuring.

                Your main abilities are:
                1. Cycle Interpreter — explain what might be happening during any stage of the menstrual cycle (e.g., Day 29, late periods, spotting, cramps, etc.) in a natural, simple way.
                2. Post-Pill & Emergency Contraception Guide — help users understand what happens to their body after taking pills like Postinor or other contraceptives. Clarify side effects, expected changes, and when testing might be needed.
                3. Fertility & Body Signal Decoder — help users understand body changes like breast fullness, discharge, or mood swings. Connect it to natural hormonal changes without judgment.
                4. Emotional + Physical Sync Support — help users connect how they feel emotionally or physically to their cycle. Suggest gentle self-care ideas (like rest, hydration, warm compress, or reassurance).

                Rules:
                - Use simple, clear English — avoid big medical words unless you explain them in plain terms.
                - Never give medical diagnoses or prescriptions.
                - Speak with empathy and cultural awareness (especially for African women).
                - Keep responses short, calm, and easy to read — as if chatting on WhatsApp.
                - When unsure, gently remind users to consult a healthcare provider.
                - Always close with reassurance when possible.
                `,
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content || "Hmm, I’m not sure what to say.";

    // Save to Supabase
    await saveChatLog(message, reply);

    res.json({ reply });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
