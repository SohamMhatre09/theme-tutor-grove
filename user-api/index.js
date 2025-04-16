import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';

// Load environment variables
dotenv.config();
console.log('Environment variables loaded:', {
  MONGODB_URI: import.meta.env.MONGODB_URI,
  PORT: import.meta.env.PORT
});

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/student/assignments', assignmentRoutes); 

app.get('/', (req, res) => {
  res.send('Welcome to the User API');
});

// Server setup
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});