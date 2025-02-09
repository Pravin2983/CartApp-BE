const Cart = require('../models/Cart');

// Get all available carts
exports.getAvailableCarts = async (req, res) => {
  try {
    const availableCarts = await Cart.find({ status: 'available' });
    res.status(200).json(availableCarts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve available carts' });
  }
};

// Get details of a specific cart by ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
};

// Update cart status (e.g., set it to 'in-use' or 'maintenance')
exports.updateCartStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'in-use', 'maintenance'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart status' });
  }
};

// Update battery level of a cart
exports.updateBatteryLevel = async (req, res) => {
  const { batteryLevel } = req.body;

  if (typeof batteryLevel !== 'number' || batteryLevel < 0 || batteryLevel > 100) {
    return res.status(400).json({ error: 'Battery level must be between 0 and 100' });
  }

  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      { batteryLevel },
      { new: true }
    );
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update battery level' });
  }
};

// Get carts by parking row (optional helper function)
exports.getCartsByRow = async (req, res) => {
  try {
    const carts = await Cart.find({ "location.row": req.params.row });
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve carts by row' });
  }
};
