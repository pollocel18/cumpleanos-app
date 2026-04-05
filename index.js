require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { login, register, verificar } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth - sin protección
app.post('/login', login);
app.post('/register', register);

// Rutas protegidas
app.get('/personas', verificar, async (req, res) => {
  const result = await pool.query('SELECT * FROM personas WHERE user_id=$1 ORDER BY id ASC', [req.user.id]);
  res.json(result.rows);
});

app.post('/personas', verificar, async (req, res) => {
  const { nombre, apodo, fecha, gustos, notas, foto, foto_pos, color } = req.body;
  const result = await pool.query(
    'INSERT INTO personas (nombre, apodo, fecha, gustos, notas, foto, foto_pos, color, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [nombre, apodo, fecha, gustos, notas, foto, foto_pos, color, req.user.id]
  );
  res.json(result.rows[0]);
});

app.put('/personas/:id', verificar, async (req, res) => {
  const { nombre, apodo, fecha, gustos, notas, foto, foto_pos, color } = req.body;
  const result = await pool.query(
    'UPDATE personas SET nombre=$1, apodo=$2, fecha=$3, gustos=$4, notas=$5, foto=$6, foto_pos=$7, color=$8 WHERE id=$9 AND user_id=$10 RETURNING *',
    [nombre, apodo, fecha, gustos, notas, foto, foto_pos, color, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

app.delete('/personas/:id', verificar, async (req, res) => {
  await pool.query('DELETE FROM personas WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.get('/pareja', verificar, async (req, res) => {
  const result = await pool.query('SELECT * FROM pareja WHERE user_id=$1', [req.user.id]);
  res.json(result.rows[0] || null);
});

app.post('/pareja', verificar, async (req, res) => {
  const { persona_id, fecha_conocieron, lugar_conocieron, fecha_compromiso, fecha_boda, detalles_importantes } = req.body;
  const existe = await pool.query('SELECT id FROM pareja WHERE user_id=$1', [req.user.id]);
  if (existe.rows.length > 0) {
    const result = await pool.query(
      'UPDATE pareja SET persona_id=$1, fecha_conocieron=$2, lugar_conocieron=$3, fecha_compromiso=$4, fecha_boda=$5, detalles_importantes=$6 WHERE user_id=$7 RETURNING *',
      [persona_id, fecha_conocieron || null, lugar_conocieron, fecha_compromiso || null, fecha_boda || null, detalles_importantes, req.user.id]
    );
    res.json(result.rows[0]);
  } else {
    const result = await pool.query(
      'INSERT INTO pareja (user_id, persona_id, fecha_conocieron, lugar_conocieron, fecha_compromiso, fecha_boda, detalles_importantes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.user.id, persona_id, fecha_conocieron || null, lugar_conocieron, fecha_compromiso || null, fecha_boda || null, detalles_importantes]
    );
    res.json(result.rows[0]);
  }
});

app.delete('/pareja', verificar, async (req, res) => {
  await pool.query('DELETE FROM pareja WHERE user_id=$1', [req.user.id]);
  res.json({ ok: true });
});
app.get('/', (req, res) => res.json({ mensaje: '¡Servidor de cumpleaños funcionando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));