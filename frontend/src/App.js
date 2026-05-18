import { useState, useEffect } from "react";

// eslint-disable-next-line
const API = process.env.REACT_APP_API;
const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;
console.log("KEY:", process.env.REACT_APP_ANTHROPIC_KEY);


// Wake up Render silencioso
fetch(`${API}/`).catch(() => {});

function getDaysUntilBirthday(dateStr) {
  const today = new Date();
  const parts = dateStr.split("-");
  const month = parseInt(parts[1] || parts[0]);
  const day = parseInt(parts[2] || parts[1]);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }
  const diff = Math.ceil((next - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24));
  return diff;
}

function getAge(dateStr) {
  const parts = dateStr.split("-");
  if (parts.length < 3) return null;
  const [year, month, day] = parts.map(Number);
  if (!year || year < 1900) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasBirthdayPassed = today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasBirthdayPassed) age--;
  return age;
}

function getAgeOnNextBirthday(dateStr) {
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [year, month, day] = parts;
  if (!year || year < 1900) return null;
  const today = new Date();
  const currentAge = today.getFullYear() - year;
  const hasBirthdayPassed = today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return hasBirthdayPassed ? currentAge + 1 : currentAge;
}

function zodiacSign(dateStr) {
  const parts = dateStr.split("-");
  const month = parseInt(parts[1] || parts[0]);
  const day = parseInt(parts[2] || parts[1]);
  const signs = [
    { sign: "Capricornio ♑", end: [1,19] }, { sign: "Acuario ♒", end: [2,18] },
    { sign: "Piscis ♓", end: [3,20] }, { sign: "Aries ♈", end: [4,19] },
    { sign: "Tauro ♉", end: [5,20] }, { sign: "Géminis ♊", end: [6,20] },
    { sign: "Cáncer ♋", end: [7,22] }, { sign: "Leo ♌", end: [8,22] },
    { sign: "Virgo ♍", end: [9,22] }, { sign: "Libra ♎", end: [10,22] },
    { sign: "Escorpio ♏", end: [11,21] }, { sign: "Sagitario ♐", end: [12,21] },
    { sign: "Capricornio ♑", end: [12,31] },
  ];
  for (const s of signs) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.sign;
  }
  return "";
}

function getZodiacName(dateStr) {
  const sign = zodiacSign(dateStr);
  const names = ["Capricornio","Acuario","Piscis","Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario"];
  return names.find(n => sign.startsWith(n)) || "";
}

// ─── TONALI: Cálculo del calendario mexica ───────────────────────────────────
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

const SEÑORES_DIA = [
  "Xiuhtecuhtli","Tlaltecuhtli","Chalchiuhtlicue","Tonatiuh","Tlazolteotl",
  "Mictlantecuhtli","Centeotl","Tlaloc","Quetzalcoatl","Tezcatlipoca",
  "Chalmecatl","Tlahuizcalpantecuhtli","Citlalicue"
];

