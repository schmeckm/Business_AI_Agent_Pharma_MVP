// chat/qaAgent.js
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

/**
 * QA prüft bei Packaging-Fehlteilen NUR:
 * - Gibt es Prüflos im Wareneingang?
 * - Prognose der Freigabedauer (medianHours aus Mock)
 * - canReleaseToday = hasInspectionLot && predicted <= 8h
 * Rückgabe ist ein Objekt, kein langer Fließtext.
 */
export async function qaAgent({ orderId, material, inspectionLotCheck }) {
  if (!inspectionLotCheck) {
    return {
      hasInspectionLot: false,
      predictedReleaseHours: 24,
      canReleaseToday: false,
      note: "Nur InspectionLot-Check vorgesehen."
    };
  }

  const base = path.resolve("chat/mockdata");
  const [lots, leadtimes] = await Promise.all([
    fs.readFile(path.join(base, "inspectionLots.json"), "utf-8").then(JSON.parse),
    fs.readFile(path.join(base, "qaLeadtime.json"), "utf-8").then(JSON.parse)
  ]);

  const lotEntry = lots.find(x => x.material === material);
  const hasInspectionLot = !!(lotEntry && Array.isArray(lotEntry.lots) && lotEntry.lots.length > 0);

  const ltEntry = leadtimes.find(x => x.material === material);
  const predictedReleaseHours = ltEntry?.medianHours ?? 24;

  // simple „heute“-Definition: ≤ 8h
  const canReleaseToday = hasInspectionLot && predictedReleaseHours <= 8;

  return {
    hasInspectionLot,
    predictedReleaseHours,
    canReleaseToday,
    note: canReleaseToday
      ? "QA priorisiert heute."
      : "Keine zeitnahe Freigabe möglich."
  };
}
