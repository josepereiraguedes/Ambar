import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { products, settings } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from "fs";

// Initialize Firebase Admin
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

if (!getApps().length) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (e) {
    console.error("Firebase admin init error:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // DB Setup
  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
  });
  const db = drizzle(pool);

  // Authentication Middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const allProducts = await db.select().from(products);
      res.json(allProducts);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const product = req.body;
      await db.insert(products).values(product);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const product = req.body;
      await db.update(products).set(product).where(eq(products.id, req.params.id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(products).where(eq(products.id, req.params.id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const result = await db.select().from(settings).where(eq(settings.id, "default"));
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.json({});
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const setting = req.body;
      const existing = await db.select().from(settings).where(eq(settings.id, "default"));
      if (existing.length > 0) {
        await db.update(settings).set({ ...setting, updatedAt: new Date() }).where(eq(settings.id, "default"));
      } else {
        await db.insert(settings).values({ ...setting, id: "default" });
      }
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
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
