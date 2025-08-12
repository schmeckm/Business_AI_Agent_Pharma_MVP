// chat/purchasingAgent.js
import dotenv from "dotenv";
import { OpenAI } from "openai";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Gibt sehr kurze, präzise 3 Schritte zurück.
 */
export async function purchasingAgent({ orderId, missingComponents, suggestedNewDate }) {
  const systemPrompt = `
Du bist Einkaufs-Agent. Antworte maximal in 3 sehr kurzen nummerierten Schritten.
Kein Fließtext, keine Lieferantenauswahl.
`;

  const userPrompt = `
Auftrag: ${orderId}
Fehlteile:
${missingComponents.map(s => `- ${s}`).join("\n")}
Vorschlag neues Datum: ${suggestedNewDate}
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user",   content: userPrompt.trim() }
      ]
    });
    return res.choices[0].message.content.trim();
  } catch (e) {
    // Fallback ohne GPT
    return [
      "1) Sofortige Nachbestellung auslösen.",
      "2) Bestätigung/ETA anfordern.",
      `3) Auftrag auf ${suggestedNewDate} verschieben.`
    ].join("\n");
  }
}
