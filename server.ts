import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback Indian Railways Knowledge Base
const FALLBACK_ANSWERS: Record<string, string> = {
  tatkal: "Tatkal booking opens 1 day in advance of the train origin departure date. AC classes (1A, 2A, 3A, 3E, CC, EC) open at 10:00 AM IST sharp, while Non-AC classes (Sleeper SL, 2S) open at 11:00 AM IST. Tip: Add passenger details to your IRCTC Master List 24 hours prior to 1-click fill!",
  rac: "RAC (Reservation Against Cancellation) guarantees travel on the train! Two RAC ticket holders share one Side Lower berth for sitting during daytime and sleeping. If any confirmed passenger cancels or doesn't show up, RAC 1 is automatically upgraded to full confirmed berth.",
  refund: "If your train is delayed by more than 3 hours at your boarding station, you are entitled to a 100% full refund without cancellation charges by filing a TDR (Ticket Deposit Receipt) before the actual departure of the train.",
  luggage: "Free luggage allowance on Indian Railways: 1st AC allows 70 kg, 2nd AC allows 50 kg, 3rd AC & Chair Car allow 40 kg, and Sleeper class allows 40 kg. Maximum dimensions should not exceed 100cm x 60cm x 25cm to fit safely under berths.",
  food: "You can pre-book e-catering meals via IRCTC eCatering app or dial 1323 with your 10-digit PNR. Meals from reputed brands (Haldiram, Domino's, Saravana Bhavan, Bikanervala) are delivered right to your train seat at designated halts!",
  berth: "Lower Berths (LB) are ideal for senior citizens. Middle Berths (MB) should be folded up during daytime (6:00 AM to 10:00 PM) to allow Lower and Upper berth passengers to sit comfortably, as per official IRCTC rules."
};

