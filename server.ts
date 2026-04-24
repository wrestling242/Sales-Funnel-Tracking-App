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
    console.warn("API routes will return 503 Service Unavailable until the connection string is provided.");
  } else {
    try {
      // Test the connection and initialize table
      await db.query(`
        CREATE TABLE IF NOT EXISTS funnel_entries (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          period VARCHAR(10) DEFAULT 'daily',
          dms NUMERIC DEFAULT 0,
          calls NUMERIC DEFAULT 0,
          appointments NUMERIC DEFAULT 0,
          meetings NUMERIC DEFAULT 0,
          negotiations NUMERIC DEFAULT 0,
          orders NUMERIC DEFAULT 0
        );
        -- Ensure period column exists if table was already created
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnel_entries' AND column_name='period') THEN
            ALTER TABLE funnel_entries ADD COLUMN period VARCHAR(10) DEFAULT 'daily';
          END IF;
          
          -- Alter columns to numeric
          ALTER TABLE funnel_entries ALTER COLUMN dms TYPE NUMERIC;
          ALTER TABLE funnel_entries ALTER COLUMN calls TYPE NUMERIC;
          ALTER TABLE funnel_entries ALTER COLUMN appointments TYPE NUMERIC;
          ALTER TABLE funnel_entries ALTER COLUMN meetings TYPE NUMERIC;
          ALTER TABLE funnel_entries ALTER COLUMN negotiations TYPE NUMERIC;
          ALTER TABLE funnel_entries ALTER COLUMN orders TYPE NUMERIC;

          -- Targets Table
          IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'funnel_targets') THEN
            CREATE TABLE funnel_targets (
              id SERIAL PRIMARY KEY,
              type VARCHAR(10) NOT NULL UNIQUE,
              dms NUMERIC DEFAULT 0,
              calls NUMERIC DEFAULT 0,
              appointments NUMERIC DEFAULT 0,
              meetings NUMERIC DEFAULT 0,
              negotiations NUMERIC DEFAULT 0,
              orders NUMERIC DEFAULT 0,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO funnel_targets (type) VALUES ('daily'), ('monthly');
          ELSE
            -- Alter columns to numeric
            ALTER TABLE funnel_targets ALTER COLUMN dms TYPE NUMERIC;
            ALTER TABLE funnel_targets ALTER COLUMN calls TYPE NUMERIC;
            ALTER TABLE funnel_targets ALTER COLUMN appointments TYPE NUMERIC;
            ALTER TABLE funnel_targets ALTER COLUMN meetings TYPE NUMERIC;
            ALTER TABLE funnel_targets ALTER COLUMN negotiations TYPE NUMERIC;
            ALTER TABLE funnel_targets ALTER COLUMN orders TYPE NUMERIC;
          END IF;
        END $$;
      `);
      console.log("Database initialized successfully");
    } catch (err: any) {
      console.error("Database initialization failed:", err.message);
    }
  }

  // --- API Routes ---

  app.get("/api/entries", async (req, res) => {
    if (!process.env.POSTGRES_URL) {
      return res.status(503).json({ 
        error: "Database configuration missing", 
        message: "POSTGRES_URL environment variable is not set." 
      });
    }
    try {
      const { rows } = await db.query('SELECT * FROM funnel_entries ORDER BY created_at DESC');
      res.json(rows);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch entries", details: err.message });
    }
  });

  app.post("/api/entries", async (req, res) => {
    if (!process.env.POSTGRES_URL) {
      return res.status(503).json({ 
        error: "Database configuration missing", 
        message: "POSTGRES_URL environment variable is not set." 
      });
    }
    const { period, dms, calls, appointments, meetings, negotiations, orders, created_at } = req.body;
    try {
      const { rows } = await db.query(
        'INSERT INTO funnel_entries (period, dms, calls, appointments, meetings, negotiations, orders, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [period || 'daily', dms || 0, calls || 0, appointments || 0, meetings || 0, negotiations || 0, orders || 0, created_at || new Date()]
      );
      res.status(201).json(rows[0]);
    } catch (err: any) {
      console.error("Insert error:", err.message);
      res.status(500).json({ error: "Failed to save entry", details: err.message });
    }
  });

  app.get("/api/targets", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(503).json({ error: "Missing DB" });
    try {
      const { rows } = await db.query('SELECT * FROM funnel_targets');
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: "Fetch error", details: err.message });
    }
  });

  app.post("/api/targets", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(503).json({ error: "Missing DB" });
    const { type, dms, calls, appointments, meetings, negotiations, orders } = req.body;
    try {
      const { rows } = await db.query(
        `UPDATE funnel_targets 
         SET dms = $2, calls = $3, appointments = $4, meetings = $5, negotiations = $6, orders = $7, updated_at = CURRENT_TIMESTAMP 
         WHERE type = $1 RETURNING *`,
        [type, dms || 0, calls || 0, appointments || 0, meetings || 0, negotiations || 0, orders || 0]
      );
      res.json(rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Update error", details: err.message });
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
