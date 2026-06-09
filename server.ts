import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial server parser
  app.use(express.json());

  // Initialize Gemini Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // 1. STORY GENERATOR API ENDPOINT
  app.post('/api/story/generate', async (req, res) => {
    try {
      const client = getGeminiClient();
      const matchResult = req.body;

      if (!client) {
        // Safe fallbacks with high immersion when API is not configured yet
        return res.status(200).json({
          news_article: `[DEMO MODE: Gemini API key is missing. Please add GEMINI_API_KEY to your Secrets context.]\n\nJordi's debut performance in the neon-washed championship arena leaves fans shouting for more! Playing for ${matchResult.currentTeam || 'Neo Strikers'}, they locked in a thrilling scoreline of ${matchResult.goalsScored}-${matchResult.goalsConceded} against the rivals. Sports commentators are predicting a massive shift in gravity!`,
          transfer_offers: [
            {
              team: "Quantum Singularity FC",
              reason: "Impressed by heavy ball strikes and high-G boost maneuvers.",
              role: "Star Player",
              salary_level: "Exclusive"
            },
            {
              team: "Rustland Rovers",
              reason: "Looking for a gritty defensive anchor.",
              role: "Starter",
              salary_level: "Medium"
            }
          ],
          coach_message: `Listen up, Jordi. That was a decent effort on the pitch, but we can tighten our defensive transitions. I want to see you controlling the center circle before boosting. Next match on the list is critical!`,
          rival_reaction: `\"Jordi is fast, I'll give them that. But they're playing checkers while we're playing 4D rocket chess. Let's see them try to save my ultra-heavy ball strikes next meeting.\" - Vanguard-BOT`,
          career_update: {
            reputation: matchResult.won ? "Rising Star" : "Struggling Legend",
            fan_sentiment: "Highly Positive",
            form: "Hot Streak"
          }
        });
      }

      const {
        playerName,
        currentTeam,
        opponentTeam,
        goalsScored,
        goalsConceded,
        heavyHits,
        won,
        seasonProgress,
        reputation,
        fanSentiment,
        form,
        salaryPrestige,
        currentRole
      } = matchResult;

      const promptStr = `
        You are a sports narrative engine simulating a futuristic rocket car football manager mode.
        Generate the career story continuation for:
        Player Name: ${playerName || 'Jordi'}
        Current Team: ${currentTeam || 'Neo Strikers'}
        Matched Opponent Team: ${opponentTeam || 'Gridlocked Gladiators'}
        Match outcome: ${goalsScored} - ${goalsConceded} (${won ? 'VICTORY' : 'DEFEAT'})
        Player goals this match: ${goalsScored}
        Opponent goals: ${goalsConceded}
        Player heavy hits: ${heavyHits || 0}
        
        Standings context:
        Season Progress: ${seasonProgress || 'Match 1 of 5'}
        Reputation Level: ${reputation || 'Rising Star'}
        Fan Sentiment: ${fanSentiment || 'Mixed'}
        Current Form: ${form || 'Stable'}
        Salary prestige level: ${salaryPrestige || 'low'}
        Player's Team Role: ${currentRole || 'Starter'}
      `;

      const systemInstruction = `
        You are a futuristic sports broadcast documentary director.
        Generate a highly engaging, cinematic sports story continuation based on the statistics provided.
        You must output ONLY a valid JSON object matching the following structure exactly (do not output markdown ticks outside of the json):
        {
          "news_article": "A exciting, immersive 2-3 paragraph sports news report. Write from an engaging sports broadcast or ESPN-style perspective, making the player feel like a true celebrity in the high-speed car football league.",
          "transfer_offers": [
            {
              "team": "Name of an interested futuristic club in the Rocket Cars universe (e.g. Cyber Shredders, Glacier Giants, Zenith Syndicate, Rustland Rovers, Tokyo Sunset, Volcanic plasma, etc.)",
              "reason": "Highly specific reason they are interested, related to the match performance or current standings.",
              "role": "Star Player or Starter or Substitute",
              "salary_level": "Low or Medium or High or Exclusive"
            }
          ],
          "coach_message": "Direct motivational/critical message from their coach. Praise them or call out mistakes, give tactical advice (e.g. utilize side rails, keep ball control, boost wisely) and set goals.",
          "rival_reaction": "A trash-talk or respectful statement quotes from a named rival bot star player of the opponent team. Match the atmosphere of the win/loss.",
          "career_update": {
            "reputation": "Adjusted reputation stage (e.g. Rising Star, Pro, Elite, Legend, Immortal)",
            "fan_sentiment": "Positive, Mixed, or Negative",
            "form": "Hot Streak, Stable, or Declining"
          }
        }
        When making transfer offers: If they performed extremely well (win, high score), offer 1-2 superior teams with High or Exclusive salaries. If they lost, keep offers humble or empty. Keep the narrative line organic, fun, and futuristic.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptStr,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.9,
        },
      });

      const responseText = response.text || '{}';
      const cleanJson = JSON.parse(responseText.trim());
      return res.status(200).json(cleanJson);

    } catch (error: any) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Failed to generate story mode' });
    }
  });

  // Serve static files API/health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // 2. VITE DEV OR PROD MIDDLEWARE Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
