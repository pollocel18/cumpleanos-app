const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const SECRET = "cumpleanos_secret_2024";

const register = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const existe = await pool.query('SELECT id FROM users WHERE usuario = $1', [usuario]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (usuario, password) VALUES ($1, $2) RETURNING id, usuario',
      [usuario, hash]
    );

    const token = jwt.sign({ id: result.rows[0].id, usuario }, SECRET, { expiresIn: "7d" });
    res.json({ token, usuario });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = result.rows[0];
    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user.id, usuario: user.usuario }, SECRET, { expiresIn: "7d" });
    res.json({ token, usuario: user.usuario });
  } catch (err) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const verificar = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = { login, register, verificar };