import { useEffect, useMemo, useState } from "react";

/* =========================
   1) CRITERIOS (tu definición)
   ========================= */
type CriterionId = "terminaciones" | "grado" | "posicion" | "genero" | "numero";

type Criterion = {
  id: CriterionId;
  title: string;
  // las opciones se comparan por igualdad exacta (minúsculas)
  options: string[];
  // texto de ayuda para explicar fallos
  help: (adjective: string, sentence: string, correct: string) => string;
};

const CRITERIA: Criterion[] = [
  {
    id: "terminaciones",
    title: "Número de terminaciones",
    options: ["una", "dos"],
    help: (adj, s, correct) =>
      `Para "${adj}", la respuesta correcta es "${correct}": 
- "dos" cuando admite forma en "-o" y "-a" (p. ej., bueno/buena, aplicado/aplicada).
- "una" cuando mantiene la misma terminación para masculino y femenino (p. ej., fácil, interesante).
Fíjate en la forma del adjetivo dentro de la frase: «${s}».`,
  },
  {
    id: "grado",
    title: "Grado",
    options: [
      "positivo",
      "comparativo - superioridad",
      "comparativo - igualdad",
      "comparativo - inferioridad",
      "superlativo - absoluto",
      "superlativo - relativo",
    ],
    help: (adj, s, correct) =>
      `El grado correcto es "${correct}". Recuerda:
- "positivo": cualidad sin comparación (p. ej., "rojo", "alto").
- "comparativo - superioridad": con "más ... que".
- "comparativo - igualdad": con "tan ... como".
- "comparativo - inferioridad": con "menos ... que".
- "superlativo - absoluto": intensifica sin comparar ("-ísimo", "muy ...").
- "superlativo - relativo": "el/la más ..." dentro de un grupo.
Frase: «${s}».`,
  },
  {
    id: "posicion",
    title: "Posición",
    options: ["explicativos", "especificativos"],
    help: (adj, s, correct) =>
      `Aquí es "${correct}":
- "explicativos" (suelen ir antepuestos): añaden una cualidad no delimitadora (p. ej., "la inmensa ciudad").
- "especificativos" (suelen ir pospuestos): delimitan o distinguen ("el coche rojo" = ¿cuál? el rojo).
Observa la función del adjetivo en «${s}».`,
  },
  {
    id: "genero",
    title: "Género",
    options: ["masculino", "femenino"],
    help: (adj, s, correct) =>
      `En la frase «${s}», el adjetivo "${adj}" concuerda con el sustantivo en género: "${correct}".`,
  },
  {
    id: "numero",
    title: "Número",
    options: ["singular", "plural"],
    help: (adj, s, correct) =>
      `En «${s}», el adjetivo "${adj}" concuerda en número con el sustantivo: "${correct}".`,
  },
];

/* =========================
   2) BANCO DE FRASES (ejemplo)
   - Puedes editar/añadir las que quieras
   - "answers" debe cubrir los 5 criterios anteriores
   ========================= */
type Item = {
  sentence: string;
  adjective: string; // lo que debe identificar
  answers: Record<CriterionId, string>;
};

const ITEMS: Item[] = [
  {
    sentence: "El coche rojo avanzó lentamente.",
    adjective: "rojo",
    answers: {
      terminaciones: "dos",                      // rojo/roja
      grado: "positivo",
      posicion: "especificativos",
      genero: "masculino",
      numero: "singular",
    },
  },
  {
    sentence: "La inmensa ciudad estaba iluminada.",
    adjective: "inmensa",
    answers: {
      terminaciones: "dos",                      // inmenso/inmensa
      grado: "positivo",
      posicion: "explicativos",
      genero: "femenino",
      numero: "singular",
    },
  },
  {
    sentence: "Este ejercicio es más fácil que el anterior.",
    adjective: "fácil",
    answers: {
      terminaciones: "una",                      // fácil/fácil
      grado: "comparativo - superioridad",
      posicion: "especificativos",
      genero: "masculino",
      numero: "singular",
    },
  },
  {
    sentence: "Sus resultados son tan buenos como los tuyos.",
    adjective: "buenos",
    answers: {
      terminaciones: "dos",                      // bueno/buena
      grado: "comparativo - igualdad",
      posicion: "especificativos",
      genero: "masculino",
      numero: "plural",
    },
  },
  {
    sentence: "Es menos interesante que el anterior.",
    adjective: "interesante",
    answers: {
      terminaciones: "una",
      grado: "comparativo - inferioridad",
      posicion: "especificativos",
      genero: "masculino",
      numero: "singular",
    },
  },
  {
    sentence: "Es el alumno más aplicado de la clase.",
    adjective: "aplicado",
    answers: {
      terminaciones: "dos",
      grado: "superlativo - relativo",
      posicion: "especificativos",
      genero: "masculino",
      numero: "singular",
    },
  },
  {
    sentence: "Está felicísimo con el resultado.",
    adjective: "felicísimo",
    answers: {
      terminaciones: "dos",
      grado: "superlativo - absoluto",
      posicion: "especificativos",
      genero: "masculino",
      numero: "singular",
    },
  },
];

