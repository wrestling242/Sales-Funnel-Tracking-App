import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Database Initialization ---
  if (!process.env.POSTGRES_URL) {
    console.warn("WARNING: POSTGRES_URL is not defined in environment variables.");
    console.warn("API routes will fail until the connection string is provided.");
  } else {
    try {
      const client = await db.connect();
      await client.sql`
        CREATE TABLE IF NOT EXISTS funnel_entries (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          dms INTEGER DEFAULT 0,
          calls INTEGER DEFAULT 0,
          appointments INTEGER DEFAULT 0,
          meetings INTEGER DEFAULT 0,
          negotiations INTEGER DEFAULT 0,
          orders INTEGER DEFAULT 0
        );
      `;
      console.log("Database initialized successfully");
    } catch (err) {
      console.error("Database connection error:", err);
    }
  }

  // --- API Routes ---

  app.get("/api/entries", async (req, res) => {
    try {
      const { rows } = await db.query('SELECT * FROM funnel_entries ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    const { dms, calls, appointments, meetings, negotiations, orders } = req.body;
    try {
      const { rows } = await db.query(
        'INSERT INTO funnel_entries (dms, calls, appointments, meetings, negotiations, orders) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [dms || 0, calls || 0, appointments || 0, meetings || 0, negotiations || 0, orders || 0]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save entry" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
