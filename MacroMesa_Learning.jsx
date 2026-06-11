import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ArrowMarker } from "recharts";

// ── Palette & tokens ──────────────────────────────────────────────────────────
const C = {
  navy: "#0C1F3F",
  navyMid: "#1A3660",
  gold: "#C8A032",
  goldLight: "#E8C050",
  teal: "#1DB8A4",
  tealLight: "#4DD9C8",
  cream: "#F5F2EA",
  creamDark: "#EAE6D8",
  text: "#1C2B40",
  textMuted: "#5A6B80",
  white: "#FFFFFF",
  red: "#E05252",
  green: "#2EB87A",
  purple: "#7C5CBF",
};

// ── Global styles injected once ───────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: ${C.cream}; color: ${C.text}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${C.creamDark}; }
    ::-webkit-scrollbar-thumb { background: ${C.navyMid}; border-radius: 3px; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .serif { font-family: 'DM Serif Display', serif; }
    .fade-in { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
    .tag-gold { background: ${C.gold}22; color: ${C.gold}; border: 1px solid ${C.gold}55; }
    .tag-teal { background: ${C.teal}22; color: ${C.teal}; border: 1px solid ${C.teal}55; }
    .tag-navy { background: ${C.navy}22; color: ${C.navyMid}; border: 1px solid ${C.navyMid}44; }
    .card { background: white; border-radius: 14px; box-shadow: 0 2px 12px rgba(12,31,63,0.08); }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(12,31,63,0.14); transition: all 0.2s; }
    .btn-primary { background: ${C.navy}; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: ${C.navyMid}; }
    .btn-gold { background: ${C.gold}; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
    .btn-gold:hover { background: ${C.goldLight}; }
    .btn-outline { background: transparent; color: ${C.navy}; border: 2px solid ${C.navy}; border-radius: 8px; padding: 8px 18px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: ${C.navy}; color: white; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    .formula-box { background: ${C.navy}08; border-left: 4px solid ${C.teal}; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 12px 0; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: ${C.navy}; }
    .highlight { background: ${C.gold}18; border-radius: 4px; padding: 0 4px; }
    .mechanism-arrow { color: ${C.teal}; font-weight: 700; margin: 0 6px; }
    .correct { color: ${C.green}; }
    .incorrect { color: ${C.red}; }
    input[type="radio"] { accent-color: ${C.navy}; width: 16px; height: 16px; }
  `}</style>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const UNITS = [
  {
    id: 1, code: "U1", color: C.teal,
    title: "Enfoque Monetario Internacional",
    topics: ["Paridades internacionales (PPC, PCI, PNCI)", "Mercados de divisas y sistemas cambiarios", "Modelo Krugman — renta y tipo de cambio", "Modelo Mundell-Fleming"],
    partial: "Parcial 1 (35%)",
  },
  {
    id: 2, code: "U2", color: C.gold,
    title: "OA-DA en Economía Abierta",
    topics: ["Derivación DA en economía abierta", "OA clásica y keynesiana", "Choques reales/financieros con TC fijo/flexible", "Overshooting del tipo de cambio"],
    partial: "Parcial 1 (35%)",
  },
  {
    id: 3, code: "U3", color: C.purple,
    title: "Regímenes Cambiarios y Pol. Monetaria",
    topics: ["Regímenes, políticas y sistemas intermedios", "Creación de dinero y esterilización", "Intervención esterilizada y no esterilizada", "Modelo síntesis (i; P) con intervención"],
    partial: "Parcial 2 (35%)",
  },
  {
    id: 4, code: "U4", color: C.red,
    title: "Determinantes del TCR",
    topics: ["Modelo Krugman con TC flexible (precios fijos)", "Modelo síntesis (i; TCR)", "Choques reales y financieros en (i, TCR)", "Bienes transables (T) y no transables (N)"],
    partial: "Parcial 2 (35%)",
  },
  {
    id: 5, code: "U5", color: C.navyMid,
    title: "Enfoque Real Internacional",
    topics: ["Ahorro, inversión y cuenta corriente", "Dimensión intertemporal de la CC", "Política fiscal, ahorro e inversión", "Teoría Harrod-Balassa-Samuelson"],
    partial: "Final (30%)",
  },
  {
    id: 6, code: "U6", color: C.green,
    title: "Tópicos de Política Monetaria",
    topics: ["Eficiencia de la política monetaria", "Reglas vs. discrecionalidad", "Esquemas de inflación objetivo", "Macroeconomía del TC en Colombia"],
    partial: "Final (30%)",
  },
];

const EXERCISES = [
  {
    id: 1, unit: 1, section: "Balanza de Pagos",
    question: "¿Cuál de los siguientes grupos de transacciones compone la Cuenta Corriente de la Balanza de Pagos?",
    options: [
      "Variación de reservas internacionales, inversión extranjera directa y préstamos externos",
      "Balanza comercial, balanza de servicios y balanza de transferencias",
      "Exportaciones de bienes, cuenta de capital y reservas del banco central",
      "Dividendos, intereses y emisión de bonos soberanos",
    ],
    correct: 1,
    explanation: `La Cuenta Corriente (CC) se compone de TRES sub-balanzas:

① **Balanza Comercial** → X (exportaciones) − Q (importaciones) de bienes.
② **Balanza de Servicios** → turismo, fletes, seguros, servicios financieros.
③ **Balanza de Transferencias** → remesas, donaciones, ayudas (sin contraprestación).

La opción A describe la **Cuenta Financiera**.
La opción C mezcla la CC con la Cuenta de Capital.
La opción D describe flujos de renta financiera (Cuenta Financiera).`,
    mechanism: "X + Servicios + Transferencias → CC → Refleja posición neta frente al mundo",
    formula: "CC = Balanza Comercial + Balanza de Servicios + Transferencias Netas",
  },
  {
    id: 2, unit: 1, section: "Cuenta Financiera",
    question: "Según la lógica contable de la Balanza de Pagos, ¿cuál afirmación es correcta sobre el registro en la Cuenta Financiera?",
    options: [
      "Un aumento de activos financieros externos se registra como crédito (+)",
      "Una disminución de pasivos financieros externos se registra como crédito (+)",
      "Un aumento de pasivos financieros externos se registra como crédito (+)",
      "Una disminución de activos financieros externos se registra como débito (−)",
    ],
    correct: 2,
    explanation: `La regla contable de la BP sigue la lógica de **fuentes y usos de divisas**:

**CRÉDITO (+):**
• Aumento de pasivos (↑ deuda, ↑ IED recibida) → *entra capital al país*
• Disminución de activos externos (venta de activos externos) → *retorna capital*

**DÉBITO (−):**
• Aumento de activos externos (compra activos en el exterior) → *sale capital*
• Disminución de pasivos (pago de deuda) → *sale capital*

Regla mnemónica: *"Entrada de capital = crédito"*`,
    mechanism: "Entrada capital → Crédito (+) | Salida capital → Débito (−)",
    formula: "CF = ΔPasivos − ΔActivos | CF > 0 → entrada neta de capital",
  },
  {
    id: 3, unit: 1, section: "Balanza Comercial y Precios",
    question: "Si los precios internos suben más que los internacionales y el TC nominal permanece constante, ¿qué ocurre con la Balanza Comercial?",
    options: [
      "Las exportaciones aumentan porque el país es más competitivo en el exterior",
      "Las importaciones disminuyen porque los bienes externos se encarecen relativamente",
      "Las exportaciones disminuyen y las importaciones aumentan, deteriorando la Balanza Comercial",
      "La Balanza Comercial no varía porque el tipo de cambio nominal está fijo",
    ],
    correct: 2,
    explanation: `Este ejercicio gira alrededor del **Tipo de Cambio Real (TCR)**:

**TCR = E × P* / P**

Si P↑↑ (inflación doméstica alta), P* constante, E constante:
→ TCR = E × P* / P **BAJA**

**Consecuencias:**
• Los bienes domésticos se encarecen para el extranjero → ↓ Exportaciones (X)
• Los bienes importados se abaratan relativamente → ↑ Importaciones (Q)
• Resultado: **Balanza Comercial = X − Q se DETERIORA**

Esto es exactamente lo que describe la **PPC**: sin ajuste nominal del TC, la inflación diferencial deteriora la competitividad real.`,
    mechanism: "P↑ (doméstico) → TCR↓ → Pérdida competitividad → X↓, Q↑ → BC deteriorada",
    formula: "TCR = E × (P*/P) | ΔTCR/TCR = ΔE/E + ΔP*/P* − ΔP/P",
  },
  {
    id: 4, unit: 2, section: "PPC Absoluta",
    question: "La PPC absoluta establece que el tipo de cambio nominal (Et) debe cumplir que:",
    options: [
      "Et = P* / P, donde P es el nivel de precios doméstico y P* el nivel de precios externo",
      "Et = P / P*, de modo que el TC refleja el cociente de precios domésticos sobre externos",
      "Et × P* = P, de modo que una unidad de moneda extranjera compra la misma canasta en ambos países",
      "Et = i − i*, donde i e i* son las tasas de interés doméstica y externa",
    ],
    correct: 2,
    explanation: `La **PPC Absoluta** establece la Ley de Un Solo Precio a nivel agregado:

**Lógica:** Si P es el precio doméstico y P* el precio externo (en moneda extranjera), entonces:
  
  *Precio doméstico = TC × Precio externo*
  **P = E × P***

Despejando E: **E = P / P***

La opción C expresa lo mismo pero en la forma:
  **E × P* = P → ✓ CORRECTA**

La opción A tiene E = P*/P, que es la inversa incorrecta.
La opción D es la condición de Paridad de Intereses (¡no de precios!).`,
    mechanism: "Ley de 1 solo precio → P_doméstico = E × P* → E = P/P*",
    formula: "E_PPC = P / P*  ó equivalente  E × P* = P",
  },
  {
    id: 5, unit: 3, section: "Paridad No Cubierta",
    question: "Si aumenta la tasa de interés en Colombia (iCOL) manteniendo todo lo demás constante, ¿qué ocurre con el tipo de cambio spot?",
    options: [
      "Et aumenta (el peso colombiano se deprecia frente al dólar)",
      "Et disminuye (el peso se aprecia frente al dólar por entrada de capitales)",
      "Et no cambia porque la PNCI solo aplica en el largo plazo",
      "Et aumenta porque una mayor tasa de interés genera salidas de capital",
    ],
    correct: 1,
    explanation: `**PNCI:** (1 + iCOL) / (1 + iUSA) = E^e_{t+1} / E_t

Si ↑ iCOL (con E^e_{t+1} y iUSA constantes):
→ Lado izquierdo ↑ > lado derecho
→ Para restaurar equilibrio: **E_t debe BAJAR** (apreciación del peso)

**Mecanismo de transmisión:**
1. ↑ iCOL → Colombia ofrece mayor rendimiento
2. Inversores internacionales compran activos colombianos
3. Demanda de pesos ↑ (oferta de dólares ↑)
4. Precio del dólar baja → **Peso se aprecia → E_t ↓**

Este es el canal de **arbitraje de tasas de interés**.`,
    mechanism: "↑ iCOL → Entrada capitales → ↑ Oferta $ → ↓ E_t (apreciación peso)",
    formula: "(1+i_COL)/(1+i_USA) = E^e_{t+1}/E_t → ↑i_COL → ↓E_t",
  },
  {
    id: 6, unit: 4, section: "Mercado Cambiario",
    question: "Si el Banco Central interviene comprando dólares para evitar que el TC baje, ¿qué efecto tiene sobre la oferta monetaria?",
    options: [
      "Contrae la oferta monetaria porque el banco central retira pesos del mercado",
      "Aumenta la oferta monetaria porque el banco central emite pesos para pagar los dólares que compra",
      "No tiene efecto sobre la oferta monetaria si el banco central esteriliza la intervención",
      "Aumenta las reservas internacionales pero no cambia la oferta monetaria en el corto plazo",
    ],
    correct: 1,
    explanation: `Cuando el Banco Central **compra dólares**:

**Paso 1:** BC entrega pesos a cambio de dólares → **M (pesos en circulación) ↑**
**Paso 2:** Las reservas internacionales del BC ↑

Esto es una **expansión monetaria no deseada** (endogenización de M).

La opción C menciona la **esterilización**, que es la política correctiva posterior:
→ BC compra dólares (↑M) → luego vende bonos domésticos para retirar pesos (↓M)
→ Resultado esterilizado: ↑ Reservas, M constante

Pero la pregunta pregunta el efecto DIRECTO, que es ↑M (opción B).

**Base teórica:** Bajo TC fijo, la política monetaria se **endogeniza** a las intervenciones cambiarias.`,
    mechanism: "BC compra $ → Emite pesos → ↑ Base monetaria → ↑ M (sin esterilización)",
    formula: "B = RIN × E + CDN | ↑RIN → ↑B → ↑M = m × B",
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "La Paridad Cubierta de Intereses (PCI) se diferencia de la PNCI en que:",
    opts: [
      "La PCI usa tasas de interés reales, la PNCI usa tasas nominales",
      "La PCI elimina el riesgo cambiario mediante un contrato forward",
      "La PCI aplica solo en economías cerradas",
      "La PCI requiere libre movilidad de bienes, no de capitales",
    ],
    correct: 1,
    hint: "Piensa en qué mecanismo cubre el riesgo de devaluación.",
  },
  {
    q: "Según la PPC Relativa, si la inflación doméstica es 8% y la externa 3%, la depreciación esperada del peso es aproximadamente:",
    opts: ["11%", "3%", "5%", "8%"],
    correct: 2,
    hint: "ΔE/E ≈ π − π* = diferencial de inflaciones.",
  },
  {
    q: "Un 'déficit mellizo' ocurre cuando:",
    opts: [
      "Hay déficit simultáneo en CC y Cuenta de Capital",
      "El déficit fiscal reduce el ahorro nacional y genera déficit en CC",
      "El banco central pierde reservas y el TC se deprecia al mismo tiempo",
      "La inversión privada supera al ahorro y el gobierno tiene superávit",
    ],
    correct: 1,
    hint: "Recuerda la identidad: CC = S − I = (Sp − I) + (T − G).",
  },
  {
    q: "En el enfoque monetario del TC (M·V = P·Y + PPC), un aumento de la producción doméstica (↑Y) produce:",
    opts: [
      "Depreciación del tipo de cambio nominal",
      "Aumento del nivel de precios doméstico",
      "Apreciación del tipo de cambio nominal",
      "No afecta el tipo de cambio nominal",
    ],
    correct: 2,
    hint: "Si Y↑ y M constante, ¿qué pasa con P? Luego aplica la PPC.",
  },
  {
    q: "Bajo un régimen de tipo de cambio fijo, una expansión fiscal (↑G) con libre movilidad de capitales genera:",
    opts: [
      "Aumento del producto y depreciación del TC",
      "No tiene efecto porque la política monetaria la neutraliza",
      "Aumento del producto sin alterar el TC (gracias a la entrada de capitales)",
      "Reducción del ahorro nacional y apreciación del TC",
    ],
    correct: 2,
    hint: "En Mundell-Fleming con TC fijo, la política fiscal es muy efectiva.",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProfessorProfile() {
  return (
    <div className="fade-in" style={{ padding: "0 0 32px" }}>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.teal}33 100%)`,
        borderRadius: 18, padding: "40px 36px", marginBottom: 24, position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30, width: 200, height: 200,
          borderRadius: "50%", background: `${C.gold}15`,
        }} />
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", position: "relative" }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, fontFamily: "'DM Serif Display', serif", color: C.navy, fontWeight: 700,
            flexShrink: 0, border: "3px solid rgba(255,255,255,0.25)",
          }}>RJM</div>
          <div>
            <p style={{ color: C.tealLight, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Profesor Titular · UNAL Medellín
            </p>
            <h2 style={{ color: "white", fontFamily: "'DM Serif Display', serif", fontSize: 28, lineHeight: 1.2, marginBottom: 8 }}>
              Dr. Ramón Javier<br />Mesa Callejas
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="pill" style={{ background: `${C.teal}30`, color: C.tealLight, border: `1px solid ${C.teal}50` }}>Macroeconomía Internacional</span>
              <span className="pill" style={{ background: `${C.gold}30`, color: C.goldLight, border: `1px solid ${C.gold}50` }}>Política Monetaria</span>
              <span className="pill" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>Regímenes Cambiarios</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Metodología */}
        <div className="card" style={{ padding: "24px 26px" }}>
          <h3 style={{ color: C.navy, fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: C.teal, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📐</span>
            Metodología Pedagógica
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Análisis gráfico primero", "Cada concepto se explica primero visualmente antes de formalizar con ecuaciones."],
              ["Mecanismos de transmisión", "Se mapean las cadenas causales: variable → canal → efecto en la economía."],
              ["Contexto colombiano", "Los modelos se anclan siempre en datos y políticas reales de Colombia."],
              ["Preguntas de aplicación", "El estudiante enfrenta escenarios concretos y debe predecir el movimiento de variables."],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: C.cream, borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: C.navy, marginBottom: 3 }}>{title}</p>
                <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Publicaciones clave */}
        <div className="card" style={{ padding: "24px 26px" }}>
          <h3 style={{ color: C.navy, fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: C.gold, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📄</span>
            Publicaciones Relevantes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["2023", "Tasas de interés y crecimiento: más allá de la política monetaria", "La Silla Vacía"],
              ["2022", "Intervenir el dólar para frenar la inflación, el debate", "La Silla Vacía"],
              ["2022", "La encrucijada de la política monetaria en Colombia", "La Silla Vacía"],
              ["2014", "Evaluando las intervenciones cambiarias en Colombia 2004-2012", "Estudios Gerenciales"],
              ["2013", "Modelando el esquema de intervenciones del TC para Colombia", "Cuadernos de Economía"],
            ].map(([year, title, source]) => (
              <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ background: C.navy, color: "white", borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{year}</span>
                <div>
                  <p style={{ fontSize: 12, color: C.text, lineHeight: 1.4, fontWeight: 500 }}>{title}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>{source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluación */}
      <div className="card" style={{ padding: "24px 26px", marginTop: 20 }}>
        <h3 style={{ color: C.navy, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📊 Estructura de Evaluación — Macroeconomía III (2026-1)</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Primer Parcial", value: "35%", detail: "Unidades 1 y 2", color: C.teal },
            { label: "Segundo Parcial", value: "35%", detail: "Unidades 3 y 4", color: C.gold },
            { label: "Examen Final", value: "30%", detail: "Unidades 5 y 6", color: C.navy },
          ].map(e => (
            <div key={e.label} style={{
              flex: "1 1 140px", background: `linear-gradient(135deg, ${e.color}15, ${e.color}05)`,
              border: `2px solid ${e.color}30`, borderRadius: 12, padding: "16px 20px", textAlign: "center",
            }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: e.color, fontFamily: "'DM Serif Display', serif" }}>{e.value}</p>
              <p style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{e.label}</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>{e.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnitCard({ unit, onClick }) {
  return (
    <div className="card card-hover" style={{ padding: "22px 24px", cursor: "pointer", borderLeft: `5px solid ${unit.color}` }} onClick={() => onClick(unit)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ background: unit.color, color: "white", borderRadius: 8, padding: "3px 12px", fontSize: 13, fontWeight: 700 }}>{unit.code}</span>
        <span className="pill tag-navy">{unit.partial}</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12, lineHeight: 1.3 }}>{unit.title}</h3>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
        {unit.topics.map(t => (
          <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.textMuted }}>
            <span style={{ color: unit.color, marginTop: 2 }}>›</span>{t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UnitsView({ onSelectUnit }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 6 }}>Programa del Curso</h2>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Macroeconomía III · Semestre 2026-1 · Dr. Ramón Javier Mesa Callejas</p>
      </div>
      <div className="grid-2">
        {UNITS.map(u => <UnitCard key={u.id} unit={u} onClick={onSelectUnit} />)}
      </div>
    </div>
  );
}

// ── Economic Diagram Components ─────────────────────────────────────────────
function TCRDiagram() {
  const [scenario, setScenario] = useState("neutral");
  const scenarios = {
    neutral: { tcr: 1.0, label: "TCR = 1 (Equilibrio)", color: C.teal, desc: "Precios relativos iguales. Competitividad neutral." },
    inflation: { tcr: 0.75, label: "TCR < 1 (Apreciación Real)", color: C.red, desc: "Inflación doméstica alta. Pérdida de competitividad exportadora." },
    devaluation: { tcr: 1.35, label: "TCR > 1 (Depreciación Real)", color: C.green, desc: "Devaluación nominal o deflación doméstica. Ganancia competitiva." },
  };
  const s = scenarios[scenario];
  const width = 380, height = 200;
  const barW = 60, maxH = 130;
  const barH = Math.min(s.tcr * 80, maxH);

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📈 Tipo de Cambio Real (TCR)</h3>
      <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>TCR = E × P* / P — indicador de competitividad</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(scenarios).map(([key, v]) => (
          <button key={key} onClick={() => setScenario(key)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: scenario === key ? C.navy : "transparent",
            color: scenario === key ? "white" : C.navy,
            border: `2px solid ${scenario === key ? C.navy : C.creamDark}`,
          }}>{key === "neutral" ? "Equilibrio" : key === "inflation" ? "Inflación Doméstica" : "Devaluación"}</button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}>
        {/* Axes */}
        <line x1={50} y1={160} x2={330} y2={160} stroke={C.text} strokeWidth={2} />
        <line x1={50} y1={20} x2={50} y2={160} stroke={C.text} strokeWidth={2} />
        {/* Reference line TCR=1 */}
        <line x1={50} y1={80} x2={330} y2={80} stroke={C.teal} strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={335} y={83} fill={C.teal} fontSize={11}>TCR=1</text>
        {/* Bar */}
        <rect x={145} y={160 - barH} width={barW} height={barH} fill={s.color} fillOpacity={0.85} rx={6} />
        <text x={175} y={160 - barH - 8} textAnchor="middle" fill={s.color} fontSize={14} fontWeight={700}>{s.tcr.toFixed(2)}</text>
        {/* Competitor bar (always 1) */}
        <rect x={235} y={80} width={barW} height={80} fill={C.textMuted} fillOpacity={0.4} rx={6} />
        <text x={265} y={73} textAnchor="middle" fill={C.textMuted} fontSize={12} fontWeight={600}>P*=1</text>
        {/* Labels */}
        <text x={175} y={178} textAnchor="middle" fill={C.text} fontSize={11} fontWeight={600}>Doméstico</text>
        <text x={265} y={178} textAnchor="middle" fill={C.textMuted} fontSize={11}>Externo</text>
        <text x={30} y={165} fill={C.text} fontSize={10} textAnchor="middle">0</text>
        <text x={30} y={83} fill={C.teal} fontSize={10} textAnchor="middle">1</text>
        {/* Arrow indicators */}
        {scenario === "inflation" && (
          <g>
            <text x={100} y={55} fill={C.red} fontSize={12} fontWeight={700}>↓ TCR</text>
            <text x={75} y={70} fill={C.red} fontSize={10}>Pérdida</text>
            <text x={75} y={82} fill={C.red} fontSize={10}>competit.</text>
          </g>
        )}
        {scenario === "devaluation" && (
          <text x={85} y={35} fill={C.green} fontSize={12} fontWeight={700}>↑ TCR → Gana X</text>
        )}
      </svg>
      <div style={{ background: `${s.color}15`, borderRadius: 8, padding: "10px 14px", marginTop: 8, borderLeft: `3px solid ${s.color}` }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.label}</p>
        <p style={{ fontSize: 12, color: C.text, marginTop: 3 }}>{s.desc}</p>
      </div>
    </div>
  );
}

function PPCDiagram() {
  const [domesticInflation, setDomesticInflation] = useState(5);
  const [foreignInflation, setForeignInflation] = useState(3);
  const expectedDep = ((domesticInflation - foreignInflation)).toFixed(1);
  const dataPoints = Array.from({ length: 8 }, (_, i) => ({
    t: `t+${i}`,
    spot: 4200 * Math.pow(1 + (domesticInflation - foreignInflation) / 100, i),
    ppc: 4200 * Math.pow(1 + (domesticInflation - foreignInflation) / 100, i),
  }));

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>💱 PPC Relativa — Simulador</h3>
      <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>Ajuste los diferenciales de inflación y observe la trayectoria del tipo de cambio</p>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 4 }}>
            Inflación Colombia: <span style={{ color: C.teal }}>{domesticInflation}%</span>
          </label>
          <input type="range" min={0} max={20} value={domesticInflation} onChange={e => setDomesticInflation(+e.target.value)}
            style={{ width: "100%", accentColor: C.teal }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 4 }}>
            Inflación EE.UU.: <span style={{ color: C.gold }}>{foreignInflation}%</span>
          </label>
          <input type="range" min={0} max={15} value={foreignInflation} onChange={e => setForeignInflation(+e.target.value)}
            style={{ width: "100%", accentColor: C.gold }} />
        </div>
      </div>
      <div className="formula-box" style={{ marginBottom: 12 }}>
        ΔE/E ≈ π_COL − π_USA = {domesticInflation}% − {foreignInflation}% = <strong style={{ color: +expectedDep > 0 ? C.red : C.green }}>{expectedDep}% {+expectedDep > 0 ? "(Depreciación)" : "(Apreciación)"}</strong>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={dataPoints}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.creamDark} />
          <XAxis dataKey="t" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${Math.round(v / 100) * 100}`} domain={["auto", "auto"]} />
          <Tooltip formatter={(v) => `$${v.toFixed(0)}`} />
          <Line dataKey="ppc" stroke={C.teal} strokeWidth={2.5} dot={false} name="TC según PPC" />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8, textAlign: "center" }}>
        Trayectoria proyectada del tipo de cambio COP/USD según PPC Relativa (base: $4,200)
      </p>
    </div>
  );
}

function PNCIDiagram() {
  const [iCOL, setICOL] = useState(10);
  const [iUSA, setIUSA] = useState(5);
  const Efuture = 4200;
  const Espot = Efuture * (1 + iUSA / 100) / (1 + iCOL / 100);
  const direction = Espot < 4200 ? "aprecia" : "deprecia";
  const color = Espot < 4200 ? C.green : C.red;

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 20 }}>
      <h3 style={{ color: C.navy, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⚖️ Paridad No Cubierta de Intereses (PNCI)</h3>
      <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>Explore el arbitraje de tasas de interés y su efecto sobre el TC spot</p>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 4 }}>
            i_Colombia: <span style={{ color: C.teal }}>{iCOL}%</span>
          </label>
          <input type="range" min={2} max={25} value={iCOL} onChange={e => setICOL(+e.target.value)}
            style={{ width: "100%", accentColor: C.teal }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 4 }}>
            i_EE.UU.: <span style={{ color: C.gold }}>{iUSA}%</span>
          </label>
          <input type="range" min={0} max={15} value={iUSA} onChange={e => setIUSA(+e.target.value)}
            style={{ width: "100%", accentColor: C.gold }} />
        </div>
      </div>
      <div className="formula-box">
        E_spot = E^e × (1+i_USA)/(1+i_COL) = $4,200 × {((1 + iUSA / 100) / (1 + iCOL / 100)).toFixed(4)} = <strong style={{ color }}>${Espot.toFixed(0)}</strong>
      </div>
      <div style={{ background: `${color}15`, borderRadius: 10, padding: "14px 18px", marginTop: 12, borderLeft: `4px solid ${color}` }}>
        <p style={{ fontWeight: 700, color, fontSize: 14, marginBottom: 4 }}>
          El peso {direction} frente al dólar
        </p>
        <p style={{ fontSize: 12, color: C.text }}>
          {Espot < 4200
            ? `↑ i_COL → Entrada de capitales → Peso apreciado (E_spot = $${Espot.toFixed(0)} < $4,200)`
            : `↑ i_USA → Salida de capitales → Peso depreciado (E_spot = $${Espot.toFixed(0)} > $4,200)`}
        </p>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 130, background: C.cream, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.textMuted }}>Diferencial tasas</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{(iCOL - iUSA).toFixed(0)}%</p>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.cream, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.textMuted }}>TC Spot (PNCI)</p>
          <p style={{ fontSize: 20, fontWeight: 800, color }}>${Espot.toFixed(0)}</p>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.cream, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.textMuted }}>TC Esperado</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>$4,200</p>
        </div>
      </div>
    </div>
  );
}

function ClassNotesView() {
  const [activeNote, setActiveNote] = useState("ppc");
  const notes = {
    ppc: {
      title: "Paridad del Poder de Compra (PPC)",
      badge: "Clase 2-3",
      content: [
        {
          type: "concept",
          title: "Estructura básica del sistema",
          text: "El Resto del Mundo conecta con la economía doméstica a través de dos canales: Comercio Internacional (exportaciones X e importaciones Q — transacciones reales en divisas) y Flujos de Capital (especulativo CP y productivo IED-LP).",
        },
        {
          type: "formula",
          text: "P_$ = E_{$/US} × P*_US  →  Igualdad de precios entre países",
        },
        {
          type: "concept",
          title: "Competitividad y TCR",
          text: "Si P_$ > P*_$: se estimula importar. Si P_$ < P*_$: se estimula producción local. El Tipo de Cambio Real mide esta competitividad relativa.",
        },
        {
          type: "formula",
          text: "TCR = E × (P*/P)  →  precio bienes extranjeros en Col.",
        },
        {
          type: "concept",
          title: "Sobrevaluación y Subvaluación",
          text: "Con precios fijos, el desequilibrio de paridad lo define el tipo de cambio E. Si E_P ≠ E_TCR, la moneda está fuera de su valor de equilibrio.",
        },
        {
          type: "mechanism",
          chain: ["P↑↑ doméstico", "TCR = E×P*/P ↓", "X↓ (exportaciones caen)", "Q↑ (importaciones suben)", "BC se deteriora"],
        },
        {
          type: "formula",
          text: "Ejemplo: TCR = (3639 × 5.60) / 22.900 = 20.378 / 22.900 = 0.88  → Apreciación real",
        },
        {
          type: "concept",
          title: "PPC Relativa",
          text: "La variación del TC nominal iguala el diferencial de inflaciones:",
        },
        {
          type: "formula",
          text: "ΔE/E = ΔP/P − ΔP*/P*  →  Variación TC = inflación doméstica − inflación externa",
        },
        {
          type: "mechanism",
          chain: ["π_COL > π_USA", "Diferencial positivo", "PPC relativa: ΔE/E > 0", "Depreciación esperada", "Pérdida competitividad si E fijo"],
        },
      ],
    },
    monetary: {
      title: "Enfoque Monetario del TC",
      badge: "Clase 4",
      content: [
        {
          type: "concept",
          title: "Teoría Cuantitativa del Dinero (TQM)",
          text: "Base del enfoque monetario: M × V ≅ P × Q. La liquidez (M) debe igualar el valor de la producción (P × Q = PIB).",
        },
        {
          type: "formula",
          text: "M × V = P × Q  →  M = PQ/V",
        },
        {
          type: "formula",
          text: "dM/M = dP/P + dQ/Q − dV/V  →  Crecimiento dinero = Inflación + Crecimiento PIB − Velocidad",
        },
        {
          type: "concept",
          title: "Demanda de Dinero Keynesiana",
          text: "La demanda de dinero depende del ingreso (Y) y de la tasa de interés (i): M/P = L(Y; i). Un aumento de M/P reduce i → exceso oferta monetaria → fuga capitales → sube dólar.",
        },
        {
          type: "formula",
          text: "M/P = L(Y; i)  →  ↑M/P → ↓i → EOM → ↑E (dólar)",
        },
        {
          type: "mechanism",
          chain: ["↑M (Banco Central)", "M/P↑", "i↓ (exceso liquidez)", "Fuga capitales", "EDD dólares ↑", "↑E (depreciación peso)", "↑P (inflación)"],
        },
        {
          type: "concept",
          title: "Creación de Dinero",
          text: "Primario: Banco Central crea la Base Monetaria (B). Secundario: Sistema financiero multiplica a través del multiplicador monetario (m). M = m × B.",
        },
        {
          type: "formula",
          text: "M = m × B  →  donde m = multiplicador monetario, B = base monetaria",
        },
        {
          type: "concept",
          title: "Función del Banco Central",
          text: "Preservar la capacidad adquisitiva del dinero (estabilidad de precios). Cuando baja i en Colombia se genera exceso de oferta monetaria → fuga de capitales → sube el dólar → sube P.",
        },
      ],
    },
    mundell: {
      title: "Modelo Mundell-Fleming",
      badge: "Unidad 1",
      content: [
        {
          type: "concept",
          title: "El modelo en 3 mercados",
          text: "El modelo Mundell-Fleming extiende el IS-LM a la economía abierta. Equilibrio simultáneo en: Mercado de bienes (IS), Mercado monetario (LM) y Mercado de divisas/BP (Balanza de Pagos).",
        },
        {
          type: "formula",
          text: "IS: Y = C + I + G + NX(E)  |  LM: M/P = L(Y, i)  |  BP: i = i* + ΔE^e/E",
        },
        {
          type: "concept",
          title: "Política monetaria con TC flexible",
          text: "Con libre movilidad de capital y TC flexible, una expansión monetaria es MUY efectiva para aumentar el producto (la depreciación desplaza la IS hacia afuera).",
        },
        {
          type: "mechanism",
          chain: ["↑M", "LM se desplaza → ↓i", "i < i*", "Salida capitales", "↑E (depreciación)", "NX mejora → IS↑", "↑Y (producto)"],
        },
        {
          type: "concept",
          title: "Política fiscal con TC flexible",
          text: "Con libre movilidad de capital y TC flexible, la política fiscal es INEFECTIVA (crowding-out externo): el aumento del gasto aprecia el TC, reduce exportaciones netas y anula el impulso.",
        },
        {
          type: "mechanism",
          chain: ["↑G", "IS↑ → ↑i", "i > i*", "Entrada capitales", "↓E (apreciación)", "NX cae → IS↓", "Y sin cambio"],
        },
        {
          type: "concept",
          title: "Política fiscal con TC fijo",
          text: "Con TC fijo y libre movilidad de capital, la política fiscal es MUY efectiva. El banco central debe comprar divisas para mantener el TC, expandiendo M y amplificando el efecto.",
        },
        {
          type: "formula",
          text: "TC fijo + ↑G → ↑Y (efecto multiplicado)  |  TC flexible + ↑G → ΔY ≈ 0",
        },
      ],
    },
  };

  const note = notes[activeNote];

  const renderBlock = (block, i) => {
    if (block.type === "formula") {
      return (
        <div key={i} className="formula-box">
          {block.text}
        </div>
      );
    }
    if (block.type === "mechanism") {
      return (
        <div key={i} style={{ background: `${C.teal}10`, borderRadius: 10, padding: "12px 16px", margin: "10px 0" }}>
          <p style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>⚡ Mecanismo de Transmisión</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            {block.chain.map((step, j) => (
              <span key={j} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  background: j === 0 ? C.navy : j === block.chain.length - 1 ? C.teal : "white",
                  color: j === 0 ? "white" : j === block.chain.length - 1 ? "white" : C.text,
                  border: `1.5px solid ${j === 0 ? C.navy : C.teal}40`,
                  borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600,
                }}>{step}</span>
                {j < block.chain.length - 1 && <span style={{ color: C.teal, fontWeight: 700, fontSize: 14 }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={i} style={{ marginBottom: 12 }}>
        {block.title && <p style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 5 }}>{block.title}</p>}
        <p style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>{block.text}</p>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 6 }}>Notas de Clase</h2>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Contenido derivado de las sesiones y metodología del Dr. Mesa</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(notes).map(([key, n]) => (
          <button key={key} onClick={() => setActiveNote(key)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: activeNote === key ? C.navy : "white",
            color: activeNote === key ? "white" : C.navy,
            border: `2px solid ${activeNote === key ? C.navy : C.creamDark}`,
            transition: "all 0.2s",
          }}>{n.title.split("(")[0].trim()}</button>
        ))}
      </div>

      <div className="card fade-in" style={{ padding: "28px 30px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.navy }}>{note.title}</h3>
          <span className="pill tag-teal">{note.badge}</span>
        </div>
        {note.content.map((block, i) => renderBlock(block, i))}
      </div>

      {/* Interactive diagrams */}
      {activeNote === "ppc" && <><TCRDiagram /><PPCDiagram /></>}
      {activeNote === "mundell" && <PNCIDiagram />}
    </div>
  );
}

function ExerciseDetail({ exercise, onBack }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === exercise.correct;

  return (
    <div className="card fade-in" style={{ padding: "28px 30px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ← Volver a ejercicios
      </button>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <span className="pill tag-navy">Ejercicio {exercise.id}</span>
        <span className="pill tag-teal">{exercise.section}</span>
      </div>
      <p style={{ fontWeight: 600, color: C.navy, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{exercise.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {exercise.options.map((opt, i) => {
          let bg = "white", border = `2px solid ${C.creamDark}`, textColor = C.text;
          if (submitted) {
            if (i === exercise.correct) { bg = `${C.green}15`; border = `2px solid ${C.green}`; textColor = C.green; }
            else if (i === selected && i !== exercise.correct) { bg = `${C.red}15`; border = `2px solid ${C.red}`; textColor = C.red; }
          } else if (selected === i) {
            bg = `${C.navy}08`; border = `2px solid ${C.navy}`;
          }
          return (
            <div key={i} onClick={() => !submitted && setSelected(i)} style={{
              background: bg, border, borderRadius: 10, padding: "12px 16px", cursor: submitted ? "default" : "pointer",
              display: "flex", alignItems: "flex-start", gap: 12, transition: "all 0.15s",
            }}>
              <input type="radio" checked={selected === i} onChange={() => { }} readOnly style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
                <strong style={{ marginRight: 6 }}>{String.fromCharCode(65 + i)})</strong>{opt}
              </span>
              {submitted && i === exercise.correct && <span style={{ marginLeft: "auto", color: C.green, fontSize: 18 }}>✓</span>}
              {submitted && i === selected && i !== exercise.correct && <span style={{ marginLeft: "auto", color: C.red, fontSize: 18 }}>✗</span>}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <button className="btn-primary" onClick={() => selected !== null && setSubmitted(true)} style={{ opacity: selected === null ? 0.5 : 1 }}>
          Verificar respuesta
        </button>
      ) : (
        <div style={{ marginTop: 8 }}>
          <div style={{ background: `${isCorrect ? C.green : C.red}15`, border: `2px solid ${isCorrect ? C.green : C.red}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: isCorrect ? C.green : C.red, marginBottom: 4, fontSize: 15 }}>
              {isCorrect ? "✓ ¡Respuesta correcta!" : "✗ Respuesta incorrecta"}
            </p>
          </div>
          <div style={{ background: C.cream, borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontWeight: 700, color: C.navy, marginBottom: 10, fontSize: 14 }}>📚 Explicación paso a paso</p>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {exercise.explanation.split("\n").map((line, i) => {
                const isBold = line.startsWith("**") || line.includes("**");
                return <p key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
              })}
            </div>
            <div style={{ background: `${C.teal}12`, borderRadius: 8, padding: "10px 14px", marginTop: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>⚡ Mecanismo de Transmisión</p>
              <div className="formula-box" style={{ marginTop: 0, fontSize: 12 }}>{exercise.mechanism}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fórmula Clave</p>
              <div className="formula-box" style={{ marginTop: 0, fontSize: 12 }}>{exercise.formula}</div>
            </div>
          </div>
          <button className="btn-outline" onClick={() => { setSelected(null); setSubmitted(false); }} style={{ marginTop: 16 }}>
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

function ExercisesView() {
  const [activeExercise, setActiveExercise] = useState(null);
  const [filter, setFilter] = useState("all");

  if (activeExercise) {
    return <ExerciseDetail exercise={activeExercise} onBack={() => setActiveExercise(null)} />;
  }

  const filtered = filter === "all" ? EXERCISES : EXERCISES.filter(e => e.unit === +filter);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 6 }}>Ejercicios con Solución</h2>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Cada ejercicio incluye explicación paso a paso, mecanismo de transmisión y fórmulas clave</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all", "Todos"], ["1", "Unidad 1"], ["2", "Unidad 2"], ["3", "Unidad 3"], ["4", "Unidad 4"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: filter === v ? C.navy : "white", color: filter === v ? "white" : C.navy,
            border: `2px solid ${filter === v ? C.navy : C.creamDark}`,
          }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(ex => (
          <div key={ex.id} className="card card-hover" style={{ padding: "18px 22px", cursor: "pointer", borderLeft: `4px solid ${C.teal}` }} onClick={() => setActiveExercise(ex)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="pill tag-navy">Ej. {ex.id}</span>
                <span className="pill tag-teal">{ex.section}</span>
              </div>
              <span style={{ fontSize: 12, color: C.textMuted }}>U{ex.unit}</span>
            </div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{ex.question}</p>
            <p style={{ fontSize: 12, color: C.teal, marginTop: 8, fontWeight: 600 }}>Ver solución y mecanismo →</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const total = QUIZ_QUESTIONS.length;
  const score = Object.entries(answers).filter(([i, a]) => QUIZ_QUESTIONS[+i].correct === a).length;

  const handleSelect = (opt) => {
    if (!submitted) setAnswers(prev => ({ ...prev, [current]: opt }));
  };

  const handleNext = () => {
    if (current < total - 1) { setCurrent(c => c + 1); setSubmitted(false); }
    else setShowResults(true);
  };

  const handleReset = () => {
    setCurrent(0); setAnswers({}); setShowResults(false); setSubmitted(false);
  };

  if (showResults) {
    const pct = Math.round((score / total) * 100);
    const grade = pct >= 80 ? { label: "Excelente", color: C.green } : pct >= 60 ? { label: "Aprobado", color: C.gold } : { label: "Repasar", color: C.red };
    return (
      <div className="fade-in">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 80 ? "🎓" : pct >= 60 ? "📚" : "🔄"}</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: C.navy, marginBottom: 8 }}>Resultado del Mini-Test</h2>
          <p style={{ fontSize: 52, fontWeight: 800, color: grade.color, marginBottom: 4 }}>{pct}%</p>
          <p style={{ fontWeight: 700, color: grade.color, fontSize: 18, marginBottom: 20 }}>{grade.label} — {score}/{total} correctas</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
            {QUIZ_QUESTIONS.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={i} style={{ background: `${correct ? C.green : C.red}12`, borderRadius: 10, padding: "12px 16px", borderLeft: `4px solid ${correct ? C.green : C.red}` }}>
                  <p style={{ fontSize: 13, color: C.text, marginBottom: 4 }}><strong>{i + 1}.</strong> {q.q}</p>
                  {!correct && <p style={{ fontSize: 12, color: C.teal }}>💡 {q.hint}</p>}
                </div>
              );
            })}
          </div>
          <button className="btn-primary" onClick={handleReset}>Repetir Mini-Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 6 }}>Mini-Test · Unidad 1</h2>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Paridades internacionales, mercado de divisas y sistemas cambiarios</p>
      </div>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>Pregunta {current + 1} de {total}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{Math.round((current / total) * 100)}% completado</span>
        </div>
        <div style={{ background: C.creamDark, borderRadius: 99, height: 6 }}>
          <div style={{ background: C.teal, borderRadius: 99, height: 6, width: `${((current + 1) / total) * 100}%`, transition: "width 0.4s" }} />
        </div>
      </div>

      <div className="card" style={{ padding: "28px 30px" }}>
        <p style={{ fontWeight: 600, color: C.navy, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{q.q}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {q.opts.map((opt, i) => {
            let bg = "white", border = `2px solid ${C.creamDark}`, textColor = C.text;
            if (submitted) {
              if (i === q.correct) { bg = `${C.green}15`; border = `2px solid ${C.green}`; textColor = C.green; }
              else if (answers[current] === i && i !== q.correct) { bg = `${C.red}15`; border = `2px solid ${C.red}`; textColor = C.red; }
            } else if (answers[current] === i) {
              bg = `${C.navy}08`; border = `2px solid ${C.navy}`;
            }
            return (
              <div key={i} onClick={() => handleSelect(i)} style={{
                background: bg, border, borderRadius: 10, padding: "12px 16px", cursor: submitted ? "default" : "pointer",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <input type="radio" checked={answers[current] === i} onChange={() => { }} readOnly style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
                  <strong style={{ marginRight: 6 }}>{String.fromCharCode(65 + i)})</strong>{opt}
                </span>
              </div>
            );
          })}
        </div>

        {submitted && (
          <div className="fade-in" style={{ background: `${C.teal}12`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, borderLeft: `4px solid ${C.teal}` }}>
            <p style={{ fontSize: 13, color: C.navy }}><strong>💡 Pista:</strong> {q.hint}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {!submitted && answers[current] !== undefined && (
            <button className="btn-primary" onClick={() => setSubmitted(true)}>Verificar</button>
          )}
          {submitted && (
            <button className="btn-gold" onClick={handleNext}>
              {current < total - 1 ? "Siguiente →" : "Ver resultados"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AITutorView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy el tutor de Macroeconomía III basado en la metodología del Dr. Mesa. Puedo explicarte conceptos, resolver dudas sobre los ejercicios del simulacro, o analizar gráficas de variables macroeconómicas. ¿Qué quieres explorar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Eres el tutor académico del curso Macroeconomía III de la Universidad Nacional de Colombia, basado en la metodología del Dr. Ramón Javier Mesa Callejas. 
          
Metodología específica del Dr. Mesa:
- Énfasis en análisis gráfico: siempre describir qué variables están en los ejes y cómo se mueven
- Mecanismos de transmisión: explicar las cadenas causales paso a paso con flechas (→)
- Contexto colombiano: anclar siempre los conceptos en la realidad económica colombiana
- Primero intuición económica, luego la fórmula matemática

Temas del curso (Unidad 1 - Parcial 1):
- Balanza de Pagos y sus componentes
- Paridad del Poder de Compra (PPC) absoluta y relativa
- Tipo de Cambio Real (TCR = E × P*/P)
- Paridad No Cubierta de Intereses (PNCI)
- Paridad Cubierta de Intereses (PCI)
- Modelo Mundell-Fleming
- Mercado de divisas y sistemas cambiarios
- Enfoque monetario del tipo de cambio

Responde siempre en español, de forma clara y pedagógica. Usa → para mecanismos de transmisión. Incluye fórmulas cuando sea relevante. Máximo 3-4 párrafos por respuesta.`,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Error al obtener respuesta.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Verifica tu sesión en Claude." }]);
    }
    setLoading(false);
  };

  const SUGGESTIONS = [
    "Explica el mecanismo de transmisión de una depreciación del peso sobre la BC",
    "¿Cuándo se produce un déficit mellizo?",
    "¿Cómo afecta una subida de la FED al dólar en Colombia?",
    "Diferencia entre PCI y PNCI con ejemplo numérico",
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 4 }}>Tutor IA · Metodología Mesa</h2>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Preguntas, dudas conceptuales y ejercicios — en español, al estilo del Dr. Mesa</p>
      </div>

      {messages.length === 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              background: "white", border: `1.5px solid ${C.creamDark}`, borderRadius: 8,
              padding: "7px 13px", fontSize: 12, color: C.navy, cursor: "pointer",
              transition: "border-color 0.2s", fontWeight: 500,
            }} onMouseEnter={e => e.target.style.borderColor = C.teal} onMouseLeave={e => e.target.style.borderColor = C.creamDark}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? C.navy : "white",
              color: m.role === "user" ? "white" : C.text,
              padding: "12px 16px", fontSize: 13, lineHeight: 1.7,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              whiteSpace: "pre-wrap",
            }}>
              {m.role === "assistant" && (
                <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Tutor Macro III
                </p>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "white", borderRadius: "14px 14px 14px 4px", padding: "12px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{
                    width: 8, height: 8, borderRadius: "50%", background: C.teal,
                    animation: `bounce 1s ${d * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Escribe tu pregunta sobre macroeconomía internacional..."
          style={{
            flex: 1, border: `2px solid ${C.creamDark}`, borderRadius: 10, padding: "12px 16px",
            fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif",
            background: "white", color: C.text,
          }}
          onFocus={e => e.target.style.borderColor = C.teal}
          onBlur={e => e.target.style.borderColor = C.creamDark}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "12px 20px", opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Enviar
        </button>
      </div>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home", icon: "🏛", label: "Inicio" },
  { id: "units", icon: "📖", label: "Unidades" },
  { id: "notes", icon: "📝", label: "Notas" },
  { id: "exercises", icon: "⚙️", label: "Ejercicios" },
  { id: "quiz", icon: "🎯", label: "Mini-Test" },
  { id: "tutor", icon: "🤖", label: "Tutor IA" },
];

function HomeView({ setTab }) {
  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 55%, #1D4060 100%)`,
        borderRadius: 20, padding: "44px 40px", marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%", background: `${C.teal}12` }} />
        <div style={{ position: "absolute", bottom: -40, left: 60, width: 140, height: 140, borderRadius: "50%", background: `${C.gold}10` }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: C.tealLight, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Universidad Nacional de Colombia · Sede Medellín
          </p>
          <h1 style={{ color: "white", fontFamily: "'DM Serif Display', serif", fontSize: 36, lineHeight: 1.15, marginBottom: 14 }}>
            Macroeconomía III<br /><span style={{ color: C.goldLight, fontStyle: "italic" }}>Economía Abierta</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, maxWidth: 500, marginBottom: 24 }}>
            Entorno de aprendizaje interactivo basado en la metodología del Dr. Ramón Javier Mesa Callejas. Análisis gráfico, mecanismos de transmisión y ejercicios tipo parcial.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-gold" onClick={() => setTab("notes")} style={{ fontSize: 13 }}>📝 Ver Notas de Clase</button>
            <button onClick={() => setTab("exercises")} style={{
              background: "rgba(255,255,255,0.12)", color: "white", border: "2px solid rgba(255,255,255,0.25)",
              borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>⚙️ Ejercicios</button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { n: "6", label: "Unidades", sub: "3 evaluaciones", color: C.teal, icon: "📚" },
          { n: "25", label: "Ejercicios", sub: "Con solución paso a paso", color: C.gold, icon: "⚙️" },
          { n: "100%", label: "Evaluación", sub: "Parcial 1: U1+U2 (35%)", color: C.navy, icon: "📊" },
        ].map(s => (
          <div key={s.n} className="card" style={{ padding: "20px 22px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{s.n}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.label}</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Plan de sesión */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>📅 Plan de Trabajo</h3>
          {[
            ["Lectura mínima", "2 lecturas por sesión según programa"],
            ["Análisis profundo", "Mecanismos de transmisión con gráficas"],
            ["Ejercicios tipo parcial", "Selección múltiple + justificación"],
            ["Mini-test final", "Al cierre de cada unidad"],
            ["Continuidad", "Cada sesión retoma donde quedó la anterior"],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ background: C.teal, borderRadius: 4, width: 6, height: 6, flexShrink: 0, marginTop: 6 }} />
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>{title}:</span>
                <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 4 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Acceso rápido por sección */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>⚡ Acceso Rápido</h3>
          {[
            { tab: "notes", icon: "📝", title: "Notas de Clase", desc: "PPC, Enfoque Monetario, Mundell-Fleming", color: C.teal },
            { tab: "exercises", icon: "⚙️", title: "Ejercicios Resueltos", desc: "25 preguntas tipo parcial con explicación", color: C.gold },
            { tab: "quiz", icon: "🎯", title: "Mini-Test U1", desc: "5 preguntas con retroalimentación", color: C.navy },
            { tab: "tutor", icon: "🤖", title: "Tutor IA", desc: "Dudas en tiempo real — metodología Mesa", color: C.purple },
          ].map(item => (
            <div key={item.tab} className="card-hover" onClick={() => setTab(item.tab)} style={{
              display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", marginBottom: 8,
              borderRadius: 10, cursor: "pointer", background: C.cream, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.title}</p>
                <p style={{ fontSize: 11, color: C.textMuted }}>{item.desc}</p>
              </div>
              <span style={{ marginLeft: "auto", color: item.color, fontWeight: 700, fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleSelectUnit = (unit) => { setSelectedUnit(unit); setTab("unit-detail"); };

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: C.cream }}>
        {/* Top nav */}
        <div style={{ background: C.navy, padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
              <div style={{ background: C.gold, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: C.navy, fontFamily: "'DM Serif Display', serif" }}>M</div>
              <div>
                <p style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>Macro III</p>
                <p style={{ color: C.tealLight, fontSize: 10, letterSpacing: "0.06em" }}>Dr. Mesa · UNAL Medellín</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  background: tab === t.id ? `${C.teal}25` : "transparent",
                  color: tab === t.id ? C.tealLight : "rgba(255,255,255,0.6)",
                  border: "none", borderRadius: 8, padding: "8px 14px",
                  fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
                  borderBottom: tab === t.id ? `2px solid ${C.teal}` : "2px solid transparent",
                }}>
                  <span>{t.icon}</span>
                  <span style={{ display: window.innerWidth < 640 ? "none" : "inline" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
          {tab === "home" && <HomeView setTab={setTab} />}
          {tab === "units" && <UnitsView onSelectUnit={handleSelectUnit} />}
          {tab === "notes" && <ClassNotesView />}
          {tab === "exercises" && <ExercisesView />}
          {tab === "quiz" && <QuizView />}
          {tab === "tutor" && <AITutorView />}
          {tab === "unit-detail" && selectedUnit && (
            <div className="fade-in">
              <button onClick={() => setTab("units")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>← Volver al programa</button>
              <div className="card" style={{ padding: "28px 30px", borderLeft: `6px solid ${selectedUnit.color}` }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <span style={{ background: selectedUnit.color, color: "white", borderRadius: 8, padding: "4px 14px", fontSize: 15, fontWeight: 700 }}>{selectedUnit.code}</span>
                  <span className="pill tag-gold">{selectedUnit.partial}</span>
                </div>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.navy, marginBottom: 20 }}>{selectedUnit.title}</h2>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Temas de la unidad</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedUnit.topics.map((t, i) => (
                    <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", background: C.cream, borderRadius: 10, padding: "12px 16px" }}>
                      <span style={{ background: selectedUnit.color, color: "white", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                  <button className="btn-primary" onClick={() => setTab("notes")}>Ver notas de clase →</button>
                  <button className="btn-outline" onClick={() => setTab("exercises")}>Ver ejercicios</button>
                </div>
              </div>
            </div>
          )}
          {tab === "professor" && <ProfessorProfile />}
        </div>

        {/* Footer */}
        <div style={{ background: C.navy, borderTop: `3px solid ${C.gold}`, padding: "16px 24px", marginTop: 40 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Macroeconomía III · UNAL Medellín · 2026-1 · Dr. Ramón Javier Mesa Callejas</p>
            <p style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>Entorno de Aprendizaje Interactivo</p>
          </div>
        </div>
      </div>
    </>
  );
}
