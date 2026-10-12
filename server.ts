import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    try {
      let { model, history = [], message } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "A valid message is required." });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
        return;
      }

      // Map deprecated or unknown models to supported defaults
      const validModels: Record<string, string> = {
        'gemini-3.8-flash': 'gemini-3.8-flash',
        'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',
        'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
        'gemini-2.5-flash': 'gemini-3.8-flash',
        'gemini-flash-lite-latest': 'gemini-3.1-flash-lite',
        'gemini-flash-latest': 'gemini-3.8-flash'
      };

      const selectedModel = validModels[model] || 'gemini-3.8-flash';

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contents = history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || '' }]
      }));

      // Add the new message
      contents.push({ role: 'user', parts: [{ text: message }] });

      // Attempt streaming with retry and graceful fallback for high-demand spikes
      let responseStream = null;
      let lastError: any = null;
      const modelsToTry = [selectedModel];
      if (!modelsToTry.includes('gemini-3.1-flash-lite')) {
        modelsToTry.push('gemini-3.1-flash-lite');
      }
      if (!modelsToTry.includes('gemini-3.8-flash')) {
        modelsToTry.push('gemini-3.8-flash');
      }

      for (const currentModel of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            responseStream = await ai.models.generateContentStream({
              model: currentModel,
              contents: contents,
              config: {
                systemInstruction: "You are TalkHub, a helpful, witty, and concise AI assistant. You help users with coding, creative writing, and general knowledge."
              }
            });
            break;
          } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.code;
            if (status === 503 && attempt === 0) {
              await new Promise(resolve => setTimeout(resolve, 800));
              continue;
            }
            break;
          }
        }
        if (responseStream) break;
      }

      if (!responseStream) {
        throw lastError || new Error("Failed to generate response.");
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Chat API error:", error);
      if (!res.headersSent) {
        const errorMsg = error?.message || "Failed to generate response.";
        res.status(500).json({ error: errorMsg });
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
