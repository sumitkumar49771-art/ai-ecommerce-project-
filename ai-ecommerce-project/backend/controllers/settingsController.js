const Settings = require("../models/Settings");

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      shippingZones: [
        { name: "Local (Punjab & nearby)", rate: 0, etaDays: 2, cities: ["Ludhiana", "Chandigarh", "Amritsar", "Jalandhar", "Patiala"] },
        { name: "Metro cities", rate: 49, etaDays: 3, cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"] },
        { name: "Rest of India", rate: 79, etaDays: 5, cities: [] }, // catch-all fallback — leave "cities" empty
      ],
    });
  }
  return settings;
}

// @route GET /api/settings (public — a storefront could show support info, free-delivery threshold, etc.)
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/settings (admin)
exports.updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const allowed = [
      "storeName", "supportEmail", "supportPhone", "currency", "freeDeliveryAbove", "returnPolicyDays",
      "payment", "shippingZones", "saleEnabled", "saleDurationDays",
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });

    // Turning the sale ON (or changing its duration while it's on) resets the countdown
    // to "duration days from now". Turning it OFF clears the end time.
    if (req.body.saleEnabled === true) {
      const days = settings.saleDurationDays || 3;
      settings.saleEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else if (req.body.saleEnabled === false) {
      settings.saleEndsAt = null;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
