import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// This file serves as the Vercel serverless function entry point
// It imports the built API server and exports it as a handler

let app;

async function initializeApp() {
  if (app) return app;

  app = express();

  // Middleware
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Import and use your API routes here
  // Replace with your actual API setup
  app.get('/api', (req, res) => {
    res.json({ message: 'API is running' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

export default async function handler(req, res) {
  const app = await initializeApp();
  return new Promise((resolve, reject) => {
    app(req, res);
  });
}
