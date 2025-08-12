// chat/plannerAgent.js
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { qaAgent } from "./qaAgent.js";
import { purchasingAgent } from "./purchasingAgent.js";
dotenv.config();

function getRegionCode(country) {
  const EU = ["DE", "FR", "IT", "ES", "NL", "AT", "BE"];
  return EU.includes(country) ? "EU" : "ROW";
}

function formatDateCH(d) {
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}

export async function plannerAgent({ message }) {
  if (!/prüfe|starte/i.test(message)) {
    return "Bitte gib eine Anweisung wie 'Starte Tagesprüfung der Aufträge'.";
  }

  const base = path.resolve("chat/mockdata");
  const [orders, batches, materials, components] = await Promise.all([
    fs.readFile(path.join(base, "orders.json"), "utf-8").then(JSON.parse),
    fs.readFile(path.join(base, "batches.json"), "utf-8").then(JSON.parse),
    fs.readFile(path.join(base, "materials.json"), "utf-8").then(JSON.parse),
    fs.readFile(path.join(base, "components.json"), "utf-8").then(JSON.parse)
  ]);

  const reports = [];
  let passed = 0;
  let failed = 0;

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(18,0,0,0); // „heute“ bis 18:00

  for (const order of orders) {
    const { id, material, country, components: bom } = order;
    const region = getRegionCode(country);
    const mat = materials.find(m => m.material === material);
    const rslReq = mat?.rsl?.[region] || 0; // Remaining Shelf Life (nur für Bulk relevant)

    // BULK-Check (TRIC + RSL)
    const validBatch = batches.find(
      b => b.material === material &&
           b.validCountries.includes(country) &&
           b.shelfLife >= rslReq
    );

    const lines = [];
    lines.push(`🔍 <strong>${id}</strong> (Material: <code>${material}</code> | Zielland: <code>${country}</code>)`);

    // Sammeln von Problemen
    const packagingShortages = [];
    const otherAtpShortages = [];

    // Komponenten-ATP prüfen
    for (const c of bom) {
      const stock = components.find(x => x.material === c.material)?.stock || 0;
      if (stock < c.qty) {
        if (c.material.startsWith("PACK-")) {
          packagingShortages.push({ material: c.material, have: stock, need: c.qty });
        } else {
          otherAtpShortages.push({ material: c.material, have: stock, need: c.qty });
        }
      }
    }

    // Bewertung
    let isBlocked = false;

    // 1) Bulk-Fehler → nur Planer-Report; (Global Supply ggf. separat)
    if (!validBatch) {
      lines.push(`❌ Bulk nicht verfügbar (Remaining Shelf Life < ${rslReq}% oder keine Länderfreigabe)`);
      lines.push(`➡️ Auftrag in die Zukunft umterminieren, Global Supply informieren.`);
      isBlocked = true;
    }

    // 2) Packaging-Fehlteile → QA-Prüflos + Predictive „Freigabe heute möglich?“
    for (const p of packagingShortages) {
      const qa = await qaAgent({
        orderId: id,
        material: p.material,
        inspectionLotCheck: true
      });

      lines.push(
        `❌ Packaging-Fehlteil: <code>${p.material}</code> (Bestand ${p.have} / benötigt ${p.need})`,
        `🧪 QA: Prüflos vorhanden: <strong>${qa.hasInspectionLot ? "Ja" : "Nein"}</strong>; progn. Freigabe: ~${qa.predictedReleaseHours}h`
      );

      if (qa.hasInspectionLot && qa.canReleaseToday) {
        lines.push(`⏳ QA priorisiert <strong>heute</strong> → Auftrag bleibt im Plan.`);
        // kein Blocker durch dieses Packaging-Material
      } else {
        // Einkauf informieren + verschieben
        const suggestedDate = new Date(now);
        suggestedDate.setDate(suggestedDate.getDate() + 1); // simpel: morgen
        const purchasingNote = await purchasingAgent({
          orderId: id,
          missingComponents: [`${p.material}: ${p.have}/${p.need}`],
          suggestedNewDate: formatDateCH(suggestedDate)
        });
        lines.push(
          `📦 Einkauf informiert (Nachbeschaffung): ${p.material}`,
          `🗓️ Auftrag verschieben auf: ${formatDateCH(suggestedDate)}`,
          `📣 Einkauf: ${purchasingNote}`
        );
        isBlocked = true;
      }
    }

    // 3) Sonstige ATP-Fehlteile → Einkauf
    if (otherAtpShortages.length > 0) {
      const list = otherAtpShortages.map(x => `${x.material}: ${x.have}/${x.need}`);
      const suggestedDate = new Date(now);
      suggestedDate.setDate(suggestedDate.getDate() + 1);
      const purchasingNote = await purchasingAgent({
        orderId: id,
        missingComponents: list,
        suggestedNewDate: formatDateCH(suggestedDate)
      });

      lines.push(
        `❌ ATP-Probleme Komponenten: ${list.join(", ")}`,
        `📦 Einkauf informiert (Nachbeschaffung)`,
        `🗓️ Auftrag verschieben auf: ${formatDateCH(suggestedDate)}`,
        `📣 Einkauf: ${purchasingNote}`
      );
      isBlocked = true;
    }

    if (!isBlocked) {
      lines.push(`✅ Auftrag freigegeben ✔️`);
      passed++;
    } else {
      lines.push(`🚫 Auftrag blockiert`);
      failed++;
    }

    reports.push(lines.join("<br>"));
  }

  const summary = [
    `📦 <strong>Tagesergebnis</strong>`,
    `✅ ${passed} Auftrag(e) freigegeben`,
    `🚫 ${failed} Auftrag(e) blockiert`
  ].join("<br>");

  return [
    `🎯 <strong>Tagesprüfung der Aufträge abgeschlossen</strong>`,
    `---`,
    ...reports,
    `---`,
    summary
  ].join("<br><br>");
}
