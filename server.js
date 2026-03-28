import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "autoassets2024";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  console.error("Create a .env file based on .env.example and set your database URL.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id          SERIAL PRIMARY KEY,
      year        INTEGER NOT NULL,
      make        TEXT NOT NULL,
      model       TEXT NOT NULL,
      price       INTEGER,
      was_price   INTEGER,
      mileage     TEXT NOT NULL DEFAULT '',
      service_history TEXT NOT NULL DEFAULT '',
      colour      TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'available',
      images      TEXT[] NOT NULL DEFAULT '{}',
      body_type   TEXT NOT NULL DEFAULT '',
      engine      TEXT NOT NULL DEFAULT '',
      transmission TEXT NOT NULL DEFAULT '',
      fuel_type   TEXT NOT NULL DEFAULT '',
      auto_trader_url TEXT,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*) FROM cars");
  if (parseInt(rows[0].count) === 0) {
    await seedCars();
    console.log("Database seeded with initial inventory.");
  }
}

async function seedCars() {
  const cars = [
    { year: 2012, make: "Nissan", model: "370Z", price: 359900, wasPrice: null, mileage: "89,760 km", serviceHistory: "Partial Service History — Recently Serviced", colour: "Black Cherry Metallic", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-19%20at%2019.30.50.jpeg"], bodyType: "Coupe", engine: "3.7L V6", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 1999, make: "Nissan", model: "1400", price: 129900, wasPrice: null, mileage: "Unknown", serviceHistory: "Unknown", colour: "Orange", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-17%20at%2016.42.48.jpeg"], bodyType: "Bakkie", engine: "1.4L", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2015, make: "Nissan", model: "GT-R", price: 1599900, wasPrice: null, mileage: "70,000 km", serviceHistory: "Full Service History", colour: "White/Wrapped", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-02-05%20at%2011.09.07.jpeg"], bodyType: "Coupe", engine: "3.8L Twin-Turbo V6", transmission: "DCT", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2017, make: "Volkswagen", model: "Touareg V6 TDI Luxury", price: 459900, wasPrice: null, mileage: "134,800 km", serviceHistory: "Full Service History", colour: "Silver", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-19%20at%2015.39.1111.jpeg"], bodyType: "SUV", engine: "3.0L V6 TDI", transmission: "Automatic", fuelType: "Diesel", autoTraderUrl: null },
    { year: 2009, make: "Subaru", model: "Impreza 2.5 WRX Sedan", price: 189900, wasPrice: null, mileage: "141,000 km", serviceHistory: "Full Service History", colour: "Blue", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-01-14%20at%2010.08.12.jpeg"], bodyType: "Sedan", engine: "2.5L Turbocharged Flat-4", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2004, make: "Nissan", model: "350Z Coupe Widebody", price: 239900, wasPrice: null, mileage: "83,390 km", serviceHistory: "Partial Service History", colour: "Red", status: "available", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202025-11-15%20at%2020.49.53.jpeg"], bodyType: "Coupe", engine: "3.5L V6", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2010, make: "Lexus", model: "IS F", price: null, wasPrice: null, mileage: "153,000 km", serviceHistory: "Full Service History", colour: "White", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.28.0611.jpeg"], bodyType: "Sedan", engine: "5.0L V8", transmission: "Automatic", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2013, make: "MINI", model: "Cooper GP2", price: null, wasPrice: null, mileage: "54,500 km", serviceHistory: "Full Service History", colour: "Thunder Grey", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.32.14.jpeg"], bodyType: "Hatchback", engine: "1.6L Turbocharged", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2019, make: "BMW", model: "M140i", price: 1599900, wasPrice: null, mileage: "89,500 km", serviceHistory: "Full Service History", colour: "White", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.28.06.jpeg"], bodyType: "Hatchback", engine: "3.0L B58 Turbocharged", transmission: "Automatic", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2015, make: "MINI", model: "Cooper S", price: null, wasPrice: null, mileage: "115,600 km", serviceHistory: "Full Service History", colour: "Grey", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.28.05.jpeg"], bodyType: "Hatchback", engine: "2.0L Turbocharged", transmission: "Manual", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2016, make: "BMW", model: "220i", price: null, wasPrice: null, mileage: "98,000 km", serviceHistory: "Full Service History", colour: "White", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.28.061.jpeg"], bodyType: "Coupe", engine: "2.0L Turbocharged", transmission: "Automatic", fuelType: "Petrol", autoTraderUrl: null },
    { year: 2012, make: "Nissan", model: "GT-R", price: null, wasPrice: null, mileage: "35,000 km", serviceHistory: "Full Service History", colour: "Wrapped", status: "sold", images: ["https://img1.wsimg.com/isteam/ip/7d0d36e1-eeb3-4d02-9dee-8016a7754840/WhatsApp%20Image%202026-03-26%20at%2008.32.141.jpeg"], bodyType: "Coupe", engine: "3.8L Twin-Turbo V6", transmission: "DCT", fuelType: "Petrol", autoTraderUrl: null },
  ];
  for (let i = 0; i < cars.length; i++) {
    const c = cars[i];
    await pool.query(
      `INSERT INTO cars (year,make,model,price,was_price,mileage,service_history,colour,status,images,body_type,engine,transmission,fuel_type,auto_trader_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [c.year, c.make, c.model, c.price, c.wasPrice, c.mileage, c.serviceHistory, c.colour, c.status, c.images, c.bodyType, c.engine, c.transmission, c.fuelType, c.autoTraderUrl, i]
    );
  }
}

function rowToApi(r) {
  return {
    id: r.id,
    year: r.year,
    make: r.make,
    model: r.model,
    price: r.price ?? null,
    wasPrice: r.was_price ?? null,
    mileage: r.mileage,
    serviceHistory: r.service_history,
    colour: r.colour,
    status: r.status,
    images: r.images ?? [],
    bodyType: r.body_type,
    engine: r.engine,
    transmission: r.transmission,
    fuelType: r.fuel_type,
    autoTraderUrl: r.auto_trader_url ?? undefined,
  };
}

function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"] ?? req.query.token;
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/cars", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM cars ORDER BY sort_order ASC");
    res.json(rows.map(rowToApi));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

app.post("/api/cars", requireAdmin, async (req, res) => {
  try {
    const b = req.body;
    const { rows: [minRow] } = await pool.query("SELECT MIN(sort_order) AS min FROM cars");
    const sortOrder = (minRow.min ?? 0) - 1;
    const { rows: [inserted] } = await pool.query(
      `INSERT INTO cars (year,make,model,price,was_price,mileage,service_history,colour,status,images,body_type,engine,transmission,fuel_type,auto_trader_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [b.year,b.make,b.model,b.price??null,b.wasPrice??null,b.mileage,b.serviceHistory,b.colour,b.status,b.images??[],b.bodyType,b.engine,b.transmission,b.fuelType,b.autoTraderUrl??null,sortOrder]
    );
    res.status(201).json(rowToApi(inserted));
  } catch (e) {
    res.status(500).json({ error: "Failed to create car" });
  }
});

