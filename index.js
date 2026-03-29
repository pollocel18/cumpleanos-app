require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Obtener todas las personas
app.get('/personas', async (req, res) => {
  const result = await pool.query('SELECT * FROM personas ORDER BY id ASC');
  res.json(result.rows);
});

// Agregar persona
app.post('/personas', async (req, res) => {
  const { nombre, apodo, fecha, gustos, notas, foto, foto_pos, color } = req.body;
  const result = await pool.query(
    'INSERT INTO personas (nombre, apodo, fecha, gustos, notas, foto, foto_pos, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [nombre, apodo, fecha, gustos, notas, foto, foto_pos, color]
  );
  res.json(result.rows[0]);
});

// Editar persona
app.put('/personas/:id', async (req, res) => {
  const { nombre, apodo, fecha, gustos, notas, foto, foto_pos, color } = req.body;
  const result = await pool.query(
    'UPDATE personas SET nombre=$1, apodo=$2, fecha=$3, gustos=$4, notas=$5, foto=$6, foto_pos=$7, color=$8 WHERE id=$9 RETURNING *',
    [nombre, apodo, fecha, gustos, notas, foto, foto_pos, color, req.params.id]
  );
  res.json(result.rows[0]);
});

// Eliminar persona
app.delete('/personas/:id', async (req, res) => {
  await pool.query('DELETE FROM personas WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/', (req, res) => res.json({ mensaje: '¡Servidor de cumpleaños funcionando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
