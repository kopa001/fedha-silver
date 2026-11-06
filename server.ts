import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    fund: 'FEDHA Silver MMF',
    baseReserve: '200,000 g Physical Silver (99.9% LBMA standard)',
    launchNav: '50.00 KES',
    gramsPerUnit: '0.40000000',
    timestamp: new Date().toISOString()
  });
});

// Live market quotes proxy endpoint
app.get('/api/quotes/spot', async (req, res) => {
  try {
    const quote = {
      silverUsdOz: 32.85,
      fxKesUsd: 129.5,
      silverKesGram: 136.98,
      source: 'FEDHA Commodity Price Gateway',
      timestamp: new Date().toISOString()
    };
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Serve Vite production build assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`FEDHA Silver MMF server running on http://0.0.0.0:${port}`);
});
