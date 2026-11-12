# 💗💬 MyCycleCompanion
MyCycleCompanion is an AI-powered women’s health chatbot designed to go beyond traditional period trackers. Instead of simply logging dates, it provides calm, science-based explanations and emotional support based off of your queries.

The chatbot interprets your cycle, explains what may be happening in your body (like delayed periods, hormonal shifts, or side effects from emergency contraception), and provides gentle guidance all in simple, reassuring language.

It’s especially needed because many women experience confusion and anxiety around their reproductive health, yet most apps focus only on data tracking, not understanding.

This project fills that gap offering a local, empathetic, AI-driven companion that talks with you, not at you. 💬❤️

Access the website: https://my-cycle-companion.vercel.app

## 🧩 Project Structure
```

/ MyCycleCompanion
├── frontend/
│   ├── index.html        # Landing page
│   ├── chat.html         # Chat interface
│   ├── styles.css
│   └── script.js         # Chat logic and API call
│
├── api/
│   └── chat.js           # Vercel serverless function used by the live site
│
├── backend/              # Optional Express server for running locally
│   ├── server.js         # Express + OpenAI + Supabase backend
│   └── db/
│       └── supabase.js   # Supabase client and helper

```

---

## 🚀 Deploy on Vercel (live site)

1. Import the repo into Vercel (no build step needed). `vercel.json` serves the landing page at `/` and the chat at `/chat`, and `api/chat.js` answers `/api/chat`.
2. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` (required)
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (optional, saves chat logs)
3. Redeploy. Until `OPENAI_API_KEY` is set, the chat replies that it's being set up.

Keys live only in Vercel's settings, never in the repo. The function limits message length, reply length and messages per visitor to keep API costs in check.

## ⚙️ Run locally

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

* On the live site, chat goes through `api/chat.js`. Locally you can run `backend/server.js` instead.
* Future work/ proposed extensions:

  * User authentication
  * Personal cycle tracking
  * Health tips + community discussions

---


Built with 💕 by DominionAkinrotimi using **Node.js, Express, OpenAI API, Supabase, and TailwindCSS**.



