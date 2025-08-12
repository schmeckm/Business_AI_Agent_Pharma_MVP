// server.js
import dotenv from "dotenv";
dotenv.config(); // ⬅️ GANZ OBEN, lädt .env

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dispatchAgent } from "./chat/dispatchAgent.js";

const app = express();
const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ DEBUG: Key anzeigen
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY ist nicht gesetzt! Bitte .env prüfen.");
  process.exit(1); // Beendet das Programm
} else {
  console.log("✅ OPENAI_API_KEY wurde geladen.");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const { userId, role, message } = req.body;
  try {
    const reply = await dispatchAgent({ userId, role, message });
    res.json({ reply });
  } catch (err) {
    console.error("❌ Fehler im Agenten:", err.message);
    res.status(500).json({ reply: "Ein Fehler ist aufgetreten: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf: http://localhost:${PORT}`);
});
