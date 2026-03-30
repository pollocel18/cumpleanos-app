import { useState, useEffect } from "react";

// eslint-disable-next-line
const API = process.env.REACT_APP_API;

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
  // format: YYYY-MM-DD
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
  const age = getAge(dateStr);
  if (age === null) return null;
  const today = new Date();
  const parts = dateStr.split("-").map(Number);
  const month = parts[1];
  const day = parts[2];
  const hasBirthdayPassed = today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return hasBirthdayPassed ? age + 1 : age;
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
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' });
  const [personas, setPersonas] = useState([]);
  const [view, setView] = useState("lista"); // lista | form | detalle
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nombre: "", apodo: "", fecha: "", gustos: "", notas: "", foto: "", fotoPos: "50% 50%" });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  // eslint-disable-next-line
const [tick, setTick] = useState(0);;

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
    .then(data => setPersonas(data))
    .catch(err => console.error(err));
}, [loggedIn]);

const save = (data) => {
  setPersonas(data);
};

  const sorted = [...personas]
    .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .map(p => ({ ...p, days: getDaysUntilBirthday(p.fecha) }))
    .sort((a, b) => a.days - b.days);

  const upcoming = sorted.filter(p => p.days <= 30);

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.fecha) return;
    if (editId !== null) {
      const updated = personas.map(p => p.id === editId ? { ...p, ...form } : p);
      save(updated);
      setEditId(null);
    } else {
      const nuevo = { ...form, id: Date.now(), color: COLORS[personas.length % COLORS.length] };
      save([...personas, nuevo]);
    }
    setForm({ nombre: "", apodo: "", fecha: "", gustos: "", notas: "", foto: "", fotoPos: "50% 50%" });
    setView("lista");
  };

  const handleDelete = (id) => {
    save(personas.filter(p => p.id !== id));
    setView("lista");
    setSelected(null);
  };

  const handleEdit = (p) => {
    setForm({ nombre: p.nombre, apodo: p.apodo || "", fecha: p.fecha, gustos: p.gustos || "", notas: p.notas || "", foto: p.foto || "", fotoPos: p.fotoPos || "50% 50%" });
    setEditId(p.id);
    setView("form");
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
        <div style={{ fontSize: 40 }}>🎂</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 8 }}>
          Cumpleaños
        </div>
        <div style={{ fontSize: 12, color: "#6666aa", marginTop: 4 }}>Inicia sesión para continuar</div>
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
        const r = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginForm)
        });
        const data = await r.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setLoggedIn(true);
        } else {
          alert("Usuario o contraseña incorrectos");
        }
      }} style={{
        width: "100%", background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
        border: "none", borderRadius: 12, padding: 14,
        color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer"
      }}>
        Entrar 🔐
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
              🎂 Cumpleaños
            </div>
            <div style={{ fontSize: 12, color: "#6666aa", marginTop: 2 }}>
              {personas.length} {personas.length === 1 ? "persona" : "personas"} guardadas
            </div>
          </div>
          <button onClick={() => { setForm({ nombre: "", fecha: "", gustos: "", notas: "" }); setEditId(null); setView("form"); }}
            style={{
              background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
              border: "none", borderRadius: 14, width: 44, height: 44,
              color: "#fff", fontSize: 22, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>+</button>
        </div>

        {/* Próximos */}
        {upcoming.length > 0 && view === "lista" && (
          <div style={{ marginTop: 16, background: "#1a1a3e", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              PRÓXIMOS 30 DÍAS
            </div>
            {upcoming.slice(0,3).map(p => (
              <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); }}
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
            <div key={p.id} onClick={() => { setSelected(p.id); setView("detalle"); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#1a1a2e", borderRadius: 14, padding: "14px",
                marginBottom: 10, cursor: "pointer", border: "1px solid #2a2a3e",
                transition: "border-color 0.2s"
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

          {/* Foto */}
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
            {editId ? "Guardar cambios" : "Agregar persona"} ✓
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

        const handleDrag = (e) => {
          if (!persona.foto) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const x = Math.round(((clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((clientY - rect.top) / rect.height) * 100);
          const clamped = `${Math.min(100,Math.max(0,x))}% ${Math.min(100,Math.max(0,y))}%`;
          const updated = personas.map(p => p.id === persona.id ? { ...p, fotoPos: clamped } : p);
          save(updated);
        };

        return (
          <div>
            {/* Hero con foto de fondo arrastrable */}            <div
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

              {/* Botón volver */}
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

              {/* Card centrada con nombre */}
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
                  <div style={{ fontSize: 11, color: "#444", marginTop: 10, textAlign: "center" }}>
                    ...y contando 💓
                  </div>
                </div>
              );
            })()}

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
