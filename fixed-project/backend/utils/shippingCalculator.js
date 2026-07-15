const Settings = require("../models/Settings");

/**
 * Works out the shipping cost, delivery ETA and matched zone name for an order,
 * based on the admin-configured Shipping Settings (zones + free-delivery threshold).
 *
 * Matching rule: the customer's city is compared (case-insensitive, trimmed) against
 * each zone's configured "cities" list, in the order zones were saved. The first zone
 * whose city list contains a match wins. If nothing matches, the LAST zone in the list
 * is used as a catch-all fallback (by convention this is meant to be a zone like
 * "Rest of India" with an empty cities list).
 */
async function getShippingQuote(city, subtotal) {
  const settings = await Settings.findOne().lean();
  const zones = (settings && settings.shippingZones) || [];
  const freeDeliveryAbove = settings && typeof settings.freeDeliveryAbove === "number" ? settings.freeDeliveryAbove : 499;

  const cityNorm = (city || "").trim().toLowerCase();
  let matchedZone = null;

  for (const zone of zones) {
    const cities = (zone.cities || []).map((c) => (c || "").trim().toLowerCase()).filter(Boolean);
    if (cities.includes(cityNorm)) {
      matchedZone = zone;
      break;
    }
  }

  // No specific city match — fall back to the last configured zone (catch-all)
  if (!matchedZone && zones.length) {
    matchedZone = zones[zones.length - 1];
  }

  const zoneName = matchedZone ? matchedZone.name : "Standard Delivery";
  const etaDays = matchedZone ? matchedZone.etaDays : 5;
  const baseRate = matchedZone ? matchedZone.rate || 0 : 0;

  const qualifiesForFreeDelivery = freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove;
  const shippingCost = qualifiesForFreeDelivery ? 0 : baseRate;

  return {
    shippingCost,
    etaDays,
    zoneName,
    freeDeliveryAbove,
    qualifiesForFreeDelivery,
  };
}

module.exports = { getShippingQuote };
