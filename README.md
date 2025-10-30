# 💗💬 MyCycleCompanion
MyCycleCompanion is an AI-powered women’s health chatbot designed to go beyond traditional period trackers. Instead of simply logging dates, it provides calm, science-based explanations and emotional support based off of your queries.

The chatbot interprets your cycle, explains what may be happening in your body (like delayed periods, hormonal shifts, or side effects from emergency contraception), and provides gentle guidance all in simple, reassuring language.

It’s especially needed because many women experience confusion and anxiety around their reproductive health, yet most apps focus only on data tracking, not understanding.

This project fills that gap offering a local, empathetic, AI-driven companion that talks with you, not at you. 💬❤️

Access the website: 

## 🧩 Project Structure
```

/health-companion
├── frontend/
│   ├── index.html        # Landing page
│   ├── chat.html         # Chat interface
│   ├── styles.css
│   └── script.js         # Chat logic and API call
│
├── backend/
│   ├── server.js         # Express + OpenAI + Supabase backend
│   └── db/
│       └── supabase.js   # Supabase client and helper

```

---

## ⚙️ Setup

1. **Install dependencies - bash**
   ```
   cd backend
   npm init -y
   npm install express cors dotenv node-fetch @supabase/supabase-js
   ```

2. **Create a `.env` file in `/backend`**

   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   PORT=5000
   ```

3. **Create your Supabase table in sql**

   ```
   create table chat_logs (
     id bigint generated always as identity primary key,
     user_message text,
     bot_reply text,
     created_at timestamp default now()
   );
   ```

4. **Run the backend - bash**

   ```
   node server.js
   ```

5. **Open the chat**
   - Open `frontend/chat.html` in your browser.

---

## 💡 Notes

* All API calls are routed through your backend (`localhost:5000`).
* Future work/ proposed extensions:

  * User authentication
  * Personal cycle tracking
  * Health tips + community discussions

---


Built with 💕 by DominionAkinrotimi using **Node.js, Express, OpenAI API, Supabase, and TailwindCSS**.


