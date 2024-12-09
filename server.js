import express from 'express';
import cors from "cors";
import path from 'path';

import connect from "./database/connection.js";
import auth from './routes/auth.js'; // Import auth route
import book from './routes/book.js'; // Import book route

const app = express(); // Create express app
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000; // Create local build port or get prod build port

// Serve static files from the public directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', auth); // Auth route
app.use('/store', book); // Book route
app.use('/upload', express.static('upload')); // Serve uploaded files from /upload

// Fallback route for SPA (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection and server start
connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server connected on: ${PORT}`);
      });
    } catch (err) {
      console.error("Server connection failed", err);
    }
  })
  .catch((err) => {
    console.error("Invalid database connection", err);
  });
