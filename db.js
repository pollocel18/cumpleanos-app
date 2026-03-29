require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const crearTablas = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS personas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      apodo VARCHAR(100),
      fecha DATE NOT NULL,
      gustos TEXT,
      notas TEXT,
      foto TEXT,
      foto_pos VARCHAR(20) DEFAULT '50% 50%',
      color VARCHAR(20),
      creado_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Tablas listas ✓');
};

crearTablas();

module.exports = pool;