app.put("/api/cars/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const b = req.body;
    const { rows: [updated] } = await pool.query(
      `UPDATE cars SET year=$1,make=$2,model=$3,price=$4,was_price=$5,mileage=$6,service_history=$7,colour=$8,status=$9,images=$10,body_type=$11,engine=$12,transmission=$13,fuel_type=$14,auto_trader_url=$15
       WHERE id=$16 RETURNING *`,
      [b.year,b.make,b.model,b.price??null,b.wasPrice??null,b.mileage,b.serviceHistory,b.colour,b.status,b.images??[],b.bodyType,b.engine,b.transmission,b.fuelType,b.autoTraderUrl??null,id]
    );
    if (!updated) { res.status(404).json({ error: "Car not found" }); return; }
    res.json(rowToApi(updated));
  } catch (e) {
    res.status(500).json({ error: "Failed to update car" });
  }
});

app.delete("/api/cars/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM cars WHERE id=$1", [parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete car" });
  }
});

app.patch("/api/cars/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows: [car] } = await pool.query("SELECT status FROM cars WHERE id=$1", [id]);
    if (!car) { res.status(404).json({ error: "Car not found" }); return; }
    const newStatus = car.status === "available" ? "sold" : "available";
    const { rows: [updated] } = await pool.query("UPDATE cars SET status=$1 WHERE id=$2 RETURNING *", [newStatus, id]);
    res.json(rowToApi(updated));
  } catch (e) {
    res.status(500).json({ error: "Failed to toggle status" });
  }
});

app.patch("/api/cars/:id/move", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const direction = req.body.direction;
    const { rows: all } = await pool.query("SELECT id, sort_order FROM cars ORDER BY sort_order ASC");
    const idx = all.findIndex(c => c.id === id);
    if (idx < 0) { res.status(404).json({ error: "Car not found" }); return; }
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) { res.json({ ok: true }); return; }
    const a = all[idx], b = all[swapIdx];
    await pool.query("UPDATE cars SET sort_order=$1 WHERE id=$2", [b.sort_order, a.id]);
    await pool.query("UPDATE cars SET sort_order=$1 WHERE id=$2", [a.sort_order, b.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to move car" });
  }
});

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));

const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Auto Assets running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("Database init failed:", err.message);
    process.exit(1);
  });
