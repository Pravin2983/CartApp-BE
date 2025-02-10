// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config(); // Load environment variables from .env file

// const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart";
// const PORT = process.env.PORT || 5000;

// const authRoutes = require('./routes/authRoutes');
// const cartRoutes = require('./routes/cartRoutes');

// const app = express();

// // CORS middleware configuration
// const corsOptions = {
//   origin: '*', // Temporarily allow all origins (use specific origins for production)
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type'],
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// // Define routes
// app.use('/api/auth', authRoutes);
// app.use('/api/carts', cartRoutes);

// // Test route for server health check
// app.get('/', (req, res) => {
//   res.send('Server is running');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong!');
// });

// // Connect to MongoDB and start the server
// mongoose.connect(DB_URL)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     // Start the server after a successful DB connection
//     app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB connection failed:', error.message);
//   });


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables

const DB_URL = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!DB_URL) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  process.exit(1); // Exit if no DB URL is found
}

const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// CORS middleware configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*', // Allow frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/carts', cartRoutes);

// Test route for server health check
app.get('/', (req, res) => {
  res.send({ message: 'Server is running successfully 🚀' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Connect to MongoDB and start the server
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔴 Closing server...');
  await mongoose.disconnect();
  process.exit(0);
});
