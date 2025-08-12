// chat/technicalManagerAgent.js
import dotenv from "dotenv";
import { OpenAI } from "openai";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function technicalManagerAgent({ summaryReport }) {
  const systemPrompt = `
Du bist der Technical Manager in einem Pharmawerk.
Antworte in **genau drei kurzen** nummerierten Sätzen:
1) Kritisches technisches Risiko (max. 1 Satz)
2) Compliance‐Hinweis (max. 1 Satz)
3) Freigabeempfehlung: Ja oder Nein (max. 1 Satz)
Vermeide detailreiche Handlungsempfehlungen (z. B. Lieferantenauswahl).
`;

  const userPrompt = `
Hier ist die Tagesübersicht aller Aufträge:
${summaryReport}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt.trim() },
      { role: "user",   content: userPrompt.trim() }
    ]
  });

  return res.choices[0].message.content.trim();
}
