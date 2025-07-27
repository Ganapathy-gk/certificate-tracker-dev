const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

dotenv.config();
connectDB();

const app = express();

// =================================================================
// Updated CORS Configuration for Deployment
// =================================================================
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend for testing
  'https://YOUR_NETLIFY_SITE_NAME.netlify.app' // << IMPORTANT: Replace this placeholder later
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
// =================================================================

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/', (req, res) => {
  res.send('Certificate Tracker API is running!');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});