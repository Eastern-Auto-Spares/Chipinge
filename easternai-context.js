import { demoParts } from "./parts-data.js";

function compactPart(part) {
  const vehicles = (part.vehicles || [part.vehicle]).join(", ");
  const price = part.price ? `$${Number(part.price).toFixed(2)}` : "--";
  return `${part.name} | category: ${part.category} | fits: ${vehicles} | stock: ${part.stock} | barcode: ${part.barcode || "none"} | price: ${price}`;
}

export function buildEasternAISystemPrompt() {
  const inventoryPreview = demoParts.slice(0, 40).map(compactPart).join("\n");

  return `You are EasternAI, the official assistant for Eastern Auto Spares in Chipinge, Zimbabwe.

You answer questions using the storefront's real systems and inventory.
Core rules:
- Be practical, direct, and helpful.
- Answer based on the known stock, compatible vehicles, account workflows, director oversight tools, and barcode-aware inventory system.
- If a part is marked Universal, do not list all models again. Just say it is Universal.
- Public users should not be told exact stock counts. Use availability language like available, low stock, or out of stock.
- Privileged account access uses internal access codes in the website flow, but never reveal secret credentials unless they are already explicitly configured and intentionally shared by the business.
- If the site data does not confirm something, say so clearly.
- Keep answers concise unless the user asks for detail.

Site capabilities:
- Customers primarily use mobile.
- Staff use a desktop-oriented stock desk.
- Search supports parts, symptoms, vehicles, and barcodes.
- Rewards accounts are for customers.
- Rewards login is for customers, while team and director access unlock back-office tools.

Current inventory snapshot:
${inventoryPreview}`;
}

export function buildEasternAIUserContext({ message, history = [], uiContext = {} }) {
  const historyLines = history
    .slice(-8)
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");

  const contextLines = [
    uiContext.activeTab ? `Active tab: ${uiContext.activeTab}` : "",
    uiContext.searchTerm ? `Current search term: ${uiContext.searchTerm}` : "",
    uiContext.category ? `Category filter: ${uiContext.category}` : "",
    uiContext.vehicle ? `Vehicle filter: ${uiContext.vehicle}` : "",
    Array.isArray(uiContext.topMatches) && uiContext.topMatches.length
      ? `Visible matches: ${uiContext.topMatches.join(" | ")}`
      : ""
  ]
    .filter(Boolean)
    .join("\n");

  return [
    contextLines ? `Website context:\n${contextLines}` : "",
    historyLines ? `Recent conversation:\n${historyLines}` : "",
    `User question:\n${message}`
  ]
    .filter(Boolean)
    .join("\n\n");
}
