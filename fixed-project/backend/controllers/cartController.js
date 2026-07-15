const Cart = require("../models/Cart");

// @route GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/cart/:productId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
