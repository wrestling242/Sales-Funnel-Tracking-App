import express from "express";
import { db } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// API Routes
app.get("/api/entries", async (req, res) => {
  if (!process.env.POSTGRES_URL) {
    return res.status(503).json({ error: "Database configuration missing" });
  }
  try {
    const { rows } = await db.query('SELECT * FROM funnel_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch entries", details: err.message });
  }
});

app.post("/api/entries", async (req, res) => {
  if (!process.env.POSTGRES_URL) {
    return res.status(503).json({ error: "Database configuration missing" });
  }
  const { period, dms, calls, appointments, meetings, negotiations, orders, created_at } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO funnel_entries (period, dms, calls, appointments, meetings, negotiations, orders, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [period || 'daily', dms || 0, calls || 0, appointments || 0, meetings || 0, negotiations || 0, orders || 0, created_at || new Date()]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
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

export default app;
