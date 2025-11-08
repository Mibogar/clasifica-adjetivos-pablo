import { useEffect, useState } from "react";

/** ================== Tipos ================== */
type Screen = "home" | "mode" | "identify" | "classify";
type Mode = "escribir" | "botones";

type Truth = {
  terminaciones: "Una" | "Dos";
  grado:
    | "Positivo"
    | "Comparativo > Superioridad"
    | "Comparativo > Igualdad"
    | "Comparativo > Inferioridad"
    | "Superlativo > Absoluto"
    | "Superlativo > Relativo";
  posicion: "Explicativo" | "Especificativo";
  genero: "Masculino" | "Femenino";
  numero: "Singular" | "Plural";
};

type Item = { text: string; adj: string; truth: Truth };
type FieldIntent = "neutral" | "good" | "bad";

/** ================== Utilidades y estilos simples ================== */
const box: React.CSSProperties = {
  maxWidth: 900,
  width: "100%",
  margin: "32px auto",
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const heading: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  margin: "8px 0 16px 0",
  textAlign: "center",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  color: "#334155",
  fontSize: 14,
};

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function ChoiceBtn({
  label,
  selected,
  onClick,
  intent = "neutral",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  intent?: FieldIntent;
}) {
  const base: React.CSSProperties = {
    minWidth: 120,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    background: "#fff",
  };
  let style: React.CSSProperties = { ...base, borderColor: "#cbd5e1", color: "#0f172a" };
  if (intent === "good") style = { ...style, background: "#dcfce7", borderColor: "#86efac", color: "#166534" };
  if (intent === "bad") style = { ...style, background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" };
  if (selected && intent === "neutral") style = { ...style, boxShadow: "0 0 0 2px #cbd5e1 inset" };
  return (
    <button style={style} onClick={onClick}>
      {label}
    </button>
  );
}

/** ================== DATOS ==================
 *  ➜ PEGA AQUÍ TU ARRAY COMPLETO DE 100 FRASES:
 *     const DATA: Item[] = [ { text, adj, truth }, ... ];
 */
const DATA: Item[] = [
  {
    text: "El perro fiel esperó a su dueño toda la tarde.",
    adj: "fiel",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Las montañas altas se veían cubiertas de nieve.",
    adj: "altas",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
    },
  },
  {
    text: "Mi hermano es más fuerte que yo.",
    adj: "fuerte",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El día soleado animó a todos a salir.",
    adj: "soleado",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El trabajo de Marta fue excelente.",
    adj: "excelente",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La película es menos interesante que el libro.",
    adj: "interesante",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Inferioridad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El río está más limpio que el año pasado.",
    adj: "limpio",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La casa vieja fue derribada por completo.",
    adj: "vieja",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El chico tan amable nos ayudó con las bolsas.",
    adj: "amable",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Igualdad",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La sopa está riquísima esta noche.",
    adj: "riquísima",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El más alto de la clase ganó la carrera.",
    adj: "alto",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Los estudiantes responsables entregaron el trabajo a tiempo.",
    adj: "responsables",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Plural",
    },
  },
  {
    text: "La niña pequeña juega con su muñeca nueva.",
    adj: "pequeña",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El examen fue facilísimo para los alumnos preparados.",
    adj: "facilísimo",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El pastel está tan dulce como el de ayer.",
    adj: "dulce",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Igualdad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Las flores más bonitas del jardín son las rosas.",
    adj: "bonitas",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
    },
  },
  {
    text: "El tren rápido salió puntual de la estación.",
    adj: "rápido",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La noche estrellada iluminaba el cielo.",
    adj: "estrellada",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El examen de hoy ha sido más difícil que el anterior.",
    adj: "difícil",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El campo verde se extendía hasta el horizonte.",
    adj: "verde",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La comida estaba más salada que ayer.",
    adj: "salada",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El sol brillante apareció tras las nubes.",
    adj: "brillante",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Mis amigos son menos simpáticos que los tuyos.",
    adj: "simpáticos",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Inferioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Plural",
    },
  },
  {
    text: "El café está más caliente que la leche.",
    adj: "caliente",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El niño obediente recogió sus juguetes.",
    adj: "obediente",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El coche nuevo de mi padre brilla mucho.",
    adj: "nuevo",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La clase fue aburridísima.",
    adj: "aburridísima",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El día fue tan largo como el anterior.",
    adj: "largo",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Igualdad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Los alumnos más aplicados aprobaron con nota.",
    adj: "aplicados",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Plural",
    },
  },
  {
    text: "La niña más lista de la clase resolvió el problema.",
    adj: "lista",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "Los cuadros antiguos decoraban la sala.",
    adj: "antiguos",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Plural",
    },
  },
  {
    text: "El niño pequeño es más travieso que su hermano.",
    adj: "travieso",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La playa está menos limpia que el año pasado.",
    adj: "limpia",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Inferioridad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El agua del mar es clarísima.",
    adj: "clarísima",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "Mi madre cocina mejor que nadie.",
    adj: "mejor",
    truth: {
      terminaciones: "Una",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El más sabio de todos fue el anciano.",
    adj: "sabio",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Las calles estrechas del pueblo son preciosas.",
    adj: "estrechas",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
    },
  },
  {
    text: "El peor jugador del equipo falló el penalti.",
    adj: "peor",
    truth: {
      terminaciones: "Una",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El río ancho tiene un puente nuevo.",
    adj: "ancho",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La nieve es más blanca que la leche.",
    adj: "blanca",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El viento fuerte soplaba del norte.",
    adj: "fuerte",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La habitación está tan limpia como la tuya.",
    adj: "limpia",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Igualdad",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El cielo está nubladísimo hoy.",
    adj: "nubladísimo",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Las flores rojas decoran la mesa.",
    adj: "rojas",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
    },
  },
  {
    text: "Los soldados valientes lucharon hasta el final.",
    adj: "valientes",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Masculino",
      numero: "Plural",
    },
  },
  {
    text: "El café más amargo se sirve sin azúcar.",
    adj: "amargo",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La ciudad grande tiene muchos habitantes.",
    adj: "grande",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Explicativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "Las playas limpias atraen a los turistas.",
    adj: "limpias",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
    },
  },
  {
    text: "El agua está fría hoy.",
    adj: "fría",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El mar está menos agitado que ayer.",
    adj: "agitado",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Inferioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La comida buenísima encantó a todos.",
    adj: "buenísima",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Absoluto",
      posicion: "Explicativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El hombre pobre necesitaba ayuda.",
    adj: "pobre",
    truth: {
      terminaciones: "Una",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El coche rojo es más bonito que el azul.",
    adj: "bonito",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Superioridad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "La casa más grande está al final de la calle.",
    adj: "grande",
    truth: {
      terminaciones: "Una",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Singular",
    },
  },
  {
    text: "El pastel está tan bueno como el de ayer.",
    adj: "bueno",
    truth: {
      terminaciones: "Dos",
      grado: "Comparativo > Igualdad",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "El más hermoso de todos los cuadros estaba en el museo.",
    adj: "hermoso",
    truth: {
      terminaciones: "Dos",
      grado: "Superlativo > Relativo",
      posicion: "Especificativo",
      genero: "Masculino",
      numero: "Singular",
    },
  },
  {
    text: "Las calles nuevas están limpias y ordenadas.",
    adj: "nuevas",
    truth: {
      terminaciones: "Dos",
      grado: "Positivo",
      posicion: "Especificativo",
      genero: "Femenino",
      numero: "Plural",
  },
},
];

/** ================== APP ================== */
export default function App() {
  // flujo
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<Mode | null>(null);

  // índice aleatorio (no repetimos consecutivo)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * DATA.length));
  const frase = DATA[index];

  // identificar
  const [typedAdj, setTypedAdj] = useState("");
  const [identifyOk, setIdentifyOk] = useState<boolean | null>(null);

  // clasificar
  const [picked, setPicked] = useState<Partial<Truth>>({});
  const [checked, setChecked] = useState(false);
  const [fieldResult, setFieldResult] = useState<Record<keyof Truth, FieldIntent>>({
    terminaciones: "neutral",
    grado: "neutral",
    posicion: "neutral",
    genero: "neutral",
    numero: "neutral",
  });

  // reset al cambiar de frase
  useEffect(() => {
    setTypedAdj("");
    setIdentifyOk(null);
    setPicked({});
    setChecked(false);
    setFieldResult({
      terminaciones: "neutral",
      grado: "neutral",
      posicion: "neutral",
      genero: "neutral",
      numero: "neutral",
    });
  }, [index]);

  // Acciones
  const start = () => setScreen("mode");
  const pickMode = (m: Mode) => {
    setMode(m);
    setScreen("identify");
  };

  const norm = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

  const checkIdentify = () => {
    const ok = norm(frase.adj) === norm(typedAdj);
    setIdentifyOk(ok);
    if (ok) setTimeout(() => setScreen("classify"), 350);
  };

  const setPick = <K extends keyof Truth>(k: K, v: Truth[K]) =>
    setPicked((p) => ({ ...p, [k]: v }));

  const comprobarClasificacion = () => {
    const truth = frase.truth;
    const r: Record<keyof Truth, FieldIntent> = {
      terminaciones:
        picked.terminaciones === truth.terminaciones
          ? "good"
          : picked.terminaciones
          ? "bad"
          : "neutral",
      grado: picked.grado === truth.grado ? "good" : picked.grado ? "bad" : "neutral",
      posicion:
        picked.posicion === truth.posicion ? "good" : picked.posicion ? "bad" : "neutral",
      genero: picked.genero === truth.genero ? "good" : picked.genero ? "bad" : "neutral",
      numero: picked.numero === truth.numero ? "good" : picked.numero ? "bad" : "neutral",
    };
    setFieldResult(r);
    setChecked(true);
  };

  const siguiente = () => {
    setIndex((prev) => {
      let next;
      do {
        next = Math.floor(Math.random() * DATA.length);
      } while (next === prev);
      return next;
    });
    setScreen("identify");
  };

  const explain = (k: keyof Truth) => {
    if (!checked) return "";
    if (fieldResult[k] === "good") return "¡Correcto!";
    switch (k) {
      case "terminaciones":
        return "Algunas tienen una sola terminación (amable, verde); otras, dos (rojo/roja).";
      case "grado":
        return "Grado: positivo (sin comparación), comparativo (>, =, <) o superlativo (absoluto/relativo).";
      case "posicion":
        return "Explicativo (antepuesto, no restringe) vs especificativo (pospuesto, restringe).";
      case "genero":
        return "Concuerda con el sustantivo en masculino/femenino.";
      case "numero":
        return "Concuerda con el sustantivo en singular/plural.";
    }
  };

  /** ========== Render ========== */

  if (screen === "home")
    return (
      <main style={{ padding: 16 }}>
        <div style={box}>
          <h1 style={heading}>Clasifica los adjetivos</h1>
          <div style={{ color: "#334155", lineHeight: 1.5, marginBottom: 16 }}>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              <li>1) Identifica el adjetivo de la frase (escríbelo).</li>
              <li>2) Clasifícalo: terminaciones, grado, posición, género y número.</li>
            </ul>
          </div>
          <Row>
            <button
              onClick={start}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "#0f172a",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Empezar
            </button>
          </Row>
        </div>
      </main>
    );

  if (screen === "mode")
    return (
      <main style={{ padding: 16 }}>
        <div style={box}>
          <h2 style={{ ...heading, fontSize: 22 }}>¿Qué modalidad eliges?</h2>
          <Row>
            <button
              onClick={() => pickMode("escribir")}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: mode === "escribir" ? "#0f172a" : "#fff",
                color: mode === "escribir" ? "#fff" : "#0f172a",
                fontWeight: 700,
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Modo escribir
            </button>
            <button
              onClick={() => pickMode("botones")}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: mode === "botones" ? "#0f172a" : "#fff",
                color: mode === "botones" ? "#fff" : "#0f172a",
                fontWeight: 700,
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Modo botones
            </button>
          </Row>
        </div>
      </main>
    );

  if (screen === "identify")
    return (
      <main style={{ padding: 16 }}>
        <div style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={pill}>Frases: {DATA.length}</span>
          </div>

          <h2 style={{ ...heading, fontSize: 22, marginTop: 0 }}>Identifica el adjetivo</h2>
          <p
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
              fontSize: 18,
              color: "#0f172a",
              lineHeight: 1.6,
            }}
          >
            {frase.text}
          </p>

          <div style={{ marginTop: 16 }}>
            <input
              value={typedAdj}
              onChange={(e) => setTypedAdj(e.target.value)}
              placeholder="Escribe el adjetivo…"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                outline: "none",
              }}
            />
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={checkIdentify}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Comprobar
              </button>
            </div>
            {identifyOk === false && (
              <p style={{ color: "#991b1b", marginTop: 8 }}>No es correcto. Vuelve a intentarlo.</p>
            )}
            {identifyOk === true && (
              <p style={{ color: "#166534", marginTop: 8 }}>¡Correcto! Pasamos a clasificar…</p>
            )}
          </div>
        </div>
      </main>
    );

  if (screen === "classify") {
    const truth = frase.truth;

    return (
      <main style={{ padding: 16 }}>
        <div style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={pill}>Adjetivo: {frase.adj}</span>
          </div>

          <p
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
              fontSize: 18,
              color: "#0f172a",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {frase.text}
          </p>

          {/* 1) Terminaciones */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>1) Número de terminaciones</h3>
            <Row>
              {(["Una", "Dos"] as Truth["terminaciones"][]).map((opt) => (
                <ChoiceBtn
                  key={opt}
                  label={opt}
                  selected={picked.terminaciones === opt}
                  onClick={() => setPick("terminaciones", opt)}
                  intent={fieldResult.terminaciones}
                />
              ))}
            </Row>
            {checked && <p style={{ color: "#475569", fontSize: 14 }}>{explain("terminaciones")}</p>}
          </section>

          {/* 2) Grado (3 columnas) */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>2) Grado</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {/* Positivo */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <p style={{ margin: 0, marginBottom: 8, color: "#64748b", fontSize: 14 }}>Positivo</p>
                <Row>
                  <ChoiceBtn
                    label="Positivo"
                    selected={picked.grado === "Positivo"}
                    onClick={() => setPick("grado", "Positivo")}
                    intent={fieldResult.grado}
                  />
                </Row>
              </div>

              {/* Comparativo */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <p style={{ margin: 0, marginBottom: 8, color: "#64748b", fontSize: 14 }}>Comparativo</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(
                    [
                      "Comparativo > Superioridad",
                      "Comparativo > Igualdad",
                      "Comparativo > Inferioridad",
                    ] as Truth["grado"][]
                  ).map((opt) => (
                    <ChoiceBtn
                      key={opt}
                      label={opt.replace("Comparativo > ", "")}
                      selected={picked.grado === opt}
                      onClick={() => setPick("grado", opt)}
                      intent={fieldResult.grado}
                    />
                  ))}
                </div>
              </div>

              {/* Superlativo */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <p style={{ margin: 0, marginBottom: 8, color: "#64748b", fontSize: 14 }}>Superlativo</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(
                    ["Superlativo > Absoluto", "Superlativo > Relativo"] as Truth["grado"][]
                  ).map((opt) => (
                    <ChoiceBtn
                      key={opt}
                      label={opt.replace("Superlativo > ", "")}
                      selected={picked.grado === opt}
                      onClick={() => setPick("grado", opt)}
                      intent={fieldResult.grado}
                    />
                  ))}
                </div>
              </div>
            </div>
            {checked && <p style={{ color: "#475569", fontSize: 14 }}>{explain("grado")}</p>}
          </section>

          {/* 3) Posición */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>3) Posición</h3>
            <Row>
              {(["Explicativo", "Especificativo"] as Truth["posicion"][]).map((opt) => (
                <ChoiceBtn
                  key={opt}
                  label={opt}
                  selected={picked.posicion === opt}
                  onClick={() => setPick("posicion", opt)}
                  intent={fieldResult.posicion}
                />
              ))}
            </Row>
            {checked && <p style={{ color: "#475569", fontSize: 14 }}>{explain("posicion")}</p>}
          </section>

          {/* 4) Género */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>4) Género</h3>
            <Row>
              {(["Masculino", "Femenino"] as Truth["genero"][]).map((opt) => (
                <ChoiceBtn
                  key={opt}
                  label={opt}
                  selected={picked.genero === opt}
                  onClick={() => setPick("genero", opt)}
                  intent={fieldResult.genero}
                />
              ))}
            </Row>
            {checked && <p style={{ color: "#475569", fontSize: 14 }}>{explain("genero")}</p>}
          </section>

          {/* 5) Número */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>5) Número</h3>
            <Row>
              {(["Singular", "Plural"] as Truth["numero"][]).map((opt) => (
                <ChoiceBtn
                  key={opt}
                  label={opt}
                  selected={picked.numero === opt}
                  onClick={() => setPick("numero", opt)}
                  intent={fieldResult.numero}
                />
              ))}
            </Row>
            {checked && <p style={{ color: "#475569", fontSize: 14 }}>{explain("numero")}</p>}
          </section>

          {/* Acciones */}
          <Row>
            <button
              onClick={comprobarClasificacion}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "#0f172a",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Comprobar clasificación
            </button>
            {checked && (
              <button
                onClick={siguiente}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Continuar
              </button>
            )}
          </Row>

          {/* Resumen tras comprobar */}
          {checked && (
            <div
              style={{
                marginTop: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                fontSize: 14,
                color: "#334155",
              }}
            >
              <p>
                Terminaciones:{" "}
                <strong style={{ color: fieldResult.terminaciones === "good" ? "#166534" : "#991b1b" }}>
                  {picked.terminaciones ?? "—"}
                </strong>{" "}
                (correcta: {truth.terminaciones})
              </p>
              <p>
                Grado:{" "}
                <strong style={{ color: fieldResult.grado === "good" ? "#166534" : "#991b1b" }}>
                  {picked.grado ?? "—"}
                </strong>{" "}
                (correcta: {truth.grado})
              </p>
              <p>
                Posición:{" "}
                <strong style={{ color: fieldResult.posicion === "good" ? "#166534" : "#991b1b" }}>
                  {picked.posicion ?? "—"}
                </strong>{" "}
                (correcta: {truth.posicion})
              </p>
              <p>
                Género:{" "}
                <strong style={{ color: fieldResult.genero === "good" ? "#166534" : "#991b1b" }}>
                  {picked.genero ?? "—"}
                </strong>{" "}
                (correcta: {truth.genero})
              </p>
              <p>
                Número:{" "}
                <strong style={{ color: fieldResult.numero === "good" ? "#166534" : "#991b1b" }}>
                  {picked.numero ?? "—"}
                </strong>{" "}
                (correcta: {truth.numero})
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return null;
}

