import { useEffect, useMemo, useState } from "react";
import "./App.css";

/** ============================
 *  v2.5 – Clasifica adjetivos (Pablo)
 *  Novedades:
 *   - Pantalla 1: frase + escribir adjetivo. Si acierta → Pantalla 2.
 *   - Resumen en vivo de las elecciones (se mantiene seleccionado).
 *   - Botones mejorados (colores/estados).
 *  ============================ */

type NumeroTerminaciones = "una" | "dos";
type Grado =
  | "positivo"
  | "comparativo-superioridad"
  | "comparativo-igualdad"
  | "comparativo-inferioridad"
  | "superlativo-absoluto"
  | "superlativo-relativo";
type Posicion = "explicativo" | "especificativo";
type Genero = "masculino" | "femenino";
type Numero = "singular" | "plural";

type Item = {
  id: number;
  frase?: string;
  adjetivo: string;
  numeroTerminaciones: NumeroTerminaciones;
  grado: Grado;
  posicion: Posicion;
  genero: Genero;
  numero: Numero;
};

const ITEMS: Item[] = [
  { id: 1, frase: "Es un día espléndido.", adjetivo: "espléndido", numeroTerminaciones: "dos", grado: "positivo", posicion: "explicativo", genero: "masculino", numero: "singular" },
  { id: 2, frase: "La tarea es difícil.", adjetivo: "difícil", numeroTerminaciones: "una", grado: "positivo", posicion: "especificativo", genero: "femenino", numero: "singular" },
  { id: 3, frase: "Compramos camisas azules.", adjetivo: "azules", numeroTerminaciones: "una", grado: "positivo", posicion: "especificativo", genero: "femenino", numero: "plural" },
  { id: 4, frase: "Es un buen amigo.", adjetivo: "buen", numeroTerminaciones: "dos", grado: "positivo", posicion: "explicativo", genero: "masculino", numero: "singular" },
  { id: 5, frase: "María es más alta que Ana.", adjetivo: "alta", numeroTerminaciones: "dos", grado: "comparativo-superioridad", posicion: "especificativo", genero: "femenino", numero: "singular" },
  { id: 6, frase: "Pablo es tan rápido como Luis.", adjetivo: "rápido", numeroTerminaciones: "dos", grado: "comparativo-igualdad", posicion: "especificativo", genero: "masculino", numero: "singular" },
  { id: 7, frase: "Este ejercicio es menos complejo que el anterior.", adjetivo: "complejo", numeroTerminaciones: "dos", grado: "comparativo-inferioridad", posicion: "especificativo", genero: "masculino", numero: "singular" },
  { id: 8, frase: "Es un trabajo facilísimo.", adjetivo: "facilísimo", numeroTerminaciones: "una", grado: "superlativo-absoluto", posicion: "explicativo", genero: "masculino", numero: "singular" },
  { id: 9, frase: "El alumno más aplicado de la clase ganó el premio.", adjetivo: "aplicado", numeroTerminaciones: "dos", grado: "superlativo-relativo", posicion: "especificativo", genero: "masculino", numero: "singular" },
  { id: 10, frase: "Compramos manzanas rojas.", adjetivo: "rojas", numeroTerminaciones: "dos", grado: "positivo", posicion: "especificativo", genero: "femenino", numero: "plural" },
];

const LABELS = {
  numeroTerminaciones: { una: "1 terminación", dos: "2 terminaciones" },
  grado: {
    "positivo": "Positivo",
    "comparativo-superioridad": "Comparativo (superioridad)",
    "comparativo-igualdad": "Comparativo (igualdad)",
    "comparativo-inferioridad": "Comparativo (inferioridad)",
    "superlativo-absoluto": "Superlativo absoluto",
    "superlativo-relativo": "Superlativo relativo",
  },
  posicion: { explicativo: "Explicativo (delante)", especificativo: "Especificativo (detrás)" },
  genero: { masculino: "Masculino", femenino: "Femenino" },
  numero: { singular: "Singular", plural: "Plural" },
} as const;

