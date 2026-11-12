// Lesson library helpers. Files starting with "_" in /api are not routes on Vercel.
const { lessons } = require("../data/lessons.json");

const URGENT_TERMS = ["faint", "fainted", "fainting", "dizzy", "soaking every hour", "every hour", "severe pain",
  "unbearable", "can't stand", "cannot stand", "fever", "ectopic", "kill myself", "suicid", "harm myself",
  "end my life", "positive test and pain", "one side pain", "shoulder pain"];

function normalise(text) {
  return " " + String(text).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ") + " ";
}

function score(lesson, msg) {
  let s = 0;
  for (const k of lesson.keywords) {
    const key = normalise(k);
    if (msg.includes(key)) s += key.trim().includes(" ") ? 3 : 2;   // phrases count more
    else if (key.trim().length > 4 && msg.includes(key.trim())) s += 1; // partial word, e.g. "cramping"
  }
  if (s === 0) return 0; // title words only break ties between lessons that already match
  for (const w of normalise(lesson.title).trim().split(" ")) {
    if (w.length > 4 && msg.includes(" " + w)) s += 1;
  }
  return s;
}

// Returns up to `n` lessons that best match the message, best first.
function findLessons(message, n = 2) {
  const msg = normalise(message);
  const ranked = lessons
    .map((l) => ({ l, s: score(l, msg) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.l);
  const urgent = URGENT_TERMS.some((t) => msg.includes(t));
  if (urgent) {
    const u = lessons.find((l) => l.id === "urgent");
    return [u, ...ranked.filter((l) => l.id !== "urgent")].slice(0, n);
  }
  return ranked.slice(0, n);
}

// "I'm on day 29", "day 40 of my cycle" -> a short explanation for that cycle day.
function cycleDayNote(message) {
  const m = String(message).toLowerCase().match(/\bday\s*(\d{1,2})\b/);
  if (!m) return null;
  const d = Number(m[1]);
  if (d < 1 || d > 90) return null;
  if (d <= 5) return `Day ${d} is usually during your period, when the womb lining sheds. Cramps and tiredness are common now.`;
  if (d <= 11) return `Day ${d} is usually the follicular phase: bleeding has stopped, oestrogen is rising and an egg is maturing. Many people feel more energy now.`;
  if (d <= 17) return `Day ${d} is around the time many people ovulate (about 14 days before the next period). You may notice clear, stretchy discharge.`;
  if (d <= 28) return `Day ${d} is usually the luteal phase, after ovulation. Breast tenderness, bloating and mood changes are common as your period gets closer.`;
  if (d <= 35) return `Day ${d} is still within a normal cycle length for many adults (21 to 35 days). If your cycles are usually shorter, your period may be a little late.`;
  return `Day ${d} is longer than a typical cycle (21 to 35 days), so your period is likely late.`;
}

function lessonReply(message) {
  const day = cycleDayNote(message);
  let found = findLessons(message, 2);
  if (day && !found.length) found = lessons.filter((l) => l.id === (/\bday\s*(3[6-9]|[4-9]\d)\b/i.test(message) ? "late-period" : "cycle-phases"));
  if (!found.length) {
    return {
      reply: "I'm here to help with your cycle. I can explain things like late periods, cramps, spotting, discharge, ovulation, the emergency pill, PMS and heavy bleeding. Try asking, for example, \"Why is my period late?\" or \"I took Postinor, what should I expect?\"",
      lessons: [],
    };
  }
  const main = found[0];
  const parts = [];
  if (day) parts.push(day);
  parts.push(`${main.title}\n${main.summary}`);
  const urgent = main.id === "urgent";
  const tips = urgent ? main.tips : main.tips.slice(0, 3);
  parts.push((urgent ? "Get help straight away if you have:\n" : "Tips:\n") + tips.map((t) => "• " + t).join("\n"));
  parts.push((urgent ? "What to do:\n" : "See a doctor if:\n") + main.see_doctor.slice(0, 3).map((t) => "• " + t).join("\n"));
  if (found[1]) parts.push(`You might also want to read "${found[1].title}" in the Lessons page.`);
  return { reply: parts.join("\n\n"), lessons: found.map((l) => l.id) };
}

// Compact notes for the AI, so its answers stay consistent with the lessons.
function lessonNotes(message) {
  const found = findLessons(message, 2);
  const day = cycleDayNote(message);
  if (!found.length && !day) return "";
  const lines = ["Reference notes from the MyCycleCompanion lesson library (use them; don't contradict them):"];
  if (day) lines.push(day);
  for (const l of found) {
    lines.push(`# ${l.title}\n${l.summary}\nTips: ${l.tips.join(" ")}\nSee a doctor if: ${l.see_doctor.join("; ")}`);
  }
  return lines.join("\n\n");
}

module.exports = { findLessons, lessonReply, lessonNotes, cycleDayNote };
