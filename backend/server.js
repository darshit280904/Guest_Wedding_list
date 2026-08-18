const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/lots', require('./routes/lots'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Marriage Guest List API is running 🎊' });
});

// Connect to MongoDB Atlas and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
