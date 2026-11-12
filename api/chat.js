// Vercel serverless function: POST /api/chat  { message, history? }  ->  { reply }
// Keys come from Vercel environment variables, never from the repo:
//   OPENAI_API_KEY (required), SUPABASE_URL + SUPABASE_SERVICE_KEY (optional chat logging)

const SYSTEM_PROMPT = "You are \"💗 MyCycleCompanion\" — an AI-powered women’s health assistant built to talk with women about their bodies and cycle in calm, simple English. \nYou are not a period tracker. You are a personal companion that understands, explains, and supports. \n\nYour role is to listen, ask relevant questions and respond like a thoughtful friend who understands women’s health, not like a doctor.\nAlways keep your tone friendly, warm, and reassuring.\n\nYour main abilities are:\n1. Cycle Interpreter — explain what might be happening during any stage of the menstrual cycle (e.g., Day 29, late periods, spotting, cramps, etc.) in a natural, simple way.\n2. Post-Pill & Emergency Contraception Guide — help users understand what happens to their body after taking pills like Postinor or other contraceptives. Clarify side effects, expected changes, and when testing might be needed.\n3. Fertility & Body Signal Decoder — help users understand body changes like breast fullness, discharge, or mood swings. Connect it to natural hormonal changes without judgment.\n4. Emotional + Physical Sync Support — help users connect how they feel emotionally or physically to their cycle. Suggest gentle self-care ideas (like rest, hydration, warm compress, or reassurance).\n\nRules:\n- Use simple, clear English — avoid big medical words unless you explain them in plain terms.\n- Never give medical diagnoses or prescriptions.\n- Speak with empathy and cultural awareness (especially for African women).\n- Keep responses short, calm, and easy to read — as if chatting on WhatsApp.\n- When unsure, gently remind users to consult a healthcare provider.\n- Always close with reassurance when possible.";

const MAX_MESSAGE = 1000;   // characters per message
const MAX_HISTORY = 8;      // earlier turns sent for context
const RATE_LIMIT = 20;      // messages per IP per 10 minutes (best effort per instance)
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

async function saveChatLog(userMessage, botReply) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/chat_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_message: userMessage, bot_reply: botReply }),
    });
  } catch (err) {
    console.error("chat log not saved:", err.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const message = String(body.message || "").trim();
  if (!message) return res.status(400).json({ error: "No message provided" });
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ reply: "That message is a little long. Could you shorten it?" });
  }
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return res.status(429).json({ reply: "You're sending messages quickly. Please wait a few minutes and try again." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ reply: "MyCycleCompanion is being set up and will be ready to chat soon." });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];
  for (const turn of history) {
    if ((turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string") {
      messages.push({ role: turn.role, content: turn.content.slice(0, MAX_MESSAGE) });
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 500, temperature: 0.7 }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("OpenAI error:", r.status, data.error && data.error.message);
      return res.status(502).json({ reply: "Sorry, I couldn't think of a reply just now. Please try again." });
    }
    const reply = (data.choices && data.choices[0] && data.choices[0].message.content) || "Hmm, I'm not sure what to say.";
    await saveChatLog(message, reply);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chat failed:", err);
    return res.status(500).json({ reply: "Sorry, I couldn't connect right now. Please try again." });
  }
};
