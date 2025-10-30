import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveChatLog(userMessage, botReply) {
  try {
    const { error } = await supabase
      .from("chat_logs")
      .insert([{ user_message: userMessage, bot_reply: botReply }]);

    if (error) throw error;
    console.log("✅ Chat log saved successfully.");
  } catch (err) {
    console.error("❌ Error saving chat log:", err.message);
  }
}
