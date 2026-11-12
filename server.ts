import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support base64 image uploads up to 25MB
app.use(express.json({ limit: '25mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Vision Dartboard Detection API
app.post('/api/scan-dartboard', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
        code: 'API_KEY_MISSING'
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are DartVision AI, an expert computer vision system for standard London/clock dartboards.
Standard clock dartboard numbering clockwise starting from top (12 o'clock):
20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5.

Rings & Segment codes:
- "IB" : Inner Bullseye / Double Bull (central red circle = 50 pts)
- "OB" : Outer Bullseye / Single Bull (surrounding green ring = 25 pts)
- "T1" to "T20" : Treble / Triple ring (narrow inner ring, 3x face value)
- "D1" to "D20" : Double ring (narrow outer ring, 2x face value)
- "S1" to "S20" : Single wedge areas (outer single wedge between double & triple, or inner single wedge between triple & bullseye = 1x face value)
- "MISS" : Dart off the board or outside the double wire / wire bounce-out

Analyze the provided photo of the dartboard. Identify where up to 3 darts have landed.
Return an array of the 3 dart segment codes in the order thrown (or detected), confidence level ("high", "medium", "low"), and a brief 1-2 sentence description notes in notes. If fewer than 3 darts are visible or detected, fill remaining with MISS or detected darts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Analyze this dartboard photo. Identify the segments for up to 3 darts currently lodged in the board. Format using standard dart segment codes (e.g. T20, S20, D16, S5, IB, OB, MISS).',
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            darts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of up to 3 detected dart segment notations (e.g. ["T20", "S20", "D5"])',
            },
            confidence: {
              type: Type.STRING,
              description: 'Confidence level: "high", "medium", or "low"',
            },
            notes: {
              type: Type.STRING,
              description: 'Short diagnostic note describing the darts detected',
            },
          },
          required: ['darts', 'confidence', 'notes'],
        },
      },
    });

    const text = response.text || '{}';
    let parsed: { darts: string[]; confidence: string; notes: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        darts: ['MISS', 'MISS', 'MISS'],
        confidence: 'low',
        notes: 'Could not parse Vision AI response. Please select segments manually.',
      };
    }

    // Ensure darts array is valid strings and normalized
    if (!Array.isArray(parsed.darts)) {
      parsed.darts = [];
    }
    parsed.darts = parsed.darts.slice(0, 3).map((d) => (typeof d === 'string' ? d.toUpperCase().trim() : 'MISS'));

    // Pad to 3 if less
    while (parsed.darts.length < 3) {
      parsed.darts.push('MISS');
    }

    return res.json({
      darts: parsed.darts,
      confidence: parsed.confidence || 'medium',
      notes: parsed.notes || 'Dart detection complete',
    });
  } catch (error: any) {
    console.error('Gemini Vision scan error:', error);
    return res.status(500).json({
      error: error?.message || 'Error processing image with Vision AI',
      code: error?.status || 'VISION_API_ERROR',
      fallback: true,
    });
  }
});

// Vite middleware for dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
