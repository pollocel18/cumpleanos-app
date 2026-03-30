const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USUARIO = "arturo";
const PASSWORD_HASH = bcrypt.hashSync("pollo18", 10);
const SECRET = "cumpleanos_secret_2024";

const login = async (req, res) => {
  const { usuario, password } = req.body;
  
  if (usuario !== USUARIO) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const valido = await bcrypt.compare(password, PASSWORD_HASH);
  if (!valido) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign({ usuario }, SECRET, { expiresIn: "7d" });
  res.json({ token });
};

const verificar = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });
  
  try {
    const token = auth.split(" ")[1];
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = { login, verificar };