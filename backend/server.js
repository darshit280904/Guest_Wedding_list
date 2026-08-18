const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Safely configure Google DNS fallback for SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore
}



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection state & cached handler
let connPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://darshitgoyani18_db:Darshit18%40d@cluster0.ulveq2b.mongodb.net/guestlist?retryWrites=true&w=majority&appName=Cluster0';


  if (!connPromise) {
    connPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    }).then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    }).catch((err) => {
      connPromise = null;
      throw err;
    });
  }

  await connPromise;
};

// Ensure DB is connected before handling any API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }
});

// Routes (supports both /api/ route prefix and Vercel stripped routes)
app.use('/api/lots', require('./routes/lots'));
app.use('/lots', require('./routes/lots'));

app.use('/api/guests', require('./routes/guests'));
app.use('/guests', require('./routes/guests'));

app.use('/api/export', require('./routes/export'));
app.use('/export', require('./routes/export'));

// Health check
app.get(['/', '/api'], (req, res) => {
  res.json({ message: 'Marriage Guest List API is running 🎊' });
});


// Connect to MongoDB Atlas and start server when run locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to start server:', err.message);
    });
}

module.exports = app;





