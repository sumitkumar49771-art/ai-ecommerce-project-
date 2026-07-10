const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Used by the AI recommendation engine to personalize results
    browsingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    preferredCategories: [{ type: String }],

    // Saved shipping addresses
    addresses: [
      {
        label: { type: String, default: "Home" },
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Forgot-password flow: a random token is generated, hashed, and stored
    // here with an expiry; the raw (unhashed) token is what's emailed to the
    // user so a DB leak alone can't be used to reset accounts.
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
