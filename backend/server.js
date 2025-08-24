import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY,
    name TEXT,
    lat FLOAT,
    lng FLOAT,
    type TEXT,
    address TEXT,
    description TEXT,
    image TEXT
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY,
    image TEXT,
    link TEXT,
    active BOOLEAN DEFAULT true
  );
`);

// ===== PUBLIC API =====
// GET /places
app.get('/places', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM places');
  res.json(rows);
});

// ===== ADMIN API =====
const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== process.env.ADMIN_TOKEN) return res.sendStatus(401);
  next();
};

// POST /places
app.post('/places', adminOnly, upload.single('image'), async (req, res) => {
  const { name, lat, lng, type, address, description } = req.body;
  const id = uuid();
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  await pool.query(
    `INSERT INTO places(id,name,lat,lng,type,address,description,image)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, name, lat, lng, type, address, description, image]
  );
  res.json({ id });
});

// DELETE /places/:id
app.delete('/places/:id', adminOnly, async (req, res) => {
  await pool.query('DELETE FROM places WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

// GET /banners
app.get('/banners', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM banners WHERE active=true');
  res.json(rows);
});

// POST /banners
app.post('/banners', adminOnly, upload.single('image'), async (req, res) => {
  const id = uuid();
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const { link } = req.body;
  await pool.query(
    `INSERT INTO banners(id,image,link) VALUES($1,$2,$3)`,
    [id, image, link]
  );
  res.json({ id });
});

app.listen(process.env.PORT, () =>
  console.log(`Backend on http://localhost:${process.env.PORT}`)
); 
