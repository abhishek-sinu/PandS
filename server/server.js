import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { MONGODB_URI, PORT } from './config.js';
import { upload, uploadsDir } from './config/multer.js';
import ticketRoutes from './routes/tickets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