const MESES_SOLAR = [
  { nombre: "Atlcahualo", desc: "Cese de las aguas" },
  { nombre: "Tlacaxipehualiztli", desc: "Desollamiento de hombres" },
  { nombre: "Tozoztontli", desc: "Pequeña vigilia" },
  { nombre: "Huey Tozoztli", desc: "Gran vigilia" },
  { nombre: "Toxcatl", desc: "La sequía" },
  { nombre: "Etzalcualiztli", desc: "Comida de maíz y frijol" },
  { nombre: "Tecuilhuitontli", desc: "Pequeña fiesta de los señores" },
  { nombre: "Huey Tecuilhuitl", desc: "Gran fiesta de los señores" },
  { nombre: "Tlaxochimaco", desc: "Nacimiento de las flores" },
  { nombre: "Xocotl Huetzi", desc: "Caída del fruto" },
  { nombre: "Ochpaniztli", desc: "La barrida" },
  { nombre: "Teotleco", desc: "Llegada de los dioses" },
  { nombre: "Tepeilhuitl", desc: "Fiesta de los cerros" },
  { nombre: "Quecholli", desc: "La garza preciosa" },
  { nombre: "Panquetzaliztli", desc: "Elevación de banderas — mes de Huitzilopochtli, el Colibrí del Sur" },
  { nombre: "Atemoztli", desc: "Descenso del agua" },
  { nombre: "Tititl", desc: "Estiramiento" },
  { nombre: "Izcalli", desc: "Resurrección" },
  { nombre: "Nemontemi", desc: "Días sin nombre — aciagos, de recogimiento" },
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

function calcularTonali(fechaStr) {
  const parts = fechaStr.split("-");
  const anio = parseInt(parts[0]);
  const mes = parseInt(parts[1]);
  const dia = parseInt(parts[2]);
  if (!anio || !mes || !dia) return null;

  const GMT = 584283;
  const jdn = fechaAJDN(dia, mes, anio);
  const tpDia = ((jdn - GMT) % 260 + 260) % 260;

  const numero = (tpDia % 13) + 1;
  const signoIndex = tpDia % 20;
  const signo = SIGNOS_TONALPOHUALLI[signoIndex];

  // Trecena: retroceder al día 1 del ciclo actual
  const inicioTrecena = tpDia - (numero - 1);
  const signoTrecenaIndex = ((inicioTrecena % 20) + 20) % 20;
  const signoTrecena = SIGNOS_TONALPOHUALLI[signoTrecenaIndex];

  // Señor de la noche
  const señorNocheIndex = ((jdn - GMT) % 9 + 9) % 9;
  const señorNoche = SEÑORES_NOCHE[señorNocheIndex];

  // Señor del día
  const señorDia = SEÑORES_DIA[numero - 1];

  // Mes solar
  const xiuhDia = ((jdn - GMT) % 365 + 365) % 365;
  const mesSolarIndex = Math.min(Math.floor(xiuhDia / 20), 18);
  const diaSolar = (xiuhDia % 20) + 1;
  const mesSolar = MESES_SOLAR[mesSolarIndex];

  // Año
  const añosTranscurridos = Math.floor((jdn - GMT) / 365);
  const numAño = (((añosTranscurridos % 13) + 13) % 13) + 1;
  const signoAñoIndex = ((añosTranscurridos % 4) + 4) % 4;
  const signoAño = SIGNOS_AÑO[signoAñoIndex];

  return { numero, signo, signoTrecena, señorNoche, señorDia, diaSolar, mesSolar, numAño, signoAño };
}
// ─────────────────────────────────────────────────────────────────────────────

const ZODIAC_DATA = {
  "Aries": {
    emoji: "♈",
    descripcion: "Pionero, apasionado y directo. Nació para liderar.",
    compatible: ["Leo", "Sagitario", "Géminis"],
    evitar: ["Cáncer", "Capricornio"],
    consejo: "No intentes ganarle una discusión — simplemente no vale la pena.",
    fortaleza: "Energía inagotable y valentía",
    debilidad: "Impulsivo y terco como una pared"
  },
  "Tauro": {
    emoji: "♉",
    descripcion: "Leal, paciente y amante del placer. Es el amigo que nunca falla.",
    compatible: ["Virgo", "Capricornio", "Cáncer"],
    evitar: ["Acuario", "Leo"],
    consejo: "Jamás lo apresures. Llegará cuando llegue, y llegará bien.",
    fortaleza: "Constancia y confiabilidad",
    debilidad: "Terco de campeonato cuando se le mete algo"
  },
  "Géminis": {
    emoji: "♊",
    descripcion: "Curioso, adaptable y brillante. Dos personalidades en una.",
    compatible: ["Libra", "Acuario", "Aries"],
    evitar: ["Piscis", "Virgo"],
    consejo: "No esperes que tome una decisión rápido. Tiene dos mentes funcionando.",
    fortaleza: "Comunicación e ingenio",
    debilidad: "Inconstante y difícil de seguirle el paso"
  },
  "Cáncer": {
    emoji: "♋",
    descripcion: "Intuitivo, protector y profundamente emocional. El corazón del grupo.",
    compatible: ["Escorpio", "Piscis", "Tauro"],
    evitar: ["Aries", "Libra"],
    consejo: "Cuida sus sentimientos — tiene memoria de elefante para las heridas.",
    fortaleza: "Lealtad y empatía desbordante",
    debilidad: "Se ofende con facilidad y guarda rencor"
  },
  "Leo": {
    emoji: "♌",
    descripcion: "Carismático, generoso y espectacular. Nació bajo los reflectores.",
    compatible: ["Aries", "Sagitario", "Géminis"],
    evitar: ["Tauro", "Escorpio"],
    consejo: "Dale su lugar y su reconocimiento — no es vanidad, es combustible.",
    fortaleza: "Liderazgo natural y generosidad",
    debilidad: "Ego que a veces ocupa más espacio que él mismo"
  },
  "Virgo": {
    emoji: "♍",
    descripcion: "Analítico, servicial y perfeccionista. El que resuelve todo sin quejarse.",
    compatible: ["Tauro", "Capricornio", "Cáncer"],
    evitar: ["Sagitario", "Géminis"],
    consejo: "No le digas 'está bien así' cuando no lo está. Lo sabe.",
    fortaleza: "Precisión y dedicación",
    debilidad: "Crítico consigo mismo y con los demás"
  },
  "Libra": {
    emoji: "♎",
    descripcion: "Justo, encantador y diplomático. Odia el conflicto casi tanto como ama la armonía.",
    compatible: ["Géminis", "Acuario", "Leo"],
    evitar: ["Cáncer", "Capricornio"],
    consejo: "No lo pongas a elegir. Es su kryptonita.",
    fortaleza: "Equilibrio y don de gentes",
    debilidad: "Indeciso hasta el infinito"
  },
  "Escorpio": {
    emoji: "♏",
    descripcion: "Intenso, magnético y misterioso. Lo que ves es solo la superficie.",
    compatible: ["Cáncer", "Piscis", "Capricornio"],
    evitar: ["Leo", "Acuario"],
    consejo: "Nunca le mientas. Lo sabe antes de que termines la oración.",
    fortaleza: "Determinación y profundidad emocional",
    debilidad: "Rencoroso y celoso cuando se siente traicionado"
  },
  "Sagitario": {
    emoji: "♐",
    descripcion: "Aventurero, filosófico y honesto. La libertad es su religión.",
    compatible: ["Aries", "Leo", "Libra"],
    evitar: ["Virgo", "Piscis"],
    consejo: "No intentes enjaularlo. Se irá sin voltear.",
    fortaleza: "Optimismo y sed de conocimiento",
    debilidad: "Le cuesta comprometerse y a veces es brutalmente honesto"
  },
  "Capricornio": {
    emoji: "♑",
    descripcion: "Ambicioso, disciplinado y responsable. El que termina lo que empieza.",
    compatible: ["Tauro", "Virgo", "Escorpio"],
    evitar: ["Aries", "Libra"],
    consejo: "No lo interrumpas cuando está trabajando. Hay consecuencias.",
    fortaleza: "Perseverancia y sentido práctico",
    debilidad: "Workaholic y a veces frío emocionalmente"
  },
  "Acuario": {
    emoji: "♒",
    descripcion: "Visionario, original e independiente. Vive en el futuro.",
    compatible: ["Géminis", "Libra", "Sagitario"],
    evitar: ["Tauro", "Escorpio"],
    consejo: "No le digas que su idea es rara. Para él eso es un cumplido.",
    fortaleza: "Originalidad y pensamiento innovador",
    debilidad: "Distante emocionalmente y muy en su mundo"
  },
  "Piscis": {
    emoji: "♓",
    descripcion: "Soñador, empático y creativo. Vive entre la realidad y otro plano.",
    compatible: ["Cáncer", "Escorpio", "Tauro"],
    evitar: ["Géminis", "Sagitario"],
    consejo: "No lo bombardees con lógica cuando está en modo emocional. Espera.",
    fortaleza: "Intuición y compasión sin límites",
    debilidad: "Se pierde en sus propios sueños y evita la confrontación"
  }
};

async function fetchCapsula(nombre, fecha) {
  const parts = fecha.split("-");
  const day = parseInt(parts[2]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[0]);
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const fechaTexto = `${day} de ${meses[month-1]} de ${year}`;

  const prompt = `El usuario quiere saber datos curiosos e históricos del día en que nació ${nombre}: ${fechaTexto}. Su signo zodiacal es ${getZodiacName(fecha)}.

Responde ÚNICAMENTE con un objeto JSON con exactamente esta estructura, sin texto adicional, sin markdown, sin backticks:

{
  "evento1": "Un evento histórico importante que ocurrió en esa fecha exacta (mismo día y mes, cualquier año cercano). Que sea real.",
  "evento2": "Otro evento histórico diferente del mismo día o año de nacimiento.",
  "musica1": "El artista o banda más popular en el año de nacimiento.",
  "musica2": "Otro dato musical de esa época, puede ser un álbum icónico, un género emergente, etc.",
  "entretenimiento1": "Una serie, película o caricatura famosa de esa época.",
  "entretenimiento2": "Otro programa, película o caricatura diferente del mismo año.",
  "deporte1": "Un logro deportivo importante del año de nacimiento (puede ser fútbol, boxeo, atletismo, etc.).",
  "deporte2": "Otro logro deportivo de ese año, de una disciplina diferente.",
  "luna": "La fase lunar aproximada para esa fecha exacta (Luna llena, Luna nueva, Cuarto creciente, Cuarto menguante).",
  "precio": "El precio curioso de algo cotidiano en ese año (comida, cine, gasolina, etc.) con comparación al presente.",
  "dato_curioso": "Un dato sorprendente o divertido sobre ese año o fecha.",
  "recomendacion": "Una recomendación de vida divertida y con humor para ${nombre} basada en su signo ${getZodiacName(fecha)}. Algo que podría intentar hacer, con un toque cómico relacionado a la personalidad de su signo. Ejemplo: 'Con tu energía de Aries, podrías intentar hacer cerámica... aunque probablemente termines lanzando el barro por impaciencia.'"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  console.log("Respuesta Anthropic:", JSON.stringify(data));
  const text = data.content[0].text.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

const COLORS = [
  "#FF6B6B","#FFB347","#FFD93D","#6BCB77","#4D96FF","#C77DFF","#FF85A1","#00C9A7"
];

function Avatar({ name, color, foto, size = 48 }) {
  if (foto) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
      <img src={foto} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#1a1a2e", flexShrink: 0,
      fontFamily: "'Playfair Display', serif"
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Badge({ days }) {
  let bg, text;
  if (days === 0) { bg = "#FF6B6B"; text = "¡HOY! 🎉"; }
  else if (days <= 7) { bg = "#FFB347"; text = `${days}d`; }
  else if (days <= 30) { bg = "#FFD93D"; text = `${days}d`; }
  else { bg = "#2d2d4e"; text = `${days}d`; }
  return (
    <span style={{
      background: bg, color: days === 0 ? "#fff" : days <= 30 ? "#1a1a2e" : "#aaa",
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700,
      fontFamily: "monospace", whiteSpace: "nowrap"
    }}>{text}</span>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || '');
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' });
  const [authMode, setAuthMode] = useState("login");
  const [personas, setPersonas] = useState([]);
  const [view, setView] = useState("lista");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nombre: "", apodo: "", fecha: "", gustos: "", notas: "", foto: "", fotoPos: "50% 50%" });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [capsula, setCapsula] = useState(null);
  const [capsulaLoading, setCapsulaLoading] = useState(false);
  const [capsulaError, setCapsulaError] = useState(null);
  const [tonali, setTonali] = useState(null);
  const [tonaliVisible, setTonaliVisible] = useState(false);
  const [akashic, setAkashic] = useState(null);
  const [akashicLoading, setAkashicLoading] = useState(false);
  const [akashicError, setAkashicError] = useState(null);
  const [showAuthor, setShowAuthor] = useState(false);
  // eslint-disable-next-line
  const [tick, setTick] = useState(0);
  const [pareja, setPareja] = useState(null);
  const [viewPareja, setViewPareja] = useState(false);
  const [parejaForm, setParejaForm] = useState({
    persona_id: "", fecha_conocieron: "", lugar_conocieron: "",
    fecha_compromiso: "", fecha_boda: "", detalles_importantes: ""
  });
  const [enRelacion, setEnRelacion] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    fetch(`${API}/personas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setPersonas(data.map(p => ({ ...p, fecha: p.fecha.split("T")[0] }))))
      .catch(err => console.error(err));

    fetch(`${API}/pareja`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data) {
          setPareja(data);
          setEnRelacion(true);
          setParejaForm({
            persona_id: data.persona_id || "",
            fecha_conocieron: data.fecha_conocieron ? data.fecha_conocieron.split("T")[0] : "",
            lugar_conocieron: data.lugar_conocieron || "",
            fecha_compromiso: data.fecha_compromiso ? data.fecha_compromiso.split("T")[0] : "",
            fecha_boda: data.fecha_boda ? data.fecha_boda.split("T")[0] : "",
            detalles_importantes: data.detalles_importantes || ""
          });
        }
      })
      .catch(err => console.error(err));
  }, [loggedIn]);

  const sorted = [...personas]
    .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .map(p => ({ ...p, days: getDaysUntilBirthday(p.fecha) }))
    .sort((a, b) => a.days - b.days);

  const upcoming = sorted.filter(p => p.days <= 30);

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.fecha) return;
    try {
      const endpoint = editId !== null ? `${API}/personas/${editId}` : `${API}/personas`;
      const method = editId !== null ? "PUT" : "POST";
      const body = editId !== null ? form : { ...form, color: COLORS[personas.length % COLORS.length] };
      
      const r = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      const fechaLimpia = data.fecha ? data.fecha.substring(0, 10) : form.fecha;
      const persona = { ...data, fecha: fechaLimpia };
      
      if (editId !== null) {
        setPersonas(personas.map(p => p.id === editId ? persona : p));
        setEditId(null);
      } else {
        setPersonas([...personas, persona]);
      }
      setForm({ nombre: "", apodo: "", fecha: "", gustos: "", notas: "", foto: "", fotoPos: "50% 50%" });
      setView("lista");
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/personas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setPersonas(personas.filter(p => p.id !== id));
    setView("lista");
    setSelected(null);
  };

  const handleEdit = (p) => {
    setForm({ nombre: p.nombre, apodo: p.apodo || "", fecha: p.fecha, gustos: p.gustos || "", notas: p.notas || "", foto: p.foto || "", fotoPos: p.fotoPos || "50% 50%" });
    setEditId(p.id);
    setView("form");
  };

  const handleDescubrirDia = async (persona) => {
    setCapsula(null);
    setCapsulaError(null);
    setCapsulaLoading(true);
    try {
      if (persona.capsula) {
        setCapsula(JSON.parse(persona.capsula));
        setCapsulaLoading(false);
        return;
      }
      const data = await fetchCapsula(persona.nombre, persona.fecha);
      await fetch(`${API}/personas/${persona.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...persona, capsula: JSON.stringify(data) })
      });
      setPersonas(personas.map(p => p.id === persona.id ? { ...p, capsula: JSON.stringify(data) } : p));
      setCapsula(data);
    } catch (e) {
      setCapsulaError("No se pudo obtener la cápsula. Intenta de nuevo.");
    }
    setCapsulaLoading(false);
  };

  // ── Mostrar Tónali ─────────────────────────────────────────
  const handleMostrarTonali = (persona) => {
    const resultado = calcularTonali(persona.fecha);
    setTonali(resultado);
    setTonaliVisible(true);
  };

  // ── Lectura del Alma — Registros Akáshicos ─────────────────
  const handleLecturaAlma = async (persona) => {
    setAkashic(null);
    setAkashicError(null);
    setAkashicLoading(true);

    try {
      // Si ya tiene lectura guardada, usarla directo
      if (persona.akashic) {
        setAkashic(JSON.parse(persona.akashic));
        setAkashicLoading(false);
        return;
      }

      const parts = persona.fecha.split("-");
      const anio = parseInt(parts[0]);
      const mes = parseInt(parts[1]);
      const dia = parseInt(parts[2]);
      const signoZodiacal = getZodiacName(persona.fecha);
      const tonaliData = calcularTonali(persona.fecha);

      // Numerología
      const numDia = dia;
      const numAnio = String(anio).split("").reduce((a, b) => a + parseInt(b), 0);
      const reducir = n => { while (n > 9 && n !== 11 && n !== 22 && n !== 33) { n = String(n).split("").reduce((a, b) => a + parseInt(b), 0); } return n; };
      const numVida = reducir(dia + mes + anio);

      const prompt = `Eres un lector experto en Registros Akáshicos con profundo conocimiento de numerología, astrología, y cosmovisión mesoamericana. Basándote en los datos de esta persona, genera una lectura akáshica profunda, poética y muy personal. NO uses lenguaje genérico — habla directamente al alma de esta persona como si realmente pudieras ver su registro único.

Datos de la persona:
- Nombre: ${persona.nombre}
- Fecha de nacimiento: ${dia}/${mes}/${anio}
- Signo zodiacal: ${signoZodiacal}
- Tónali mexica: ${tonaliData ? `${tonaliData.numero} ${tonaliData.signo.nombre}` : "desconocido"}
- Trecena: ${tonaliData ? `Ce ${tonaliData.signoTrecena.nombre}` : "desconocida"}
- Señor de la Noche: ${tonaliData ? tonaliData.señorNoche.nombre : "desconocido"}
- Mes solar: ${tonaliData ? tonaliData.mesSolar.nombre : "desconocido"}
- Número de vida (numerología): ${numVida}
- Número del día: ${numDia}

Responde ÚNICAMENTE con un objeto JSON con exactamente esta estructura, sin texto adicional, sin markdown, sin backticks:

{
  "proposito": "El propósito del alma en esta encarnación — 3 a 4 oraciones íntimas y específicas basadas en los datos.",
  "dones": "Los dones y talentos traídos desde vidas anteriores — 3 a 4 oraciones poéticas y específicas.",
  "karma": "Los patrones kármicos o aprendizajes pendientes — 3 a 4 oraciones honestas y compasivas.",
  "arquetipo": "El arquetipo que representa esta alma — nombra el arquetipo y explícalo en 2 a 3 oraciones.",
  "mensaje": "Un mensaje directo e íntimo del Registro para esta persona — 2 a 3 oraciones que solo podrían ser para ella."
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const lectura = JSON.parse(clean);

      // Guardar en base de datos
      await fetch(`${API}/personas/${persona.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...persona, akashic: JSON.stringify(lectura) })
      });
      setPersonas(personas.map(p => p.id === persona.id ? { ...p, akashic: JSON.stringify(lectura) } : p));
      setAkashic(lectura);

    } catch (e) {
      console.error(e);
      setAkashicError("No se pudo abrir el Registro. Intenta de nuevo.");
    }
    setAkashicLoading(false);
  };

  const persona = selected ? personas.find(p => p.id === selected) : null;

  if (!loggedIn) return (
    <div style={{
      minHeight: "100vh", background: "#0f0f1e",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#1a1a2e", borderRadius: 20, padding: 32, width: 300, border: "1px solid #2a2a4e" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🏛️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 8 }}>
            La Bóveda de Cronos
          </div>
          <div style={{ display: "flex", marginTop: 16, background: "#0f0f1e", borderRadius: 10, padding: 4 }}>
            {["login", "registro"].map(mode => (
              <button key={mode} onClick={() => setAuthMode(mode)} style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
                background: authMode === mode ? "linear-gradient(135deg, #6C63FF, #FF6B9D)" : "transparent",
                color: authMode === mode ? "#fff" : "#6666aa", fontWeight: 700, fontSize: 13
              }}>
                {mode === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        </div>

        {["usuario", "password"].map(f => (
          <div key={f} style={{ marginBottom: 14 }}>
            <input
              type={f === "password" ? "password" : "text"}
              placeholder={f === "usuario" ? "Usuario" : "Contraseña"}
              value={loginForm[f]}
              onChange={e => setLoginForm(l => ({ ...l, [f]: e.target.value }))}
              style={{
                width: "100%", background: "#0f0f1e", border: "1px solid #2a2a4e",
                borderRadius: 10, padding: "12px 14px", color: "#e8e8f0",
                fontSize: 14, boxSizing: "border-box", outline: "none"
              }}
            />
          </div>
        ))}

        <button onClick={async () => {
          const endpoint = authMode === "login" ? "/login" : "/register";
          const r = await fetch(`${API}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginForm)
          });
          const data = await r.json();
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', data.usuario);
            setToken(data.token);
            setUsuario(data.usuario);
            setLoggedIn(true);
          } else {
            alert(data.error || "Error al procesar la solicitud");
          }
        }} style={{
          width: "100%", background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
          border: "none", borderRadius: 12, padding: 14,
          color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer"
        }}>
          {authMode === "login" ? "Entrar 🔐" : "Crear cuenta ✨"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f1e",
      fontFamily: "'DM Sans', sans-serif", color: "#e8e8f0",
      maxWidth: 480, margin: "0 auto", position: "relative"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .no-print { display: none !important; }
          .print-card {
            background: #fff !important;
            color: #111 !important;
            border: 1px solid #ddd !important;
            border-left-color: inherit !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-header { color: #111 !important; }
          .print-label { color: #333 !important; }
          .print-value { color: #111 !important; }
          .print-muted { color: #555 !important; }
          button { display: none !important; }
          a { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{
        padding: "24px 20px 12px", background: "linear-gradient(135deg, #1a1a3e 0%, #0f0f1e 100%)",
        borderBottom: "1px solid #2a2a4e"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              🏛️ La Bóveda de Cronos
            </div>
            <div style={{ fontSize: 12, color: "#6666aa", marginTop: 2 }}>
              <span
                onClick={() => setShowAuthor(true)}
                style={{ cursor: "pointer", color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}
                title="Contactar al autor"
              >-=ArtMoreno=-</span> · 👤 {usuario} · {personas.length} {personas.length === 1 ? "persona" : "personas"} guardadas
            </div>
          </div>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            setToken('');
            setUsuario('');
            setLoggedIn(false);
            setPersonas([]);
          }} style={{
            background: "rgba(255,107,107,0.15)", border: "1px solid #FF6B6B44",
            borderRadius: 10, padding: "6px 12px", color: "#FF6B6B",
            fontSize: 12, fontWeight: 700, cursor: "pointer", marginRight: 8
          }}>
            Salir
          </button>

          <button onClick={() => { setForm({ nombre: "", fecha: "", gustos: "", notas: "" }); setEditId(null); setView("form"); }}
            style={{
              background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
              border: "none", borderRadius: 14, width: 44, height: 44,
              color: "#fff", fontSize: 22, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>+</button>
        </div>

        {upcoming.length > 0 && view === "lista" && (
          <div style={{ marginTop: 16, background: "#1a1a3e", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              PRÓXIMOS 30 DÍAS
            </div>
            {upcoming.slice(0,3).map(p => (
              <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); setCapsula(null); setTonali(null); setTonaliVisible(false); setAkashic(null); setAkashicError(null); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
                <Avatar name={p.nombre} color={p.color} foto={p.foto} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: "#6666aa" }}>{zodiacSign(p.fecha)}</div>
                </div>
                <Badge days={p.days} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vista lista */}
      {view === "lista" && (
        <div style={{ padding: "16px 20px" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar persona..."
            style={{
              width: "100%", background: "#1a1a2e", border: "1px solid #2a2a4e",
              borderRadius: 10, padding: "10px 14px", color: "#e8e8f0",
              fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none"
            }}
          />
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", color: "#444", marginTop: 60 }}>
              <div style={{ fontSize: 48 }}>🎈</div>
              <div style={{ marginTop: 12, fontSize: 14 }}>Agrega tu primera persona</div>
            </div>
          )}
          {sorted.map(p => (
            <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); setCapsula(null); setTonali(null); setTonaliVisible(false); setAkashic(null); setAkashicError(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#1a1a2e", borderRadius: 14, padding: "14px",
                marginBottom: 10, cursor: "pointer", border: "1px solid #2a2a3e"
              }}>
              <Avatar name={p.nombre} color={p.color} foto={p.foto} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "#6666aa", marginTop: 2 }}>
                  {(() => { const p2 = p.fecha.split("-"); return `${p2[2]}/${p2[1]}/${p2[0]}`; })()} · {zodiacSign(p.fecha)}
                </div>
              </div>
              <Badge days={p.days} />
            </div>
          ))}
        </div>
      )}

      {/* Vista formulario */}
      {view === "form" && (
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => setView("lista")} style={{ background: "none", border: "none", color: "#6C63FF", fontSize: 20, cursor: "pointer" }}>←</button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
              {editId ? "Editar persona" : "Nueva persona"}
            </div>
          </div>

          {[
            { label: "Nombre *", key: "nombre", type: "text", placeholder: "¿Cómo se llama?" },
            { label: "Apodo / Como se le llama", key: "apodo", type: "text", placeholder: "Ej: Güero, Chuy, Lore..." },
            { label: "Gustos / Intereses", key: "gustos", type: "text", placeholder: "Café, música, libros..." },
            { label: "Notas", key: "notas", type: "text", placeholder: "Cualquier cosa que quieras recordar..." },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6666aa", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>{f.label}</div>
              <input
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                type={f.type}
                placeholder={f.placeholder}
                style={{
                  width: "100%", background: "#1a1a2e", border: "1px solid #2a2a4e",
                  borderRadius: 10, padding: "12px 14px", color: "#e8e8f0",
                  fontSize: 14, boxSizing: "border-box", outline: "none"
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#6666aa", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>Fecha de nacimiento *</div>
            <input
              type="date"
              value={form.fecha}
              onChange={e => {
                const val = e.target.value;
                const match = val.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                  setForm({ ...form, fecha: `${match[1]}-${match[2]}-${match[3]}` });
                } else {
                  setForm({ ...form, fecha: val });
                }
              }}
              style={{
                width: "100%", background: "#1a1a2e", border: "1px solid #2a2a4e",
                borderRadius: 10, padding: "12px 14px", color: "#e8e8f0",
                fontSize: 14, boxSizing: "border-box", outline: "none",
                WebkitAppearance: "none", appearance: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#6666aa", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>Foto (opcional)</div>
            <label style={{
              display: "flex", alignItems: "center", gap: 12, background: "#1a1a2e",
              border: "1px dashed #2a2a4e", borderRadius: 10, padding: "12px 14px", cursor: "pointer"
            }}>
              {form.foto
                ? <img src={form.foto} alt="preview" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                : <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#2a2a4e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📷</div>
              }
              <span style={{ fontSize: 13, color: "#6666aa" }}>{form.foto ? "Cambiar foto" : "Subir foto"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 400;
                    let w = img.width, h = img.height;
                    if (w > h && w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
                    else if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    setForm(f => ({ ...f, foto: canvas.toDataURL('image/jpeg', 0.7) }));
                  };
                  img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {form.foto && <button onClick={() => setForm(f => ({ ...f, foto: "" }))}
              style={{ marginTop: 6, background: "none", border: "none", color: "#FF6B6B", fontSize: 12, cursor: "pointer" }}>
              × Quitar foto
            </button>}
          </div>

          <button onClick={handleSubmit}
            style={{
              width: "100%", background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
              border: "none", borderRadius: 12, padding: "14px",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8
            }}>
            {editId ? "Guardar cambios" : "Agregar persona"} ✔
          </button>
        </div>
      )}

      {/* Vista detalle */}
      {view === "detalle" && persona && (() => {
        const days = getDaysUntilBirthday(persona.fecha);
        const parts = persona.fecha.split("-");
        const d = parts[2], m = parts[1], y = parts[0];
        const currentAge = getAge(persona.fecha);
        const nextAge = getAgeOnNextBirthday(persona.fecha);
        const signoNombre = getZodiacName(persona.fecha);
        const zodiacData = ZODIAC_DATA[signoNombre];

        const handleDrag = (e) => {
          if (!persona.foto) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const x = Math.round(((clientX - rect.left) / rect.width) * 100);
          const yy = Math.round(((clientY - rect.top) / rect.height) * 100);
          const clamped = `${Math.min(100,Math.max(0,x))}% ${Math.min(100,Math.max(0,yy))}%`;
          const updated = personas.map(p => p.id === persona.id ? { ...p, fotoPos: clamped } : p);
          setPersonas(updated);
          fetch(`${API}/personas/${persona.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...persona, fotoPos: clamped })
          });
        };

        return (
          <div>
            {/* Hero */}
            <div
              style={{ position: "relative", height: 280, overflow: "hidden", cursor: persona.foto ? "crosshair" : "default",
                background: persona.foto ? "none" : `linear-gradient(135deg, ${persona.color}55, #1a1a2e)` }}
              onClick={handleDrag}
              onTouchEnd={handleDrag}
            >
              {persona.foto && (
                <img src={persona.foto} alt={persona.nombre} style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                  objectPosition: persona.fotoPos || "50% 50%",
                  pointerEvents: "none", userSelect: "none"
                }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(15,15,30,0.92) 100%)", pointerEvents: "none" }} />

              <button onClick={e => { e.stopPropagation(); setView("lista"); }} style={{
                position: "absolute", top: 16, left: 16,
                background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 18, cursor: "pointer", padding: "6px 14px", backdropFilter: "blur(4px)", zIndex: 2
              }}>←</button>

              {persona.foto && (
                <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "4px 8px", fontSize: 10, color: "#aaa", backdropFilter: "blur(4px)" }}>
                  👆 toca para reencuadrar
                </div>
              )}

              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
                <div style={{
                  background: "rgba(15,15,30,0.78)", backdropFilter: "blur(10px)",
                  borderRadius: 16, padding: "16px", border: "1px solid rgba(255,255,255,0.08)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
                    {persona.nombre}
                  </div>
                  {persona.apodo && (
                    <div style={{ fontSize: 14, color: persona.color, fontWeight: 600, marginTop: 2 }}>
                      "{persona.apodo}"
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#888", marginTop: 6, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>{zodiacSign(persona.fecha)}</span>
                    <span style={{ color: "#333" }}>·</span>
                    <span>📅 {d}/{m}/{y}</span>
                    {currentAge && <><span style={{ color: "#333" }}>·</span><span style={{ color: persona.color, fontWeight: 700 }}>{currentAge} años</span></>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 20px" }}>

              {/* Días para cumpleaños */}
              <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12, textAlign: "center" }}>
                {days === 0
                  ? <>
                      <div style={{ fontSize: 20, color: "#FF6B6B", fontWeight: 700 }}>🎉 ¡Hoy es su cumpleaños!</div>
                      {nextAge && <div style={{ fontSize: 15, color: "#FFB347", marginTop: 6 }}>¡Cumple <b>{nextAge}</b> años hoy! {nextAge >= 60 ? "👴 ya está viejito" : nextAge >= 40 ? "🙂 madurando bien" : "🎈"}</div>}
                    </>
                  : <>
                      <div style={{ fontSize: 36, fontWeight: 700, color: "#6C63FF", fontFamily: "'Playfair Display', serif" }}>{days}</div>
                      <div style={{ fontSize: 13, color: "#6666aa" }}>días para su cumpleaños</div>
                      {nextAge && <div style={{ fontSize: 14, color: "#FFB347", marginTop: 8 }}>Cumplirá <b>{nextAge}</b> años {nextAge >= 60 ? "👴 ya está grande" : nextAge >= 40 ? "🙂" : "🎈"}</div>}
                      {currentAge && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Actualmente tiene {currentAge} años</div>}
                    </>
                }
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 8 }}>📅 {d}/{m}/{y}</div>
              </div>

              {/* Contador de vida */}
              {currentAge !== null && (() => {
                const birthDate = new Date(persona.fecha);
                const now = new Date();
                const totalSeconds = Math.floor((now - birthDate) / 1000);
                const totalMinutes = Math.floor(totalSeconds / 60);
                const totalHours = Math.floor(totalMinutes / 60);
                const totalDays = Math.floor(totalHours / 24);
                const totalWeeks = Math.floor(totalDays / 7);
                const totalMonths = currentAge * 12 + (now.getMonth() - birthDate.getMonth() + (now.getDate() >= birthDate.getDate() ? 0 : -1));
                const fmt = n => n.toLocaleString("es-MX");
                return (
                  <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#00C9A7", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>⏳ CONTADOR DE VIDA</div>
                    <div style={{ fontSize: 13, color: "#aaa", marginBottom: 10, lineHeight: 1.7 }}>
                      <b style={{color:"#e8e8f0"}}>{persona.nombre.split(" ")[0]}</b> lleva <b style={{color:"#FFD93D"}}>{currentAge} años</b> en este planeta, que son:
                    </div>
                    {[
                      { label: "Meses", value: fmt(totalMonths), icon: "🗓️", color: "#FF6B6B" },
                      { label: "Semanas", value: fmt(totalWeeks), icon: "📆", color: "#FFB347" },
                      { label: "Días", value: fmt(totalDays), icon: "☀️", color: "#FFD93D" },
                      { label: "Horas", value: fmt(totalHours), icon: "⏰", color: "#6C63FF" },
                      { label: "Minutos", value: fmt(totalMinutes), icon: "⚡", color: "#C77DFF" },
                      { label: "Segundos", value: fmt(totalSeconds), icon: "💓", color: "#FF85A1" },
                    ].map((item, i) => (
                      <div key={item.label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 0", borderBottom: i < 5 ? "1px solid #2a2a3e" : "none"
                      }}>
                        <span style={{ fontSize: 13, color: "#aaa" }}>{item.icon} {item.label}</span>
                        <span style={{ fontSize: i >= 4 ? 13 : 16, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "#444", marginTop: 10, textAlign: "center" }}>...y contando 💓</div>
                  </div>
                );
              })()}

              {/* Cápsula del día */}
              <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#FFD93D", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🌍 CÁPSULA DEL DÍA QUE LLEGASTE AL MUNDO</div>
                {!capsula && !capsulaLoading && (
                  <button onClick={() => handleDescubrirDia(persona)} style={{
                    width: "100%", background: "linear-gradient(135deg, #FFD93D22, #FF6B6B22)",
                    border: "1px solid #FFD93D55", borderRadius: 10, padding: "12px",
                    color: "#FFD93D", fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>
                    ✨ Que pasaba el día que Naciste ✨
                  </button>
                )}
                {capsulaLoading && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#6666aa", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔮</div>
                    Viajando en el tiempo...
                  </div>
                )}
                {capsulaError && (
                  <div style={{ color: "#FF6B6B", fontSize: 13, textAlign: "center" }}>
                    {capsulaError}
                    <button onClick={() => handleDescubrirDia(persona)}
                      style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "#6C63FF", cursor: "pointer", fontSize: 13 }}>
                      Intentar de nuevo
                    </button>
                  </div>
                )}
                {capsula && (
                  <div>
                    {[
                      { icon: "📰", label: "Evento histórico", value: capsula.evento1, color: "#FF6B6B" },
                      { icon: "📰", label: "Otro evento", value: capsula.evento2, color: "#FF8E8E" },
                      { icon: "🌙", label: "Estado de la luna", value: capsula.luna, color: "#C77DFF" },
                      { icon: "🎵", label: "Música de la época", value: capsula.musica1, color: "#00C9A7" },
                      { icon: "🎶", label: "Más música", value: capsula.musica2, color: "#00E5BC" },
                      { icon: "📺", label: "En la tele / cine", value: capsula.entretenimiento1, color: "#4D96FF" },
                      { icon: "🎬", label: "Más entretenimiento", value: capsula.entretenimiento2, color: "#7BB8FF" },
                      { icon: "⚽", label: "Deporte", value: capsula.deporte1, color: "#6BCB77" },
                      { icon: "🏀", label: "Más deporte", value: capsula.deporte2, color: "#8FE09A" },
                      { icon: "💰", label: "Precios de la época", value: capsula.precio, color: "#FFD93D" },
                      { icon: "💡", label: "Dato curioso", value: capsula.dato_curioso, color: "#FFB347" },
                      { icon: "🌟", label: "Algo que podrías intentar", value: capsula.recomendacion, color: "#FF85A1" },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 11 ? "1px solid #2a2a3e" : "none" }}>
                        <div style={{ fontSize: 11, color: item.color, fontWeight: 700, marginBottom: 4 }}>{item.icon} {item.label.toUpperCase()}</div>
                        <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{item.value}</div>
                      </div>
                    ))}
                    <div style={{ textAlign: "center", marginTop: 10 }}>
                      <span onClick={() => setShowAuthor(true)} style={{ fontSize: 10, color: "#00C9A7", fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>-=ArtMoreno=-</span>
                    </div>
                    <button onClick={() => setCapsula(null)}
                      style={{ background: "none", border: "none", color: "#444", fontSize: 11, cursor: "pointer", marginTop: 4 }}>
                      × Cerrar
                    </button>
                  </div>
                )}
              </div>

              {/* ── TÓNALI MEXICA ─────────────────────────────────────── */}
              <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#FFB347", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  🦅 TÓNALI — CALENDARIO MEXICA 🦅
                </div>

                {!tonaliVisible && (
                  <button onClick={() => handleMostrarTonali(persona)} style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #B8860B22, #FFB34722)",
                    border: "1px solid #FFB34755", borderRadius: 10, padding: "12px",
                    color: "#FFB347", fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>
                    🌀 Descubrir mi signo Mexica 🌀
                  </button>
                )}

                {tonaliVisible && tonali && (() => {
                  const { numero, signo, signoTrecena, señorNoche, señorDia, diaSolar, mesSolar, numAño, signoAño } = tonali;

                  // Descripciones enriquecidas por signo
                  const descSignoRica = {
                    "Cuauhtli": `El Águila es uno de los signos más poderosos del calendario mexica. Se asocia con el sol y la luz — el águila es el ave que vuela más alto, la que mira de frente al astro rey. Representa visión y claridad, la capacidad de ver lo que otros no ven; voluntad y determinación, el espíritu guerrero; y liderazgo natural. Los nacidos bajo este signo se consideraban personas con una misión importante y vocación de elevarse por encima de lo ordinario.`,
                    "Ocelotl": `El Jaguar es el guerrero de la oscuridad. Rige las fuerzas nocturnas y el poder oculto. Los nacidos bajo este signo poseen una profundidad magnética, intuición aguda y una determinación que no se rinde. El jaguar no ataca con fuerza bruta — espera, observa y actúa con precisión. Símbolo de los guerreros jaguar, la élite militar mexica.`,
                    "Acatl": `La Caña es el símbolo de Quetzalcóatl, la serpiente emplumada, deidad de la sabiduría y la palabra. Los nacidos bajo este signo tienen una afinidad natural con el conocimiento, la filosofía y la búsqueda de la verdad. Son comunicadores natos, portadores de ideas que trascienden su tiempo.`,
                    "Xochitl": `La Flor es el signo del arte, la belleza y el amor. Los nacidos bajo Xochitl tienen el don de crear belleza en todo lo que tocan — música, poesía, relaciones humanas. Son sensibles, creativos y capaces de ver la magia donde otros solo ven lo ordinario.`,
                    "Ollin": `El Movimiento es el signo del quinto sol — el sol actual en la cosmología mexica. Es el signo del destino en acción, de lo que no puede detenerse. Quienes nacen bajo Ollin están marcados por la transformación constante y una vida de grandes cambios y grandes logros.`,
                    "Coatl": `La Serpiente representa la sabiduría ancestral y el renacimiento. Al mudar de piel, la serpiente simboliza la capacidad de transformarse y renacer más fuerte. Los nacidos bajo este signo son profundos, intuitivos y poseen un conocimiento que parece venir de muy adentro.`,
                    "Cipactli": `El Caimán es el primer signo del calendario — la fuerza primordial del origen. Representa la energía creadora que dio forma al mundo. Quienes nacen bajo Cipactli tienen una vitalidad excepcional y la capacidad de iniciar lo que otros no se atreven.`,
                  };

                  const descSignoFinal = descSignoRica[signo.nombre] || signo.desc;

                  // Descripción enriquecida de la trecena
                  const esPrimerDia = numero === 1;
                  const descTrecenaRica = esPrimerDia
                    ? `Naciste exactamente en el primer día de la trecena — el día que le da nombre al ciclo completo. Esto es poco común y muy significativo. La energía del signo se manifiesta en ti en su forma más pura y directa, sin la influencia modificadora de días anteriores. No solo perteneces a esta trecena: eres su punto de partida, el que abre el camino para los 12 días que siguen.`
                    : `Eres el día ${numero} de esta trecena. La energía del ${signoTrecena.nombre} colorea todo tu ciclo de 13 días, matizando tu tónali con las cualidades de ese signo rector.`;

                  // Descripción enriquecida del Señor de la Noche
                  const descNocheRica = {
                    "Chalchiuhtlicue": `La 'Falda de Jade', diosa de las aguas en movimiento — ríos, lagos, corrientes. Representa la fluidez emocional, la fertilidad y la protección. Tu lado nocturno, interior, es profundo y sensible aunque no siempre lo muestres al exterior. El jade en la cultura mexica era el material más preciado — verde como el agua, duro como la verdad.`,
                    "Xiuhtecuhtli": `El Señor del Fuego, el más antiguo de los dioses. Tu mundo interior arde con una llama constante. Eres el que da calor a quienes te rodean, el eje alrededor del cual gira la vida. El fuego nocturno es el que nunca se apaga — purifica, transforma y da luz en la oscuridad.`,
                    "Tlaloc": `El dios de la lluvia rige tu mundo nocturno. Eres alguien que, en la intimidad, tiene el don de nutrir y dar vida a lo que toca. Como la lluvia que cae de noche sin que nadie la vea, tu impacto más profundo sucede en silencio.`,
                    "Tezcatlipoca": `El Espejo Humeante. Tu mundo interior es complejo, profundo y lleno de matices. Tezcatlipoca es el dios que ve la verdad oculta en el espejo — lo que no queremos ver de nosotros mismos y lo que nos hace más humanos.`,
                    "Quetzalcoatl": `La Serpiente Emplumada en tu lado nocturno. Tu mundo interior es un pozo de sabiduría y creatividad que no siempre sale a la superficie. Eres más profundo de lo que pareces, y tu silencio habla más que las palabras de otros.`,
                  };

                  const descNocheFinal = descNocheRica[señorNoche.nombre] || señorNoche.desc;

                  // Descripción enriquecida del mes solar
                  const descMesRica = {
                    "Panquetzaliztli": `'Elevación de banderas' — el mes de la gran fiesta de Huitzilopochtli, cuyo nombre significa literalmente 'Colibrí del Sur' o 'Colibrí Zurdo'. Nacer en este mes conecta con la energía guerrera solar y con el colibrí como símbolo de los caídos que regresan. Hay una presencia silenciosa del colibrí en tu perfil aunque no aparezca directamente en tu tónali.`,
                    "Tlacaxipehualiztli": `El mes de la renovación y el renacimiento. Nacer en este período otorga una capacidad especial de transformación — de soltar lo viejo y abrazar lo nuevo sin miedo.`,
                    "Toxcatl": `El mes de la sequía y la pureza. Nacer aquí habla de una resistencia interior extraordinaria — como la tierra que espera la lluvia sin perder la esperanza.`,
                    "Izcalli": `El mes de la resurrección. Nacer en Izcalli es nacer en el tiempo del despertar, cuando todo lo que parecía dormido vuelve a la vida.`,
                  };

                  const descMesFinal = descMesRica[mesSolar.nombre] || mesSolar.desc;

                  // Descripción enriquecida del año
                  const descAñoRica = {
                    "Acatl": `La Caña es el símbolo de Quetzalcóatl — la sabiduría, el conocimiento y la palabra sagrada. El número ${numAño} está cerca del límite del ciclo de 13, lo que le da una energía de madurez y profundidad. Nacer en un año de la Caña conecta con la búsqueda del conocimiento y la comprensión de los misterios. No es casual sentir afinidad por culturas y filosofías antiguas — tu año de nacimiento ya lo anunciaba.`,
                    "Tochtli": `El Conejo trae abundancia y alegría. Nacer en este año habla de una vida generosa, llena de celebración y de la capacidad de encontrar placer y significado en las cosas cotidianas.`,
                    "Tecpatl": `El Pedernal es la verdad que corta. Nacer en un año Tecpatl otorga una claridad casi incómoda — la capacidad de ver las cosas como son, sin adornos. Es el año de los que dicen la verdad aunque duela.`,
                    "Calli": `La Casa es el refugio y el mundo interior. Nacer en un año Calli habla de una vida construida hacia adentro — de raíces profundas, de hogar como centro del universo personal.`,
                  };

                  const descAñoFinal = descAñoRica[signoAño.nombre] || `Año ${numAño} ${signoAño.nombre} — ${signoAño.desc}.`;

                  // Resumen del perfil completo
                  const conteoAguilas = [signo.nombre, signoTrecena.nombre].filter(n => n === "Cuauhtli").length + (signo.nombre === "Cuauhtli" ? 1 : 0);
                  const mostrarResumen = signo.nombre === signoTrecena.nombre;

                  return (
                    <div>
                      {/* Signo principal */}
                      <div style={{
                        background: "linear-gradient(135deg, #2a1a0a, #1a1a2e)",
                        borderRadius: 12, padding: 16, marginBottom: 12,
                        border: "1px solid #B8860B44", textAlign: "center"
                      }}>
                        <div style={{ fontSize: 44 }}>{signo.emoji}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#FFB347", fontFamily: "'Playfair Display', serif", marginTop: 4 }}>
                          {numero} {signo.nombre}
                        </div>
                        <div style={{ fontSize: 13, color: "#ccc", marginTop: 8, lineHeight: 1.7 }}>{descSignoFinal}</div>
                      </div>

                      {/* Trecena */}
                      <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: "3px solid #FFD93D" }}>
                        <div style={{ fontSize: 10, color: "#FFD93D", fontWeight: 700, marginBottom: 4 }}>📅 TRECENA</div>
                        <div style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 700, marginBottom: 6 }}>
                          Ce (1) {signoTrecena.nombre} · Día {numero} del ciclo
                        </div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{descTrecenaRica}</div>
                      </div>

                      {/* Señor de la Noche */}
                      <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: "3px solid #C77DFF" }}>
                        <div style={{ fontSize: 10, color: "#C77DFF", fontWeight: 700, marginBottom: 4 }}>🌙 SEÑOR DE LA NOCHE</div>
                        <div style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 700, marginBottom: 6 }}>{señorNoche.nombre}</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{descNocheFinal}</div>
                      </div>

                      {/* Señor del Día */}
                      <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: "3px solid #FF6B6B" }}>
                        <div style={{ fontSize: 10, color: "#FF6B6B", fontWeight: 700, marginBottom: 4 }}>🔥 SEÑOR DEL DÍA</div>
                        <div style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 700, marginBottom: 6 }}>{señorDia}</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
                          {señorDia === "Xiuhtecuhtli"
                            ? "El Señor del Fuego, el más antiguo de los dioses mexicas. Gobierna el centro, el hogar y la transformación. Su presencia refuerza el carácter de liderazgo y la capacidad de ser un centro de gravedad para quienes te rodean — la gente orbita naturalmente alrededor del fuego."
                            : señorDia === "Tonatiuh"
                            ? "El sol en su plenitud. Eres alguien que irradia energía y claridad. Tonatiuh exige valentía — el sol no se esconde, siempre está presente, siempre da luz."
                            : señorDia === "Quetzalcoatl"
                            ? "La serpiente emplumada. Sabiduría, viento y la palabra sagrada. Tu día está marcado por la búsqueda del conocimiento y el don de comunicar lo que otros no pueden expresar."
                            : señorDia === "Tezcatlipoca"
                            ? "El Espejo Humeante. Profundidad, dualidad y el poder de ver más allá de las apariencias. Tezcatlipoca no juzga — revela."
                            : `${señorDia} rige tu número ${numero} en el ciclo diurno, otorgando su energía particular a tu día de nacimiento.`
                          }
                        </div>
                      </div>

                      {/* Mes Solar */}
                      <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: "3px solid #6BCB77" }}>
                        <div style={{ fontSize: 10, color: "#6BCB77", fontWeight: 700, marginBottom: 4 }}>📆 MES SOLAR · XIUHPOHUALLI</div>
                        <div style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 700, marginBottom: 6 }}>Día {diaSolar} de {mesSolar.nombre}</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{descMesFinal}</div>
                      </div>

                      {/* Año */}
                      <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 14, marginBottom: 12, borderLeft: "3px solid #4D96FF" }}>
                        <div style={{ fontSize: 10, color: "#4D96FF", fontWeight: 700, marginBottom: 4 }}>🗓️ AÑO</div>
                        <div style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 700, marginBottom: 6 }}>{numAño} {signoAño.nombre} — {signoAño.desc}</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{descAñoFinal}</div>
                      </div>

                      {/* Comentario personalizado — siempre visible */}
                      {(() => {
                        const nombre1 = persona.nombre.split(" ")[0];
                        const mismoSigno = signo.nombre === signoTrecena.nombre;
                        const esDia1 = numero === 1;

                        // Comentarios por signo principal
                        const comentariosPorSigno = {
                          "Cuauhtli": mismoSigno
                            ? `${nombre1} tiene una marca extraordinaria: el Águila aparece tres veces en su perfil — en el tónali, en la trecena y en el ave compañera. En la cosmovisión mexica, cuando los elementos se alinean así, no es coincidencia. Es una señal de que hay una misión clara, una energía de destino muy marcada. El cosmos no dejó lugar a dudas: esta persona nació para volar alto y ver lejos. 🦅🦅🦅`
                            : `El Águila no es un signo cualquiera. Es el ave del sol, la que vuela más alto que todas, la única que puede mirar de frente al astro rey sin parpadear. ${nombre1} tiene esa energía — una visión que va más allá de lo inmediato, un liderazgo que no necesita imponerse porque se siente de forma natural. Donde otros ven obstáculos, el Águila ve el panorama completo desde arriba. 🦅`,
                          "Ocelotl": mismoSigno
                            ? `${nombre1} lleva al Jaguar en todo su perfil. En la tradición mexica, los guerreros jaguar eran la élite — no los más ruidosos, sino los más letales en silencio. Esta doble o triple presencia del Jaguar habla de una persona que no necesita demostrar nada. Su poder se siente antes de que hable. 🐆`
                            : `El Jaguar rige la noche y lo oculto. ${nombre1} tiene una profundidad que no siempre es visible — pero está ahí, esperando el momento preciso para manifestarse. Como el jaguar que acecha en la oscuridad, no actúa por impulso sino con precisión. Lo que parece quietud es en realidad concentración pura. 🐆`,
                          "Acatl": mismoSigno
                            ? `${nombre1} está marcado por la Caña por partida doble — el signo de Quetzalcóatl, la serpiente emplumada. Esta combinación habla de alguien cuya búsqueda del conocimiento no es un pasatiempo sino una necesidad profunda del alma. La sabiduría no es para ellos un destino, es el camino mismo. 🎋`
                            : `La Caña conecta a ${nombre1} con Quetzalcóatl — el dios de la sabiduría, el viento y la palabra sagrada. Hay en esta persona una sed natural de conocimiento, una curiosidad que no tiene fondo. Las culturas antiguas, las filosofías profundas, los misterios del universo — todo eso les habla de una manera que no siempre saben explicar. 🎋`,
                          "Xochitl": mismoSigno
                            ? `${nombre1} tiene la Flor en todo su ser calendárico. En el mundo mexica, Xochitl era el signo de los artistas, los músicos, los poetas — aquellos que podían ver y crear belleza donde otros solo ven lo ordinario. Esta doble presencia dice que la sensibilidad y la creatividad no son rasgos de ${nombre1}, son su esencia. 🌸`
                            : `La Flor habla de una persona que siente el mundo de manera más intensa que los demás. ${nombre1} tiene el don de encontrar belleza en lo cotidiano, de crear conexiones emocionales profundas y de expresar lo que otros sienten pero no pueden articular. El arte, en cualquiera de sus formas, es su lenguaje natural. 🌸`,
                          "Ollin": mismoSigno
                            ? `${nombre1} lleva el Movimiento en todo su perfil — el signo del quinto sol, el sol actual. Esto habla de una vida de cambios constantes y constante renacimiento. No es que las cosas les pasen: es que están destinados a transformar todo lo que tocan. La quietud no es para ellos. 🌀`
                            : `Ollin, el Movimiento, marca a ${nombre1} con el signo del sol actual — el quinto sol de la tradición mexica. Hay en esta persona una energía que no se detiene, una capacidad de adaptación y transformación que a veces sorprende incluso a ellos mismos. El cambio no los asusta: es su elemento natural. 🌀`,
                          "Coatl": mismoSigno
                            ? `${nombre1} tiene a la Serpiente en el núcleo de su ser. La serpiente muda de piel y renace — y esta doble presencia de Coatl habla de alguien que ha pasado por transformaciones profundas y siempre ha salido renovado. La sabiduría que llevan no viene de libros: viene de haber vivido de verdad. 🐍`
                            : `La Serpiente trae a ${nombre1} una sabiduría que a veces no sabe de dónde viene. Coatl es intuición, es el conocimiento ancestral que aparece en el momento preciso. Hay una profundidad en esta persona que no siempre es evidente en la superficie — pero quienes los conocen de verdad saben que el agua corre muy honda. 🐍`,
                          "Cipactli": `${nombre1} nació bajo Cipactli — el primer signo del calendario, la fuerza primordial que da origen a todo. En la mitología mexica, Cipactli era el gran caimán del que surgió la tierra misma. Nacer bajo este signo habla de una energía creadora excepcional, de alguien que tiene la capacidad de iniciar lo que otros solo sueñan. El origen siempre tiene poder. 🐊`,
                          "Ehecatl": `El Viento, Ehecatl, es el mensajero de los dioses — libre, impredecible, capaz de estar en todas partes. ${nombre1} tiene esa cualidad: una libertad interior que no puede ser enjaulada, una capacidad de adaptación que asombra. El viento no pide permiso para pasar: simplemente pasa. 💨`,
                          "Calli": `La Casa no es un signo de quietud — es el signo del mundo interior. ${nombre1} tiene una riqueza interna que pocos alcanzan a ver desde afuera. Como una gran casa con muchas habitaciones, hay en esta persona capas y capas de profundidad. Los que logran entrar descubren un universo. 🏠`,
                          "Cuetzpalin": `La Lagartija trae a ${nombre1} una agilidad que va más allá de lo físico — es mental, emocional, adaptativa. Cuando el entorno cambia, la lagartija ya cambió primero. Hay en esta persona una capacidad de reinventarse que a veces sorprende a quienes los rodean. 🦎`,
                          "Miquiztli": `La Muerte en el calendario mexica no es un signo oscuro — es el signo de la transformación más profunda. ${nombre1} tiene una comprensión instintiva de que los finales son también comienzos. No le temen a los cambios radicales porque saben, en algún lugar muy dentro, que de la oscuridad siempre surge algo nuevo. 💀`,
                          "Mazatl": `El Venado trae a ${nombre1} una gracia natural y una intuición muy aguda. El venado no lucha de frente — escucha, siente el ambiente, y actúa con elegancia. Hay en esta persona una sensibilidad hacia los demás que a veces parece casi mágica. Sienten lo que otros no dicen. 🦌`,
                          "Tochtli": `El Conejo es el signo de la abundancia y la alegría. ${nombre1} tiene el don de traer celebración y buen ánimo a donde llega — no como actuación, sino como una energía genuina que los demás perciben y agradecen. La vida para ellos tiene sabor. 🐇`,
                          "Atl": `El Agua nunca puede ser detenida — rodea los obstáculos, encuentra siempre su camino. ${nombre1} tiene esa cualidad: una persistencia suave pero implacable. No confrontan de frente; fluyen, adaptan, y al final siempre llegan a donde quieren llegar. 💧`,
                          "Itzcuintli": `El Perro es el guardián y el guía — en la tradición mexica, acompañaba a las almas en su travesía al inframundo. ${nombre1} tiene una lealtad profunda y una capacidad de guiar a otros en sus momentos más oscuros. La gente acude a ellos cuando necesita orientación, y rara vez se van sin haberla encontrado. 🐕`,
                          "Ozomatli": `El Mono es el patrono del arte, el juego y la creatividad. ${nombre1} tiene una mente que no descansa, que siempre está encontrando conexiones inesperadas, soluciones creativas, formas de ver el mundo que a otros no se les ocurrirían. El juego no es evasión para ellos — es su forma de pensar. 🐒`,
                          "Malinalli": `La Hierba es lo que no puede ser destruido. ${nombre1} tiene una resiliencia que a veces ellos mismos no reconocen hasta que la necesitan. Como la hierba que vuelve a crecer después de ser cortada, esta persona tiene la capacidad de renacer de las situaciones más difíciles más fuerte que antes. 🌿`,
                          "Cozcacuauhtli": `El Buitre Real es el signo de los ancianos sabios — los que han visto mucho y por eso callan más. ${nombre1} tiene una madurez interior que no siempre corresponde a su edad. Son observadores, pacientes, y cuando hablan vale la pena escuchar. La sabiduría real no grita. 🦅`,
                          "Tecpatl": `El Pedernal es la verdad que corta sin piedad. ${nombre1} tiene una claridad interior poco común — pueden ver las cosas como son, sin ilusiones, sin adornos. Esa honestidad a veces incomoda a quienes prefieren la comodidad de la mentira. Pero quienes los aprecian de verdad saben que ese filo es un regalo. 🔪`,
                          "Quiahuitl": `La Lluvia trae vida donde antes había sequía. ${nombre1} tiene el don de nutrir — ideas, proyectos, relaciones, personas. Como la lluvia que no distingue entre la flor y la piedra, su generosidad no pone condiciones. Y como la lluvia, a veces llegan en el momento exacto en que más se les necesita. 🌧️`,
                        };

                        const comentario = comentariosPorSigno[signo.nombre]
                          || `${nombre1} nació bajo ${signo.nombre} — ${signo.desc} El calendario mexica no asigna signos al azar: cada combinación de número, signo y ciclo habla de una energía única que acompaña a la persona a lo largo de toda su vida.`;

                        const notaDia1 = esDia1 && !mismoSigno
                          ? ` Y hay algo más: naciste exactamente en el día 1 de tu trecena — el punto de inicio del ciclo. Eso le da a tu signo una energía sin mezcla, directa y poderosa.`
                          : "";

                        return (
                          <div style={{
                            background: "linear-gradient(135deg, #1a1a2e, #0f0f1e)",
                            borderRadius: 12, padding: 16, marginBottom: 12,
                            border: "1px solid #6C63FF33",
                            borderLeft: "3px solid #6C63FF"
                          }}>
                            <div style={{ fontSize: 10, color: "#6C63FF", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
                              🌀 LO QUE DICE TU CALENDARIO
                            </div>
                            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8 }}>
                              {comentario}{notaDia1}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Frase en náhuatl */}
                      <div style={{
                        background: "linear-gradient(135deg, #1a2a1a, #0f0f1e)",
                        borderRadius: 10, padding: 16, marginTop: 4,
                        border: "1px solid #2a4a2a", textAlign: "center"
                      }}>
                        <div style={{ fontSize: 13, color: "#6BCB77", fontStyle: "italic", lineHeight: 1.8, marginBottom: 8 }}>
                          "Amo xichoka kana, se tonati niualas nimitsitaki,<br />
                          ipan se yejyektsi uitsitsili nimokuaptos."
                        </div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, marginBottom: 10 }}>
                          "No llores por mí, un día vendré a verte,<br />convertido en un bonito colibrí." 🪶
                        </div>
                        <div style={{ fontSize: 10, color: "#00C9A7", letterSpacing: 1, cursor: "pointer", fontWeight: 700 }} onClick={() => setShowAuthor(true)}>  -=ArtMoreno=-</div>
                      </div>

                      <button onClick={() => setTonaliVisible(false)}
                        style={{ background: "none", border: "none", color: "#444", fontSize: 11, cursor: "pointer", marginTop: 10 }}>
                        × Cerrar
                      </button>
                    </div>
                  );
                })()}
              </div>
              {/* ─────────────────────────────────────────────────────── */}

              {/* Zodíaco */}
              {zodiacData && (
                <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#C77DFF", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                    {zodiacData.emoji} SIGNO ZODIACAL · {signoNombre.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, marginBottom: 12 }}>{zodiacData.descripcion}</div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: "#0f0f1e", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: "#6BCB77", fontWeight: 700, marginBottom: 6 }}>💚 COMPATIBLE CON</div>
                      {zodiacData.compatible.map(s => (
                        <div key={s} style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>• {s}</div>
                      ))}
                    </div>
                    <div style={{ flex: 1, background: "#0f0f1e", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: "#FF6B6B", fontWeight: 700, marginBottom: 6 }}>🚫 MEJOR EVITAR</div>
                      {zodiacData.evitar.map(s => (
                        <div key={s} style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>• {s}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#FFD93D", fontWeight: 700, marginBottom: 4 }}>⚡ FORTALEZA</div>
                    <div style={{ fontSize: 12, color: "#aaa" }}>{zodiacData.fortaleza}</div>
                  </div>
                  <div style={{ background: "#0f0f1e", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#FF6B6B", fontWeight: 700, marginBottom: 4 }}>😅 DEBILIDAD</div>
                    <div style={{ fontSize: 12, color: "#aaa" }}>{zodiacData.debilidad}</div>
                  </div>
                  <div style={{ background: "#2a1a3e", borderRadius: 10, padding: 10, borderLeft: "3px solid #C77DFF" }}>
                    <div style={{ fontSize: 10, color: "#C77DFF", fontWeight: 700, marginBottom: 4 }}>💬 CONSEJO</div>
                    <div style={{ fontSize: 12, color: "#ddd", fontStyle: "italic" }}>{zodiacData.consejo}</div>
                  </div>
                </div>
              )}

              {/* ── LECTURA DEL ALMA — REGISTROS AKÁSHICOS ─────────── */}
              <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#00C9A7", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  🌌 LECTURA DEL ALMA — REGISTROS AKÁSHICOS 🌌
                </div>

                {!akashic && !akashicLoading && (
                  <button onClick={() => handleLecturaAlma(persona)} style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #00C9A722, #6C63FF22)",
                    border: "1px solid #00C9A755", borderRadius: 10, padding: "12px",
                    color: "#00C9A7", fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>
                    🌌 Abrir mi Registro Akáshico 🌌
                  </button>
                )}

                {akashicLoading && (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#6666aa", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🌌</div>
                    <div style={{ color: "#00C9A7", fontWeight: 600, marginBottom: 4 }}>Accediendo al Registro...</div>
                    <div style={{ fontSize: 11, color: "#444" }}>Esto puede tomar un momento</div>
                  </div>
                )}

                {akashicError && (
                  <div style={{ color: "#FF6B6B", fontSize: 13, textAlign: "center" }}>
                    {akashicError}
                    <button onClick={() => handleLecturaAlma(persona)}
                      style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "#6C63FF", cursor: "pointer", fontSize: 13 }}>
                      Intentar de nuevo
                    </button>
                  </div>
                )}

                {akashic && (() => {
                  const secciones = [
                    { key: "proposito", icon: "🌟", label: "PROPÓSITO DEL ALMA", color: "#00C9A7" },
                    { key: "dones", icon: "✨", label: "DONES DE VIDAS ANTERIORES", color: "#FFD93D" },
                    { key: "karma", icon: "🔄", label: "PATRONES KÁRMICOS", color: "#FF6B6B" },
                    { key: "arquetipo", icon: "🦅", label: "ARQUETIPO DEL ALMA", color: "#C77DFF" },
                    { key: "mensaje", icon: "🪶", label: "MENSAJE DEL REGISTRO", color: "#6BCB77" },
                  ];
                  return (
                    <div>
                      {secciones.map((s, i) => (
                        akashic[s.key] && (
                          <div key={i} style={{
                            background: "#0f0f1e", borderRadius: 10, padding: 14,
                            marginBottom: 10, borderLeft: `3px solid ${s.color}`
                          }}>
                            <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
                              {s.icon} {s.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8 }}>
                              {s.key === "mensaje"
                                ? <em style={{ color: "#aaa" }}>"{akashic[s.key]}"</em>
                                : akashic[s.key]
                              }
                            </div>
                          </div>
                        )
                      ))}

                      <div
                        onClick={() => setShowAuthor(true)}
                        style={{
                          textAlign: "center", marginTop: 8,
                          fontSize: 10, color: "#00C9A7", letterSpacing: 1,
                          cursor: "pointer", fontWeight: 700
                        }}>  -=ArtMoreno=-</div>

                      <button onClick={() => setAkashic(null)}
                        style={{ background: "none", border: "none", color: "#444", fontSize: 11, cursor: "pointer", marginTop: 8 }}>
                        × Cerrar
                      </button>
                    </div>
                  );
                })()}
              </div>
              {/* ─────────────────────────────────────────────────────── */}

              {persona.gustos && (
                <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#FFB347", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🎁 GUSTOS / IDEAS DE REGALO</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>{persona.gustos}</div>
                </div>
              )}

              {persona.notas && (
                <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📝 NOTAS</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>{persona.notas}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="no-print">
                <button onClick={() => handleEdit(persona)}
                  style={{ flex: 1, background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 12, padding: 12, color: "#6C63FF", fontWeight: 700, cursor: "pointer" }}>
                  ✏️ Editar
                </button>
                <button onClick={() => { if (window.confirm("¿Eliminar a " + persona.nombre + "?")) handleDelete(persona.id); }}
                  style={{ flex: 1, background: "#1a1a2e", border: "1px solid #3a1a1a", borderRadius: 12, padding: 12, color: "#FF6B6B", fontWeight: 700, cursor: "pointer" }}>
                  🗑️ Eliminar
                </button>
              </div>

              {/* Botón Imprimir */}
              <button
                className="no-print"
                onClick={() => window.print()}
                style={{
                  width: "100%", marginTop: 10,
                  background: "linear-gradient(135deg, #1a2a1a, #0f1f0f)",
                  border: "1px solid #6BCB7755", borderRadius: 12, padding: 14,
                  color: "#6BCB77", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}>
                🖨️ Imprimir / Guardar como PDF
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL AUTOR ───────────────────────────────────────── */}
      {showAuthor && (
        <div onClick={() => setShowAuthor(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "linear-gradient(135deg, #1a1a2e, #0f0f1e)",
            borderRadius: 20, padding: 28, width: "100%", maxWidth: 340,
            border: "1px solid #00C9A733", textAlign: "center"
          }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg, #00C9A7, #6C63FF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32
            }}>🦅</div>

            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              -=ArtMoreno=-
            </div>
            <div style={{ fontSize: 12, color: "#6666aa", marginBottom: 20 }}>
              Creador de La Bóveda de Cronos
            </div>

            {/* Frase */}
            <div style={{
              background: "#0f0f1e", borderRadius: 12, padding: 14, marginBottom: 20,
              border: "1px solid #00C9A722"
            }}>
              <div style={{ fontSize: 11, color: "#00C9A7", fontStyle: "italic", lineHeight: 1.7 }}>
                "Despertar no es como lo esperabas..."
              </div>
            </div>

            {/* Botón correo */}
            <a href="mailto:despertarnoescomoloesperabas@gmail.com" style={{
              display: "block", textDecoration: "none",
              background: "linear-gradient(135deg, #00C9A7, #6C63FF)",
              borderRadius: 12, padding: "14px",
              color: "#fff", fontSize: 13, fontWeight: 700,
              marginBottom: 12
            }}>
              ✉️ despertarnoescomoloesperabas@gmail.com
            </a>

            <button onClick={() => setShowAuthor(false)} style={{
              background: "none", border: "none", color: "#444",
              fontSize: 12, cursor: "pointer", marginTop: 4
            }}>
              × Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}