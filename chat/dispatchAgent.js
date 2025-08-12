// chat/dispatchAgent.js
import { plannerAgent }              from "./plannerAgent.js";
import { qaAgent }                   from "./qaAgent.js";
import { purchasingAgent }           from "./purchasingAgent.js";
import { globalSupplyChainAgent }    from "./globalSupplyChainAgent.js";
import { technicalManagerAgent }     from "./technicalManagerAgent.js";

export async function dispatchAgent({ userId, role, message }) {
  switch (role) {
    case "Planner":
      // Planner-Agent erwartet nur die Nachricht
      return await plannerAgent({ message });

    case "QA":
      // QA-Agent im direkten Chat-Modus: message wird als Freitext genutzt
      return await qaAgent({
        orderId:       "QA-Chat",
        material:      "N/A",
        requiredRMSL:  0,
        country:       "N/A",
        actualRMSL:    0
      });

    case "Purchasing":
      // Purchasing-Agent im direkten Chat-Modus: message als einzelne Komponente
      return await purchasingAgent({
        orderId:           "Purchasing-Chat",
        missingComponents: [message]
      });

    case "GlobalSupply":
      // Global Supply Chain Agent im direkten Chat-Modus
      return await globalSupplyChainAgent({
        orderId:  "Global-Chat",
        material: "N/A",
        country:  "N/A"
      });

    case "Technical":
      // Technical Manager Agent erwartet die Tageszusammenfassung als message
      return await technicalManagerAgent({
        summaryReport: message
      });

    default:
      return `❗ Rolle "${role}" nicht erkannt.`;
  }
}
