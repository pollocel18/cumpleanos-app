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

// ── Cápsula del día — llamada a Anthropic desde el servidor ──────────────────
app.post('/api/capsula', verificar, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Falta el prompt' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('Error capsula:', err);
    res.status(500).json({ error: 'Error al generar la cápsula' });
  }
});

// ── Registros Akáshicos — llamada a Anthropic desde el servidor ──────────────
app.post('/api/akashic', verificar, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Falta el prompt' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('Error akashic:', err);
    res.status(500).json({ error: 'Error al abrir el registro' });
  }
});

app.get('/', (req, res) => res.json({ mensaje: '¡Servidor de cumpleaños funcionando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