/* =========================
   3) UTILIDADES
   ========================= */
const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

/* =========================
   4) UI BÁSICA (estética)
   ========================= */
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50 grid place-items-center p-6">{children}</div>;
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
function Primary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "px-5 py-3 rounded-xl font-semibold bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800",
        "shadow-sm hover:shadow transition", className,
      ].join(" ")}
    />
  );
}
function Secondary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "px-5 py-3 rounded-xl font-semibold bg-white text-slate-800 border border-slate-300 hover:border-slate-400",
        "shadow-sm hover:shadow transition", className,
      ].join(" ")}
    />
  );
}
function Info({
  children,
  ok = false,
}: {
  children: React.ReactNode;
  ok?: boolean;
}) {
  return (
    <div
      className={[
        "px-4 py-2 rounded-lg text-sm text-center max-w-xl mx-auto border",
        ok ? "text-green-700 bg-green-50 border-green-200" : "text-rose-700 bg-rose-50 border-rose-200",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================
   5) APP — FLUJO DE PANTALLAS
   ========================= */
type Mode = "escribir" | "botones";
type Screen = "intro" | "pickMode" | "identify" | "classify";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [mode, setMode] = useState<Mode | null>(null);
  const [idx, setIdx] = useState(0);

  const item = useMemo(() => ITEMS[idx], [idx]);

  // IDENTIFICAR
  const [inputAdj, setInputAdj] = useState("");
  const [identifyFeedback, setIdentifyFeedback] = useState<"ok" | "ko" | null>(null);

  // CLASIFICAR - estado común
  // Para cada criterio guardamos lo seleccionado/escrito y si ya está validado.
  type CriterionState = {
    value: string;
    status: "idle" | "ok" | "ko";
    explanation?: string;
  };
  const [answers, setAnswers] = useState<Record<CriterionId, CriterionState>>({
    terminaciones: { value: "", status: "idle" },
    grado: { value: "", status: "idle" },
    posicion: { value: "", status: "idle" },
    genero: { value: "", status: "idle" },
    numero: { value: "", status: "idle" },
  });

  // resetear estados al cambiar de pantalla/ítem/modo
  useEffect(() => {
    setInputAdj("");
    setIdentifyFeedback(null);
    setAnswers({
      terminaciones: { value: "", status: "idle" },
      grado: { value: "", status: "idle" },
      posicion: { value: "", status: "idle" },
      genero: { value: "", status: "idle" },
      numero: { value: "", status: "idle" },
    });
  }, [screen, idx, mode]);

  // Portada
  if (screen === "intro") {
    return (
      <Shell>
        <Card className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Clasifica los adjetivos</h1>
          <div className="text-lg leading-relaxed text-slate-700">
            <p className="mb-2">1) Identifica el adjetivo en la frase.</p>
            <p>2) Clasifícalo en los 5 criterios del examen.</p>
          </div>
          <Primary onClick={() => setScreen("pickMode")}>Empezar</Primary>
        </Card>
      </Shell>
    );
  }

  // Elegir modo
  if (screen === "pickMode") {
    return (
      <Shell>
        <Card className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">¿Qué modalidad eliges?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-left hover:shadow transition"
              onClick={() => { setMode("escribir"); setScreen("identify"); }}
            >
              <div className="font-semibold">Modo escribir</div>
              <div className="text-sm text-slate-500 mt-1">
                Escribe las respuestas de cada criterio.
              </div>
            </button>
            <button
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-left hover:shadow transition"
              onClick={() => { setMode("botones"); setScreen("identify"); }}
            >
              <div className="font-semibold">Modo botones</div>
              <div className="text-sm text-slate-500 mt-1">
                Elige pulsando botones (verde/rojo al comprobar).
              </div>
            </button>
          </div>
          <Secondary onClick={() => setScreen("intro")}>Volver</Secondary>
        </Card>
      </Shell>
    );
  }

  // Identificar adjetivo
  if (screen === "identify" && mode) {
    return (
      <Shell>
        <Card className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Identifica el adjetivo</h2>
          <div className="text-center text-3xl font-semibold text-slate-900">
            “{item.sentence}”
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <label className="block text-slate-700 font-medium">Escribe el adjetivo:</label>
            <input
              value={inputAdj}
              onChange={(e) => setInputAdj(e.target.value)}
              placeholder="Escribe aquí el adjetivo…"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="flex gap-3 justify-center">
              <Primary
                onClick={() => {
                  const ok = norm(inputAdj) === norm(item.adjective);
                  setIdentifyFeedback(ok ? "ok" : "ko");
                  if (ok) setTimeout(() => setScreen("classify"), 450);
                }}
              >
                Comprobar
              </Primary>
              <Secondary onClick={() => setScreen("pickMode")}>Cambiar modalidad</Secondary>
            </div>

            {identifyFeedback === "ok" && <Info ok>¡Correcto! Ahora clasifícalo.</Info>}
            {identifyFeedback === "ko" && <Info> No es correcto. Inténtalo de nuevo. </Info>}
          </div>
        </Card>
      </Shell>
    );
  }

  // Clasificar (dos modos)
  if (screen === "classify" && mode) {
    const corrects = item.answers;

    // helpers para validar y explicar
    const setOne = (id: CriterionId, proposed: string) => {
      const criterion = CRITERIA.find((c) => c.id === id)!;
      const correct = corrects[id];
      const ok = norm(proposed) === norm(correct);
      setAnswers((prev) => ({
        ...prev,
        [id]: {
          value: proposed,
          status: ok ? "ok" : "ko",
          explanation: ok ? undefined : criterion.help(item.adjective, item.sentence, correct),
        },
      }));
    };

    const allOk = ((): boolean =>
      (Object.keys(corrects) as CriterionId[]).every((k) => answers[k].status === "ok"))();

    return (
      <Shell>
        <Card className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Clasifica el adjetivo</h2>

          <div className="text-center text-lg text-slate-700">
            Frase: <span className="font-semibold">“{item.sentence}”</span>
          </div>
          <div className="text-center">
            <span className="text-slate-600">Adjetivo:</span>{" "}
            <span className="text-2xl font-extrabold">{item.adjective}</span>
          </div>

          {mode === "botones" && (
            <div className="space-y-6">
              {CRITERIA.map((c) => {
                const st = answers[c.id];
                return (
                  <div key={c.id} className="border-t border-slate-200 pt-4">
                    <div className="font-semibold mb-2">{c.title}</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {c.options.map((opt) => {
                        const chosen = st.value === opt;
                        const isCorrect = chosen && st.status === "ok";
                        const isWrong = chosen && st.status === "ko";
                        return (
                          <button
                            key={opt}
                            onClick={() => setOne(c.id, opt)}
                            className={[
                              "px-4 py-3 rounded-xl border text-left transition bg-white",
                              "shadow-sm hover:shadow",
                              chosen ? "ring-2 ring-sky-400 border-sky-300" : "border-slate-200",
                              isCorrect ? "bg-green-100 border-green-300 ring-green-400" : "",
                              isWrong ? "bg-rose-100 border-rose-300 ring-rose-400" : "",
                            ].join(" ")}
                          >
                            <span className="capitalize">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {st.status === "ko" && st.explanation && (
                      <div className="mt-2">
                        <Info>{st.explanation}</Info>
                      </div>
                    )}
                    {st.status === "ok" && (
                      <div className="mt-2">
                        <Info ok>✔ Correcto en “{c.title}”.</Info>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {mode === "escribir" && (
            <div className="space-y-6">
              {CRITERIA.map((c) => {
                const st = answers[c.id];
                return (
                  <div key={c.id} className="border-t border-slate-200 pt-4">
                    <div className="font-semibold mb-2">{c.title}</div>
                    <div className="flex gap-2 items-center max-w-xl">
                      <input
                        value={st.value}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [c.id]: { ...prev[c.id], value: e.target.value, status: "idle", explanation: undefined },
                          }))
                        }
                        placeholder={`Escribe aquí (${c.options.join(" / ")})`}
                        className={[
                          "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2",
                          st.status === "ok"
                            ? "border-green-300 focus:ring-green-300 bg-green-50"
                            : st.status === "ko"
                            ? "border-rose-300 focus:ring-rose-300 bg-rose-50"
                            : "border-slate-300 focus:ring-sky-300",
                        ].join(" ")}
                      />
                      <Primary onClick={() => setOne(c.id, st.value)}>Comprobar</Primary>
                    </div>

                    {st.status === "ko" && st.explanation && (
                      <div className="mt-2">
                        <Info>{st.explanation}</Info>
                      </div>
                    )}
                    {st.status === "ok" && (
                      <div className="mt-2">
                        <Info ok>✔ Correcto en “{c.title}”.</Info>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Secondary onClick={() => setScreen("pickMode")}>Cambiar modalidad</Secondary>
            <Primary
              className={allOk ? "" : "opacity-50 cursor-not-allowed"}
              disabled={!allOk}
              onClick={() => {
                const next = (idx + 1) % ITEMS.length;
                setIdx(next);
                setScreen("identify");
              }}
            >
              Siguiente frase
            </Primary>
          </div>
        </Card>
      </Shell>
    );
  }

  return null;
}