// Rail Travel AI Assistant endpoint
app.post('/api/rail-assistant', async (req, res) => {
  try {
    const { question, currentTrain, currentStation } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const trimmedQ = question.trim().toLowerCase();

    // Check if we can use Gemini
    if (aiClient) {
      try {
        const prompt = `You are the expert Indian Railways digital travel companion for "TRAVELLING GUIDE".
User Question: "${question}"
Context:
- Current active train: ${currentTrain || 'Not specified'}
- Current station: ${currentStation || 'Not specified'}

Provide a helpful, precise, friendly answer (under 160 words). Include practical advice, station food tips, platform etiquette, or IRCTC rules where applicable. Avoid fluff or generic boilerplate.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response && response.text) {
          res.json({ answer: response.text });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local railway knowledge base:', geminiError);
      }
    }

    // Smart local knowledge base matching
    let bestAnswer = "Indian Railways trains offer great connectivity across 7,000+ stations. For live train status, check the 'Live Tracking' tab. For station food specialties, explore the 'Route & Stations' tab. You can also dial 139 (RailMadad) for 24x7 official assistance.";
    
    for (const [key, answer] of Object.entries(FALLBACK_ANSWERS)) {
      if (trimmedQ.includes(key)) {
        bestAnswer = answer;
        break;
      }
    }

    res.json({ answer: bestAnswer });
  } catch (error) {
    console.error('Error in /api/rail-assistant:', error);
    res.status(500).json({
      answer: "Indian Railways 24x7 Universal Helpline is 139 (RailMadad). For security issues dial 182. For live status tracking, select your train in the tracking tab above."
    });
  }
});

// Live Train Running Status Endpoint (RailRadar API)
app.get('/api/train-live-status/:trainNumber', async (req, res) => {
  try {
    const rawTrainNumber = req.params.trainNumber;
    if (!rawTrainNumber) {
      res.status(400).json({
        success: false,
        configured: false,
        error: 'TRAIN_NUMBER_REQUIRED',
        message: 'Train number is required.'
      });
      return;
    }

    const trainNumber = rawTrainNumber.trim().replace(/\D/g, '');
    if (trainNumber.length < 4 || trainNumber.length > 5) {
      res.status(400).json({
        success: false,
        configured: false,
        error: 'INVALID_TRAIN_NUMBER',
        message: 'Invalid train number. Indian Railways trains have 4 or 5 digit numbers (e.g., 22436, 12952).'
      });
      return;
    }

    const apiKey = process.env.RAILRADAR_API_KEY;

    if (!apiKey) {
      res.status(200).json({
        success: false,
        configured: false,
        provider: 'RailRadar (api.railradar.in)',
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'Live GPS running status is unavailable because RAILRADAR_API_KEY is not configured on the server. Set RAILRADAR_API_KEY in your server environment variables to connect live Indian Railways GPS telemetry.'
      });
      return;
    }

    // Call RailRadar live running status endpoint (with optional journey origin date)
    const rawDate = req.query.date ? String(req.query.date).trim() : '';
    const dateParam = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `?date=${encodeURIComponent(rawDate)}` : '';
    const upstreamUrl = `https://api.railradar.in/v1/trains/${trainNumber}/live${dateParam}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        res.status(504).json({
          success: false,
          configured: true,
          provider: 'RailRadar',
          error: 'TIMEOUT',
          message: 'The railway telemetry provider took too long to respond. Please try again shortly.'
        });
        return;
      }
      res.status(502).json({
        success: false,
        configured: true,
        provider: 'RailRadar',
        error: 'NETWORK_ERROR',
        message: `Failed to connect to railway telemetry provider: ${fetchErr.message || 'Network unreachable'}`
      });
      return;
    } finally {
      clearTimeout(timeout);
    }

    if (!upstreamResponse.ok) {
      const status = upstreamResponse.status;
      if (status === 401 || status === 403) {
        res.status(200).json({
          success: false,
          configured: true,
          provider: 'RailRadar',
          error: 'AUTHENTICATION_FAILED',
          message: 'RailRadar API authentication failed. Please verify that your RAILRADAR_API_KEY is valid and active.'
        });
        return;
      }
      if (status === 429) {
        res.status(200).json({
          success: false,
          configured: true,
          provider: 'RailRadar',
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'RailRadar API rate limit or monthly quota exceeded (Free tier: 1,000 req/month).'
        });
        return;
      }
      if (status === 404) {
        res.status(200).json({
          success: false,
          configured: true,
          provider: 'RailRadar',
          error: 'TRAIN_NOT_RUNNING_TODAY',
          message: `Train #${trainNumber} is not reported active or running today in the live railway schedule.`
        });
        return;
      }

      res.status(200).json({
        success: false,
        configured: true,
        provider: 'RailRadar',
        error: 'UPSTREAM_ERROR',
        message: `Railway provider returned error status ${status}. Live running data temporarily unavailable.`
      });
      return;
    }

    const payload: any = await upstreamResponse.json();
    if (!payload || !payload.data) {
      res.status(200).json({
        success: false,
        configured: true,
        provider: 'RailRadar',
        error: 'MALFORMED_RESPONSE',
        message: 'Railway provider returned an unexpected data structure.'
      });
      return;
    }

    const data = payload.data;
    const loc = data.currentLocation || {};
    const next = data.nextStop || data.nextStation || {};

    res.json({
      success: true,
      configured: true,
      provider: 'RailRadar',
      trainNumber: data.trainNumber || trainNumber,
      trainName: data.trainName || '',
      status: data.status || 'running',
      delayMinutes: typeof data.delayMinutes === 'number' ? data.delayMinutes : (data.delay || 0),
      currentLocation: {
        stationCode: loc.stationCode || loc.code || '',
        stationName: loc.stationName || loc.name || '',
        speed: typeof loc.speed === 'number' ? loc.speed : null,
        statusDescription: loc.statusDescription || loc.status || data.statusText || 'In Transit',
        latitude: typeof loc.latitude === 'number' ? loc.latitude : null,
        longitude: typeof loc.longitude === 'number' ? loc.longitude : null,
        updatedAt: loc.updatedAt || payload.meta?.timestamp || new Date().toISOString()
      },
      nextStop: {
        stationCode: next.stationCode || next.code || '',
        stationName: next.stationName || next.name || '',
        eta: next.eta || next.arrivalTime || '',
        platform: String(next.platform || ''),
        distanceRemainingKm: typeof next.distanceRemainingKm === 'number' ? next.distanceRemainingKm : null
      },
      lastUpdated: payload.meta?.timestamp || new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching live train status:', error);
    res.status(500).json({
      success: false,
      configured: true,
      provider: 'RailRadar',
      error: 'SERVER_ERROR',
      message: error?.message || 'Internal server error while fetching train running status.'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚂 Travelling Guide server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
