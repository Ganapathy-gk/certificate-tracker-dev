const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Correct imports for routes
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://YOUR_NETLIFY_SITE_NAME.netlify.app' // Remember to replace this later
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Correctly mounted routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/', (req, res) => {
  res.send('Certificate Tracker API is running!');
});

const PORT = process.env.PORT || 10000; // Render uses port 10000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});