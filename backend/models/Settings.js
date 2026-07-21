const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "ShopAI" },
    supportEmail: { type: String, default: "support@shopai.com" },
    supportPhone: { type: String, default: "+91 62806 43874" },
    supportAddress: { type: String, default: "Golden Avenue, Amritsar, Punjab, India - 143001" },
    supportHours: { type: String, default: "Mon - Sat, 9:00 AM - 7:00 PM IST" },
    currency: { type: String, default: "INR" },
    freeDeliveryAbove: { type: Number, default: 499 },
    returnPolicyDays: { type: Number, default: 7 },
    saleEnabled: { type: Boolean, default: false },
    saleDurationDays: { type: Number, default: 3 },
    saleEndsAt: { type: Date, default: null },

    // Platform commission taken from every unit sold by a marketplace
    // seller (a user who listed their own product via the Seller Hub).
    // Products added by the admin through the catalog have no seller, so
    // no commission applies to them — the platform keeps 100% of those.
    sellerCommissionRate: { type: Number, default: 10 }, // percent, e.g. 10 = 10%
    payment: {
      codEnabled: { type: Boolean, default: true },
      upiEnabled: { type: Boolean, default: true },
      cardEnabled: { type: Boolean, default: true },
    },
    shippingZones: [
      {
        name: String,
        rate: Number,
        etaDays: Number,
        cities: [String], // which cities/towns belong to this zone (case-insensitive match against the delivery address)
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
