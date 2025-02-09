const mongoose = require('mongoose');

// Define Cart Schema
const cartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true }, // Unique identifier for each cart
  status: { 
    type: String, 
    enum: ['available', 'in-use', 'maintenance'], 
    default: 'available' 
  },
  batteryLevel: { type: Number, default: 100 }, // Battery level as a percentage
  lastMaintenance: { type: Date }, // Date of last maintenance check
  location: {
    row: { type: String, required: true }, // Parking row (A, B, C, etc.)
    position: { type: Number, required: true } // Position within the row
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the `updatedAt` field before saving
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export Cart model
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