type Campo = "numeroTerminaciones" | "grado" | "posicion" | "genero" | "numero";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const pick = <T,>(arr: T[], exceptId?: number) => {
  const pool = exceptId ? (arr as any[]).filter((x) => x.id !== exceptId) : (arr as any[]);
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function App() {
  // Configuración
  const [modo, setModo] = useState<"botones" | "escrita">(
    (localStorage.getItem("modo") as any) || "botones"
  );
  useEffect(() => localStorage.setItem("modo", modo), [modo]);

  // Estado principal
  const [item, setItem] = useState<Item>(() => pick(ITEMS));
  const [ultimoId, setUltimoId] = useState(item.id);
  const [pantalla, setPantalla] = useState<1 | 2>(1); // 1: frase+adjetivo, 2: clasificar

  // Paso 1
  const [entradaAdjetivo, setEntradaAdjetivo] = useState("");
  const [feedback1, setFeedback1] = useState("");

  // Paso 2
  const [respB, setRespB] = useState({
    numeroTerminaciones: "" as NumeroTerminaciones | "",
    grado: "" as Grado | "",
    posicion: "" as Posicion | "",
    genero: "" as Genero | "",
    numero: "" as Numero | "",
  });
  const [respE, setRespE] = useState({
    numeroTerminaciones: "",
    grado: "",
    posicion: "",
    genero: "",
    numero: "",
  });
  const [erroresCampos, setErroresCampos] = useState<Campo[]>([]);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [feedback2, setFeedback2] = useState("");

  const nuevoItem = () => {
    const nxt = pick(ITEMS, ultimoId);
    setItem(nxt);
    setUltimoId(nxt.id);
    setPantalla(1);
    setEntradaAdjetivo("");
    setFeedback1("");
    setRespB({ numeroTerminaciones: "", grado: "", posicion: "", genero: "", numero: "" });
    setRespE({ numeroTerminaciones: "", grado: "", posicion: "", genero: "", numero: "" });
    setErroresCampos([]);
    setMostrarSolucion(false);
    setFeedback2("");
  };

  // -------- Pantalla 1: comprobar adjetivo --------
  const comprobarAdjetivo = () => {
    if (norm(entradaAdjetivo) === norm(item.adjetivo)) {
      setFeedback1("");
      setPantalla(2);
    } else {
      setFeedback1("❌ Ese no es el adjetivo de la frase. Inténtalo otra vez.");
    }
  };

  // -------- Pantalla 2: comprobar clasificación --------
  const comprobarClasificacion = () => {
    const usarBotones = modo === "botones";
    const r = usarBotones ? (respB as any) : (respE as any);

    const correctas = {
      numeroTerminaciones: item.numeroTerminaciones,
      grado: item.grado,
      posicion: item.posicion,
      genero: item.genero,
      numero: item.numero,
    };

    const err: Campo[] = [];
    (Object.keys(correctas) as Campo[]).forEach((k) => {
      const val = r[k];
      const ok = (correctas as any)[k];
      const okStr = String(ok).toLowerCase();
      if (typeof val === "string") {
        if (val.trim().toLowerCase() !== okStr) err.push(k);
      } else if (val !== ok) err.push(k);
    });

    if (err.length === 0) {
      setFeedback2("✅ ¡Perfecto! Todo correcto.");
      setErroresCampos([]);
      setMostrarSolucion(false);
      setTimeout(nuevoItem, 900);
    } else {
      setFeedback2("❌ Hay errores. Revisa los apartados marcados o pulsa «Mostrar solución».");
      setErroresCampos(err);
      setMostrarSolucion(false);
    }
  };

  // Resumen en vivo (usa respB/respE según modo)
  const live = modo === "botones" ? respB : (respE as any);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Clasifica los adjetivos — Pablo</h1>
          <div className="flex flex-wrap items-center gap-2">
            <StepBadge active={pantalla === 1} label="1. Identifica el adjetivo" />
            <StepBadge active={pantalla === 2} label="2. Clasifica" />
            <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />
            <button
              className={`px-3 py-1.5 rounded-md text-sm border ${
                modo === "botones" ? "bg-sky-600 text-white border-sky-700" : "bg-white"
              }`}
              onClick={() => setModo("botones")}
            >
              Modo botones
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm border ${
                modo === "escrita" ? "bg-sky-600 text-white border-sky-700" : "bg-white"
              }`}
              onClick={() => setModo("escrita")}
            >
              Modo escrita
            </button>
            <button
              onClick={nuevoItem}
              className="px-3 py-1.5 rounded-md text-sm border hover:bg-slate-100"
              title="Saltar a otro ejercicio"
            >
              Siguiente
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Columna principal */}
        <section className="bg-white rounded-2xl shadow p-5">
          {pantalla === 1 ? (
            <Pantalla1
              frase={item.frase || ""}
              entrada={entradaAdjetivo}
              setEntrada={setEntradaAdjetivo}
              onComprobar={comprobarAdjetivo}
              feedback={feedback1}
            />
          ) : (
            <Pantalla2
              item={item}
              modo={modo}
              respB={respB}
              setRespB={setRespB}
              respE={respE}
              setRespE={setRespE}
              erroresCampos={erroresCampos}
              mostrarSolucion={mostrarSolucion}
              setMostrarSolucion={setMostrarSolucion}
              onComprobar={comprobarClasificacion}
              feedback={feedback2}
            />
          )}
        </section>

        {/* Columna lateral: Resumen en vivo */}
        <aside className="bg-white rounded-2xl shadow p-5 h-fit sticky top-[84px]">
          <h3 className="text-lg font-semibold mb-2">Resumen de tu respuesta</h3>
          <ResumenLive live={live} mostrarSolucion={mostrarSolucion} item={item} />
          {pantalla === 2 && (
            <p className="mt-3 text-xs text-slate-500">
              Consejo: si dudas en <b>grados</b>, busca pistas como <i>más/menos…que</i>, <i>tan…como</i> o sufijos <i>-ísimo</i>.
            </p>
          )}
        </aside>
      </main>

      <footer className="text-center text-xs text-slate-500 py-6">
        Guardado local en este navegador. Versión 2.5.
      </footer>
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function StepBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs border ${
        active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}

function Pantalla1({
  frase,
  entrada,
  setEntrada,
  onComprobar,
  feedback,
}: {
  frase: string;
  entrada: string;
  setEntrada: (v: string) => void;
  onComprobar: () => void;
  feedback: string;
}) {
  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold mb-3">Paso 1 · Identifica el adjetivo</h2>
      <div className="rounded-xl p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border">
        <p className="text-lg">
          <span className="font-semibold">Frase:</span> {frase}
        </p>
      </div>
      <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-2">
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Escribe aquí el adjetivo que aparece en la frase"
        />
        <button
          onClick={onComprobar}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          Comprobar adjetivo
        </button>
      </div>
      {feedback && (
        <div className="mt-3 rounded-xl border p-3 text-sm bg-rose-50 border-rose-200 text-rose-900">
          {feedback}
        </div>
      )}
    </div>
  );
}

function Pantalla2(props: {
  item: Item;
  modo: "botones" | "escrita";
  respB: any;
  setRespB: any;
  respE: any;
  setRespE: any;
  erroresCampos: Campo[];
  mostrarSolucion: boolean;
  setMostrarSolucion: (v: boolean) => void;
  onComprobar: () => void;
  feedback: string;
}) {
  const {
    item,
    modo,
    respB,
    setRespB,
    respE,
    setRespE,
    erroresCampos,
    mostrarSolucion,
    setMostrarSolucion,
    onComprobar,
    feedback,
  } = props;

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold mb-1">Paso 2 · Clasifica</h2>
      <p className="text-slate-600 mb-3">
        Adjetivo:{" "}
        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
          {item.adjetivo}
        </span>
      </p>

      {modo === "botones" ? (
        <div className="grid md:grid-cols-2 gap-4">
          <GrupoBotones
            icon="🎯"
            color="sky"
            titulo="Número de terminaciones"
            opciones={[
              { key: "una", label: LABELS.numeroTerminaciones.una },
              { key: "dos", label: LABELS.numeroTerminaciones.dos },
            ]}
            valor={respB.numeroTerminaciones}
            onChange={(v) => setRespB((s: any) => ({ ...s, numeroTerminaciones: v }))}
            error={erroresCampos.includes("numeroTerminaciones")}
            solucion={mostrarSolucion ? LABELS.numeroTerminaciones[item.numeroTerminaciones] : undefined}
          />
          <GrupoBotones
            icon="📈"
            color="violet"
            titulo="Grado"
            opciones={[
              { key: "positivo", label: LABELS.grado["positivo"] },
              { key: "comparativo-superioridad", label: LABELS.grado["comparativo-superioridad"] },
              { key: "comparativo-igualdad", label: LABELS.grado["comparativo-igualdad"] },
              { key: "comparativo-inferioridad", label: LABELS.grado["comparativo-inferioridad"] },
              { key: "superlativo-absoluto", label: LABELS.grado["superlativo-absoluto"] },
              { key: "superlativo-relativo", label: LABELS.grado["superlativo-relativo"] },
            ]}
            valor={respB.grado}
            onChange={(v) => setRespB((s: any) => ({ ...s, grado: v }))}
            error={erroresCampos.includes("grado")}
            solucion={mostrarSolucion ? LABELS.grado[item.grado] : undefined}
          />
          <GrupoBotones
            icon="📍"
            color="amber"
            titulo="Posición"
            opciones={[
              { key: "explicativo", label: LABELS.posicion.explicativo },
              { key: "especificativo", label: LABELS.posicion.especificativo },
            ]}
            valor={respB.posicion}
            onChange={(v) => setRespB((s: any) => ({ ...s, posicion: v }))}
            error={erroresCampos.includes("posicion")}
            solucion={mostrarSolucion ? LABELS.posicion[item.posicion] : undefined}
          />
          <GrupoBotones
            icon="👤"
            color="emerald"
            titulo="Género"
            opciones={[
              { key: "masculino", label: LABELS.genero.masculino },
              { key: "femenino", label: LABELS.genero.femenino },
            ]}
            valor={respB.genero}
            onChange={(v) => setRespB((s: any) => ({ ...s, genero: v }))}
            error={erroresCampos.includes("genero")}
            solucion={mostrarSolucion ? LABELS.genero[item.genero] : undefined}
          />
          <GrupoBotones
            icon="🔢"
            color="rose"
            titulo="Número"
            opciones={[
              { key: "singular", label: LABELS.numero.singular },
              { key: "plural", label: LABELS.numero.plural },
            ]}
            valor={respB.numero}
            onChange={(v) => setRespB((s: any) => ({ ...s, numero: v }))}
            error={erroresCampos.includes("numero")}
            solucion={mostrarSolucion ? LABELS.numero[item.numero] : undefined}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <CampoTexto
            label="Número de terminaciones (una / dos)"
            value={respE.numeroTerminaciones}
            onChange={(v) => setRespE((s: any) => ({ ...s, numeroTerminaciones: v }))}
            error={erroresCampos.includes("numeroTerminaciones")}
            solucion={mostrarSolucion ? LABELS.numeroTerminaciones[item.numeroTerminaciones] : undefined}
          />
          <CampoTexto
            label="Grado (positivo / comparativo-superioridad / comparativo-igualdad / comparativo-inferioridad / superlativo-absoluto / superlativo-relativo)"
            value={respE.grado}
            onChange={(v) => setRespE((s: any) => ({ ...s, grado: v }))}
            error={erroresCampos.includes("grado")}
            solucion={mostrarSolucion ? LABELS.grado[item.grado] : undefined}
          />
          <CampoTexto
            label="Posición (explicativo / especificativo)"
            value={respE.posicion}
            onChange={(v) => setRespE((s: any) => ({ ...s, posicion: v }))}
            error={erroresCampos.includes("posicion")}
            solucion={mostrarSolucion ? LABELS.posicion[item.posicion] : undefined}
          />
          <CampoTexto
            label="Género (masculino / femenino)"
            value={respE.genero}
            onChange={(v) => setRespE((s: any) => ({ ...s, genero: v }))}
            error={erroresCampos.includes("genero")}
            solucion={mostrarSolucion ? LABELS.genero[item.genero] : undefined}
          />
          <CampoTexto
            label="Número (singular / plural)"
            value={respE.numero}
            onChange={(v) => setRespE((s: any) => ({ ...s, numero: v }))}
            error={erroresCampos.includes("numero")}
            solucion={mostrarSolucion ? LABELS.numero[item.numero] : undefined}
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={onComprobar}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          Comprobar
        </button>
        <button
          onClick={() => setMostrarSolucion(true)}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Mostrar solución
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-medium"
        >
          Subir arriba
        </button>
      </div>

      {feedback && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            feedback.startsWith("✅")
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}

function GrupoBotones(props: {
  icon?: string;
  color?: "sky" | "violet" | "amber" | "emerald" | "rose";
  titulo: string;
  opciones: { key: string; label: string }[];
  valor: string;
  onChange: (v: string) => void;
  error?: boolean;
  solucion?: string;
}) {
  const { icon, color = "sky", titulo, opciones, valor, onChange, error, solucion } = props;

  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200",
    violet: "bg-violet-50 border-violet-200",
    amber: "bg-amber-50 border-amber-200",
    emerald: "bg-emerald-50 border-emerald-200",
    rose: "bg-rose-50 border-rose-200",
  };

  return (
    <div
      className={`border rounded-2xl p-3 ${error ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        {titulo}
        {solucion && (
          <span className={`text-[11px] px-2 py-0.5 rounded border ${colorMap[color]} text-slate-800`}>
            Solución: {solucion}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((op) => {
          const active = valor === op.key;
          return (
            <button
              key={op.key}
              onClick={() => onChange(op.key)}
              className={`px-3 py-2 rounded-xl border text-sm transition
               ${active
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-sky-700 shadow"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-300"
               }`}
            >
              {op.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CampoTexto(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  solucion?: string;
}) {
  const { label, value, onChange, error, solucion } = props;
  return (
    <label className={`grid gap-1 ${error ? "text-rose-700" : ""}`}>
      <span className="text-sm font-semibold flex items-center gap-2">
        ✍️ {label}
        {solucion && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Solución: {solucion}
          </span>
        )}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-lg px-3 py-2 outline-none focus:ring-2 transition ${
          error ? "border-rose-300 focus:ring-rose-300 bg-rose-50/40" : "focus:ring-sky-400"
        }`}
        placeholder="Escribe aquí…"
      />
    </label>
  );
}

function ResumenLive({
  live,
  mostrarSolucion,
  item,
}: {
  live: any;
  mostrarSolucion: boolean;
  item: Item;
}) {
  const filas: { k: Campo; titulo: string; val: string; sol: string }[] = [
    {
      k: "numeroTerminaciones",
      titulo: "Número de terminaciones",
      val: live.numeroTerminaciones || "—",
      sol: LABELS.numeroTerminaciones[item.numeroTerminaciones],
    },
    {
      k: "grado",
      titulo: "Grado",
      val: live.grado || "—",
      sol: LABELS.grado[item.grado],
    },
    {
      k: "posicion",
      titulo: "Posición",
      val: live.posicion || "—",
      sol: LABELS.posicion[item.posicion],
    },
    {
      k: "genero",
      titulo: "Género",
      val: live.genero || "—",
      sol: LABELS.genero[item.genero],
    },
    {
      k: "numero",
      titulo: "Número",
      val: live.numero || "—",
      sol: LABELS.numero[item.numero],
    },
  ];

  return (
    <div className="grid gap-2">
      {filas.map((f) => (
        <div
          key={f.k}
          className="flex items-start justify-between gap-3 border rounded-lg px-3 py-2 bg-slate-50"
        >
          <div className="text-sm">
            <p className="font-semibold">{f.titulo}</p>
            <p className="text-slate-700">
              Elegido:{" "}
              <span className="font-medium">
                {pretty(f.k, f.val as string)}
              </span>
            </p>
          </div>
          {mostrarSolucion && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Correcto: {f.sol}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function pretty(k: Campo, v: string) {
  if (!v || v === "—") return "—";
  switch (k) {
    case "numeroTerminaciones":
      return (LABELS.numeroTerminaciones as any)[v] || v;
    case "grado":
      return (LABELS.grado as any)[v] || v;
    case "posicion":
      return (LABELS.posicion as any)[v] || v;
    case "genero":
      return (LABELS.genero as any)[v] || v;
    case "numero":
      return (LABELS.numero as any)[v] || v;
  }
  return v;
}

/* Pequeña animación con Tailwind (utiliza clases utilitarias) */
/* En tu App.css puedes añadir:
   .animate-fade { animation: fade .25s ease-in-out; }
   @keyframes fade { from {opacity:.0; transform: translateY(6px)} to {opacity:1; transform: translateY(0)} }
*/
