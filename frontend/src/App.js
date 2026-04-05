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
  // Si ya pasó el cumple este año, el próximo cumple es currentAge + 1
  // Si no ha pasado, el próximo cumple es currentAge (aún no ha llegado)
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
    if (!form.nombre.trim() || !form.fecha) {
      alert("Faltan datos: nombre=" + form.nombre + " fecha=" + form.fecha);
      return;
    }
    try {
      alert("Pasó validación, guardando...");
      if (editId !== null) {
        const updated = await fetch(`${API}/personas/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form)
        }).then(r => r.json())
          .then(data => ({ ...data, fecha: data.fecha.split("T")[0] }));
        setPersonas(personas.map(p => p.id === editId ? updated : p));
        setEditId(null);
      } else {
        const nuevo = await fetch(`${API}/personas`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form, color: COLORS[personas.length % COLORS.length] })
        }).then(r => r.json())
          .then(data => ({ ...data, fecha: data.fecha.split("T")[0] }));
        setPersonas([...personas, nuevo]);
      }
      setForm({ nombre: "", apodo: "", fecha: "", gustos: "", notas: "", foto: "", fotoPos: "50% 50%" });
      setView("lista");
    } catch(err) {
      alert("Error: " + err.message);
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
    // Si ya tiene cápsula guardada, usarla directo
    if (persona.capsula) {
      setCapsula(JSON.parse(persona.capsula));
      setCapsulaLoading(false);
      return;
    }
    // Si no, generarla con IA
    const data = await fetchCapsula(persona.nombre, persona.fecha);
    // Guardarla en la base de datos
    await fetch(`${API}/personas/${persona.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...persona, capsula: JSON.stringify(data) })
    });
    // Actualizarla en el estado local
    setPersonas(personas.map(p => p.id === persona.id ? { ...p, capsula: JSON.stringify(data) } : p));
    setCapsula(data);
  } catch (e) {
    setCapsulaError("No se pudo obtener la cápsula. Intenta de nuevo.");
  }
  setCapsulaLoading(false);
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

      {/* Header */}
      <div style={{
        padding: "24px 20px 12px", background: "linear-gradient(135deg, #1a1a3e 0%, #0f0f1e 100%)",
        borderBottom: "1px solid #2a2a4e"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              🏛️ La Bóveda de Cronos
            </div>
            <div style={{ fontSize: 12, color: "#6666aa", marginTop: 2 }}>
   by -=Arturo Moreno=- · 👤 {usuario} · {personas.length} {personas.length === 1 ? "persona" : "personas"} guardadas
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
              <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); setCapsula(null); }}
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
            <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); setCapsula(null); }}
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
            { label: "Fecha de nacimiento *", key: "fecha", type: "date", placeholder: "" },
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
                reader.onload = ev => setForm(f => ({ ...f, foto: ev.target.result }));
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
                <div style={{ fontSize: 11, color: "#FFD93D", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🌍 CÁPSULA DEL DÍA QUE NACIÓ</div>
                {!capsula && !capsulaLoading && (
                  <button
                    onClick={() => handleDescubrirDia(persona)}
                    style={{
                      width: "100%", background: "linear-gradient(135deg, #FFD93D22, #FF6B6B22)",
                      border: "1px solid #FFD93D55", borderRadius: 10, padding: "12px",
                      color: "#FFD93D", fontSize: 14, fontWeight: 700, cursor: "pointer"
                    }}>
                    ✨ Descubrir mi día
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
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 5 ? "1px solid #2a2a3e" : "none" }}>
                        <div style={{ fontSize: 11, color: item.color, fontWeight: 700, marginBottom: 4 }}>{item.icon} {item.label.toUpperCase()}</div>
                        <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{item.value}</div>
                      </div>
                    ))}
                    <button onClick={() => setCapsula(null)}
                      style={{ background: "none", border: "none", color: "#444", fontSize: 11, cursor: "pointer", marginTop: 4 }}>
                      × Cerrar
                    </button>
                  </div>
                )}
              </div>


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

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => handleEdit(persona)}
                  style={{ flex: 1, background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 12, padding: 12, color: "#6C63FF", fontWeight: 700, cursor: "pointer" }}>
                  ✏️ Editar
                </button>
                <button onClick={() => { if (window.confirm("¿Eliminar a " + persona.nombre + "?")) handleDelete(persona.id); }}
                  style={{ flex: 1, background: "#1a1a2e", border: "1px solid #3a1a1a", borderRadius: 12, padding: 12, color: "#FF6B6B", fontWeight: 700, cursor: "pointer" }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}