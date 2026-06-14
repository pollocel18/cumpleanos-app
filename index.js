require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { login, register, verificar } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Verificación de API secret para endpoints de IA
const verificarSecret = (req, res, next) => {
  const secret = req.headers['x-api-secret'];
  if (!secret || secret !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Auth - sin protección
app.post('/login', login);
app.post('/register', register);

// Contador de consultas
app.post('/api/consulta', verificarSecret, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  try {
    // Buscar usuario en usuarios_hub
    const result = await pool.query(
      'SELECT consultas_usadas, rol FROM usuarios_hub WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      // Primera vez — crear registro
      await pool.query(
        'INSERT INTO usuarios_hub (id, email, consultas_usadas) VALUES ($1, $2, 1)',
        [user_id, req.body.email || '']
      );
      return res.json({ consultas_usadas: 1, permitido: true });
    }

    const consultas = result.rows[0].consultas_usadas;
    const rol = result.rows[0].rol;

    // Admin siempre puede
    if (rol === 'admin') {
      return res.json({ consultas_usadas: consultas, permitido: true });
    }

    // Usuario normal — verificar límite
    if (consultas >= 3) {
      return res.json({ consultas_usadas: consultas, permitido: false });
    }

    await pool.query(
      'UPDATE usuarios_hub SET consultas_usadas = consultas_usadas + 1 WHERE id = $1',
      [user_id]
    );

    return res.json({ consultas_usadas: consultas + 1, permitido: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener rol de usuario
app.get('/api/rol', verificarSecret, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  try {
    const result = await pool.query(
      'SELECT rol, consultas_usadas FROM usuarios_hub WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.json({ rol: 'usuario', consultas_usadas: 0 });
    }

    return res.json({
      rol: result.rows[0].rol,
      consultas_usadas: result.rows[0].consultas_usadas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Análisis integrado de bitácora
app.post('/api/analisis', verificarSecret, async (req, res) => {
  const { historial } = req.body;
  if (!historial) return res.status(400).json({ error: 'historial requerido' });

  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

  const SYSTEM_ANALISIS = `Eres el Integrador del universo Despertar.

Tienes frente a ti el historial completo de una persona — sus sueños interpretados, sus tiradas de cartas, y la lectura de su mano. Todo eso junto forma un mapa. Tu trabajo es leerlo.

No repites lo que ya se dijo en cada sesión. Buscas lo que solo se puede ver cuando miras todo junto: el símbolo que aparece en el sueño y también en las cartas. El patrón que se repite aunque venga de fuentes distintas. El mensaje que esta persona ha estado recibiendo sin darse cuenta de que es siempre el mismo.

CÓMO HABLAS:
- Entras directo. Sin introducción, sin "según tu historial..." — ya adentro
- Párrafo continuo. Sin listas, sin encabezados
- Entre 350 y 500 palabras — suficiente para respirar cada capa
- Lenguaje de esta época. Directo, cálido, sin incienso
- Termina con una sola pregunta que solo podía existir después de haber visto todo esto junto

LO QUE NO HACES:
- No resumes sesión por sesión
- No inventarías símbolos como lista
- No repites frases de catálogo espiritual
- No flotas

Perteneces al universo "Despertar — No es lo que esperabas".`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_ANALISIS,
      messages: [{ role: 'user', content: historial }],
    });
    res.json({ respuesta: message.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar análisis' });
  }
});

// ── Tónali + Akáshicos para perfil de cliente ─────────────────────────────
app.post('/api/tonali-perfil', verificarSecret, async (req, res) => {
const promptTonali = `Fecha de nacimiento: ${fecha_nacimiento}
Tónali Mexica: ${numero} ${signo.nombre} ${signo.emoji} — ${signo.desc}
Señor de la Noche: ${señorNoche.nombre} — ${señorNoche.desc}
Año: ${numAño} ${signoAño.nombre} ${signoAño.emoji}

Responde ÚNICAMENTE con un objeto JSON con exactamente esta estructura, sin texto adicional, sin markdown, sin backticks:

{
  "proposito": "El propósito del alma en esta encarnación — 3 a 4 oraciones íntimas y específicas basadas en los datos.",
  "dones": "Los dones y talentos traídos desde vidas anteriores — 3 a 4 oraciones poéticas y específicas.",
  "karma": "Los patrones kármicos o aprendizajes pendientes — 3 a 4 oraciones honestas y compasivas.",
  "arquetipo": "El arquetipo que representa esta alma — nombra el arquetipo y explícalo en 2 a 3 oraciones.",
  "mensaje": "Un mensaje directo e íntimo del Registro para esta persona — 2 a 3 oraciones que solo podrían ser para ella."
}`;

// Cálculo del Tónali
  const SIGNOS_TONALPOHUALLI = [
    { nombre: "Cipactli", emoji: "🐊", desc: "Caimán — Fuerza primordial, origen del mundo, energía creadora." },
    { nombre: "Ehecatl", emoji: "💨", desc: "Viento — Mensajero de los dioses, movilidad, transformación." },
    { nombre: "Calli", emoji: "🏠", desc: "Casa — Refugio, introspección, mundo interior profundo." },
    { nombre: "Cuetzpalin", emoji: "🦎", desc: "Lagartija — Agilidad, adaptación, vitalidad renovada." },
    { nombre: "Coatl", emoji: "🐍", desc: "Serpiente — Sabiduría ancestral, dualidad, renacimiento." },
    { nombre: "Miquiztli", emoji: "💀", desc: "Muerte — Transformación, tránsito entre mundos, ciclo eterno." },
    { nombre: "Mazatl", emoji: "🦌", desc: "Venado — Gracia, intuición, conexión con la naturaleza." },
    { nombre: "Tochtli", emoji: "🐇", desc: "Conejo — Abundancia, fertilidad, alegría desbordante." },
    { nombre: "Atl", emoji: "💧", desc: "Agua — Fluidez, purificación, vida y movimiento constante." },
    { nombre: "Itzcuintli", emoji: "🐕", desc: "Perro — Lealtad, guía hacia el inframundo, compañerismo." },
    { nombre: "Ozomatli", emoji: "🐒", desc: "Mono — Arte, juego, ingenio y creatividad sin límites." },
    { nombre: "Malinalli", emoji: "🌿", desc: "Hierba — Resiliencia, renacimiento, lo que no puede ser destruido." },
    { nombre: "Acatl", emoji: "🎋", desc: "Caña — Sabiduría de Quetzalcóatl, conocimiento y la palabra." },
    { nombre: "Ocelotl", emoji: "🐆", desc: "Jaguar — Poder nocturno, guerrero de la oscuridad, misterio." },
    { nombre: "Cuauhtli", emoji: "🦅", desc: "Águila — Visión solar, liderazgo, vuela más alto que todos." },
    { nombre: "Cozcacuauhtli", emoji: "🦅", desc: "Buitre — Sabiduría de los ancianos, paciencia y longevidad." },
    { nombre: "Ollin", emoji: "🌀", desc: "Movimiento — El signo del sol actual, destino en acción." },
    { nombre: "Tecpatl", emoji: "🔪", desc: "Pedernal — Sacrificio, voluntad cortante, verdad sin filtro." },
    { nombre: "Quiahuitl", emoji: "🌧️", desc: "Lluvia — Dones del cielo, fertilidad, la voz de Tlaloc." },
    { nombre: "Xochitl", emoji: "🌸", desc: "Flor — Belleza, arte, amor y el florecimiento del alma." },
  ];
  const SEÑORES_NOCHE = [
    { nombre: "Xiuhtecuhtli", desc: "Señor del Fuego — el más antiguo, eje del cosmos, transformación." },
    { nombre: "Itztli", desc: "Obsidiana — filo de la verdad, claridad que corta lo superficial." },
    { nombre: "Piltzintecuhtli", desc: "Señor Joven — el sol niño, energía fresca y renovación." },
    { nombre: "Centeotl", desc: "Dios del Maíz — sustento, abundancia, lo que nutre al mundo." },
    { nombre: "Mictlantecuhtli", desc: "Señor de los Muertos — profundidad, lo que existe más allá." },
    { nombre: "Chalchiuhtlicue", desc: "Falda de Jade — aguas en movimiento, fluidez emocional, protección." },
    { nombre: "Tlazolteotl", desc: "Diosa de la Tierra — purificación, pasión, lo que se transforma." },
    { nombre: "Tepeyollotl", desc: "Corazón del Monte — el jaguar del eco, la voz que resuena." },
    { nombre: "Tlaloc", desc: "Dios de la Lluvia — los dones del cielo, la vida que viene de arriba." },
  ];
  const SIGNOS_AÑO = [
    { nombre: "Tochtli", emoji: "🐇", desc: "Conejo" },
    { nombre: "Acatl", emoji: "🎋", desc: "Caña" },
    { nombre: "Tecpatl", emoji: "🔪", desc: "Pedernal" },
    { nombre: "Calli", emoji: "🏠", desc: "Casa" },
  ];

  function fechaAJDN(dia, mes, anio) {
    if (mes <= 2) { anio -= 1; mes += 12; }
    const A = Math.floor(anio / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (anio + 4716)) + Math.floor(30.6001 * (mes + 1)) + dia + B - 1524;
  }

  const parts = fecha_nacimiento.split("-");
  const anio = parseInt(parts[0]);
  const mes = parseInt(parts[1]);
  const dia = parseInt(parts[2]);

  const GMT = 584283;
  const jdn = fechaAJDN(dia, mes, anio);
  const tpDia = ((jdn - GMT) % 260 + 260) % 260;
  const numero = (tpDia % 13) + 1;
  const signoIndex = tpDia % 20;
  const signo = SIGNOS_TONALPOHUALLI[signoIndex];
  const señorNocheIndex = ((jdn - GMT) % 9 + 9) % 9;
  const señorNoche = SEÑORES_NOCHE[señorNocheIndex];
  const añosTranscurridos = Math.floor((jdn - GMT) / 365);
  const numAño = (((añosTranscurridos % 13) + 13) % 13) + 1;
  const signoAñoIndex = ((añosTranscurridos % 4) + 4) % 4;
  const signoAño = SIGNOS_AÑO[signoAñoIndex];

  const tonali = { numero, signo, señorNoche, numAño, signoAño };

  // Registros Akáshicos con Claude
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

  const prompt = `Fecha de nacimiento: ${fecha_nacimiento}
Tónali Mexica: ${numero} ${signo.nombre} ${signo.emoji}
Señor de la Noche: ${señorNoche.nombre} — ${señorNoche.desc}
Año: ${numAño} ${signoAño.nombre} ${signoAño.emoji}

Genera un registro akáshico breve para esta persona — 150 palabras máximo. Voz directa, sin incienso. Habla de su misión, su energía base y el reto principal que trajo al nacer. Sin listas, párrafo continuo.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: promptTonali }],
    });

    const raw = message.content[0].text.trim().replace(/```json|```/g, '').trim();
const akashico = JSON.parse(raw);

res.json({
  tonali,
  akashico,
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular' });
  }
});


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
app.post('/api/capsula', verificar, verificarSecret, async (req, res) => {
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
app.post('/api/akashic', verificar, verificarSecret, async (req, res) => {
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

app.post('/api/quiromante', verificarSecret, async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'Faltan los mensajes' });

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
        system: `Eres La Quiromante del universo Despertar.

No lees el futuro. Lees el carácter — lo que alguien es, cómo está construido por dentro, hacia dónde lo mueve su naturaleza cuando nadie lo está mirando. La mano no miente porque no sabe mentir. Es el mapa más honesto que existe.

Llevas en ti siglos de tradición quiromántica — conoces las líneas principales, los montes, la forma de la mano, los dedos, las marcas. Pero no eres una enciclopedia. Eres alguien que mira una mano y ve a la persona completa detrás de ella.

CÓMO LEES UNA MANO:

Cuando recibes una imagen, observas en este orden:
- La forma general: ¿es una mano de tierra, agua, aire o fuego? Eso habla del temperamento base antes de leer una sola línea
- Los montes: ¿cuáles están desarrollados, cuáles planos? Ahí vive lo que la persona cultiva o descuida
- La línea de la vida: no predice cuánto va a vivir — revela la calidad y la intensidad con que vive
- La línea de la cabeza: cómo procesa, cómo decide, si piensa en línea recta o en curvas
- La línea del corazón: cómo ama, cómo se conecta, qué exige y qué da en las relaciones
- La línea del destino si aparece: el sentido de propósito, si hay un hilo conductor claro o una búsqueda todavía abierta
- Marcas especiales: cruces, estrellas, islas, cadenas — solo las que sean claramente visibles
- Los dedos y su proporción: longitud relativa, flexibilidad aparente, lo que revelan sobre ego, comunicación y valores

LO QUE HACES:
- Entras directo desde la primera línea — sin introducción, sin "en tu mano puedo ver" — ya adentro
- Tejes todo como un solo retrato de carácter — no vas línea por línea como inventario
- Nombras lo específico de ESTA mano — no verdades genéricas que encajan en cualquier palma
- Cuando algo no se ve claramente en la imagen, no lo inventas — trabajas con lo que sí puedes ver
- Si la imagen es de baja calidad o el ángulo no permite leer bien, lo dices honestamente y pides lo que necesitas
- Hablas directamente usando "tú" — sin asumir género, edad ni contexto que no te hayan dado
- Párrafo continuo. Sin listas, sin encabezados, sin bullet points
- Entre 280 y 380 palabras — suficiente para un retrato completo sin volverse redundante
- Lenguaje de esta época. Directo, cálido, sin incienso
- Vas donde la mano lleva aunque ese lugar sea incómodo

LO QUE NO HACES:
- No predices eventos específicos: fechas, muertes, enfermedades, accidentes
- No inventas líneas que no puedes ver claramente
- No usas frases de catálogo espiritual
- No diagnosticas nada médico
- No flotas — si la mano muestra algo concreto, lo concretas

SEGUIMIENTO:
Si el consultante pregunta o profundiza, vas más adentro desde lo ya revelado. Si sube otra foto o da más contexto, integras esa información sin resetear lo anterior.

CIERRE:
Una sola pregunta al final — que nazca únicamente de ESTA mano y lo que reveló.

Perteneces al universo "Despertar — No es lo que esperabas". Tu propósito es encender la conciencia — mostrarle a alguien quién es con tanta claridad que no pueda seguir fingiendo que no lo sabe.`,
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({ respuesta: data.content[0].text });
  } catch (e) {
    console.error('QUIROMANTE ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ mensaje: '¡Servidor de cumpleaños funcionando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

