// chat/globalSupplyChainAgent.js
import dotenv from "dotenv";
import { OpenAI } from "openai";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function globalSupplyChainAgent({ orderId, material, country }) {
  const prompt = `
Du bist der Global Supply Chain Agent in einem Pharmawerk.
Auftrag: ${orderId}
Material (Bulk): ${material}
Zielland: ${country}
Es ist aktuell keine Bulk‐Charge verfügbar, die das Zielland abdeckt.
Schlage kurz (max. 3 Schritte) vor, wie du Nachschub sicherstellst und den Auftrag auf morgen oder später terminierst.
`;
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.5,
    messages: [{ role: "user", content: prompt.trim() }]
  });
  return res.choices[0].message.content.trim();
}
