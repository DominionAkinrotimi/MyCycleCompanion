const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatHistory = []; // recent turns, sent so replies follow the conversation

function addMessage(role, text) {
  const bubble = document.createElement("div");
  const bubbleStyle =
    role === "user"
      ? "bg-primary text-white self-end ml-auto"
      : "bg-white dark:bg-[#2b1d25] text-[#181114] dark:text-gray-200";
  bubble.className = `max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${bubbleStyle}`;

  const wrapper = document.createElement("div");
  wrapper.className = `flex flex-col ${
    role === "user" ? "items-end" : "items-start"
  }`;
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  const loadingBubble = document.createElement("div");
  loadingBubble.className =
    "max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-white dark:bg-[#2b1d25] text-gray-400 italic shadow-sm";
  loadingBubble.textContent = "Typing...";
  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex flex-col items-start";
  loadingWrapper.appendChild(loadingBubble);
  chatContainer.appendChild(loadingWrapper);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: chatHistory.slice(-8) }),
    });
    const data = await res.json();
    const reply = data.reply || "Sorry, something went wrong. Please try again.";

    chatContainer.removeChild(loadingWrapper);
    addMessage("assistant", reply);
    if (res.ok) {
      chatHistory.push({ role: "user", content: message }, { role: "assistant", content: reply });
    }
  } catch (error) {
    chatContainer.removeChild(loadingWrapper);
    addMessage("assistant", "Sorry, I couldn’t connect right now. Please try again.");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
// Quick-question buttons: send the question as if typed.
document.querySelectorAll(".suggestion").forEach((btn) => {
  btn.addEventListener("click", () => {
    userInput.value = btn.textContent;
    sendMessage();
  });
});
