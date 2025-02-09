const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const Cart = require('../models/Cart'); // Directly import the Cart model

// Route to get all available carts
router.get('/available', cartController.getAvailableCarts);

// Route to get details of a specific cart by ID
router.get('/:id', cartController.getCartById);

// Route to update the status of a cart (e.g., 'available', 'in-use', 'maintenance')
router.patch('/:id/status', cartController.updateCartStatus);

// Route to update the battery level of a cart
router.patch('/:id/battery', cartController.updateBatteryLevel);

// Optional route to get carts by parking row
router.get('/row/:row', cartController.getCartsByRow);

// Temporary route to add sample carts (for initial testing)
router.post('/addSampleCarts', async (req, res) => {
  try {
    const sampleCarts = [
      { cartId: 'CART A', status: 'available', batteryLevel: 80, location: { row: 'A', position: 1 } }
      // Uncomment the other carts as needed
      // { cartId: 'CART002', status: 'in-use', batteryLevel: 50, location: { row: 'B', position: 2 } },
      // { cartId: 'CART003', status: 'available', batteryLevel: 70, location: { row: 'A', position: 3 } }
    ];

    const createdCarts = await Cart.insertMany(sampleCarts); // Use Cart model directly
    res.status(201).json(createdCarts);
  } catch (error) {
    console.error('Error adding sample carts:', error); // Log detailed error
    res.status(500).json({ error: 'Failed to add sample carts' });
  }
});

module.exports = router;
