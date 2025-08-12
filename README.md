# Business_AI_Agent_Pharma_MVP (MVP v1 – Simplified Planner Agent)

> **This README describes the FIRST, simplified Planner Agent.**
> It does **not** include MQTT, Event Bus, Web UI, or Docker. Those come later in the improved version.

A minimal **Planner Agent** for pharma operations that validates and releases daily production orders using **mock data**.  
The agent applies rule checks (**TRIC**, **ATP**, **RMSL**) and, if needed, **escalates** to lightweight QA/Purchasing stubs.  
Designed as a small CLI tool to prove the logic before wiring any infrastructure.

---

## ✨ Scope (what’s in v1)

- **CLI only** (run from terminal)
- **Mock data only** (JSON files)
- Checks per order:
  - **TRIC** – country permissions on bulk lots
  - **ATP** – availability for bulk & components
  - **RMSL** – remaining shelf life thresholds (EU vs RoW)
- If a check fails → mark order **blocked** and suggest **QA** (quality) or **Purchasing** (material) action
- Generates a **human‑readable planning report** in the console

**Not included in v1:** MQTT, Event Bus, Web UI, REST API, Docker

---

## 🧱 Project Structure (v1)

```
planner-agent/
├─ src/
│  ├─ agents/
│  │  ├─ planningAgent.js      # main decision logic
│  │  ├─ qaAgent.js            # simple escalation stub
│  │  └─ purchasingAgent.js    # simple escalation stub
│  ├─ data/                    # mock JSON (orders, lots, stock, TRIC, RMSL)
│  ├─ services/
│  │  ├─ tricService.js        # TRIC checks
│  │  ├─ atpService.js         # ATP checks
│  │  └─ rmslService.js        # RMSL checks
│  ├─ utils/
│  │  └─ logger.js
│  └─ index.js                 # CLI entrypoint (runs the planning)
├─ tests/                      # optional unit tests
├─ .env                        # local config (DO NOT COMMIT)
├─ .gitignore
├─ package.json
└─ README.md
```

---

## ⚙️ Requirements

- Node.js **20.16.0**
- npm or pnpm

---

## 🔐 Environment (local only)

Create a local `.env` (do **not** commit secrets):

```env
NODE_ENV=development

# How many orders to release today
DUE_TODAY_COUNT=5

# RMSL thresholds (%)
RMSL_MIN_EU=60
RMSL_MIN_ROW=80

# Optional LLM assistance (leave empty if not used)
OPENAI_API_KEY=
MODEL_NAME=gpt-4o-mini
```

**Important:** Add `.env` to `.gitignore` and never commit keys.

---

## 🚀 Usage (CLI)

```bash
# Install dependencies
npm install

# Run the planner
npm run start
# or
node src/index.js

# Optional: run a specific day or mode (if supported by index.js)
# node src/index.js --today
```

**Output:** A console report listing due orders, pass/fail per rule, and suggested escalations (QA/Purchasing) for blocked cases.

---

## 🧠 Decision Flow (per order)

1. Determine FG material & **target country**
2. Select candidate **bulk lots** for the order
3. **TRIC**: verify country permissions on selected bulk
4. **ATP**: check availability for bulk & components
5. **RMSL**: validate remaining shelf life against country thresholds
6. If any check fails → mark **blocked** and add escalation suggestion
7. Otherwise → mark **released** (part of today's 5 orders)

---

## 🧩 Extensibility (next versions)

- Replace mock services with SAP S/4HANA data sources
- Add **MQTT/Event Bus** to publish planning events
- Add **REST API** and **Web UI** for visibility
- Integrate **SAP Build Process Automation** workflows

---

## 🧯 Security

- Keep `.env` local; **never** commit secrets
- If a secret was committed by mistake, remove it from history and **rotate** the key

---

## 📄 License

MIT (adjust if needed)
