const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables from .env file

const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart";
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// CORS middleware configuration
const corsOptions = {
  origin: '*', // Temporarily allow all origins (use specific origins for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/carts', cartRoutes);

// Test route for server health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Connect to MongoDB and start the server
mongoose.connect(DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after a successful DB connection
    app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });
