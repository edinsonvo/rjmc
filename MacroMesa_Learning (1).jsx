import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const C = {
  navy:"#0C1F3F", navyMid:"#1A3660", gold:"#C8A032", goldLight:"#E8C050",
  teal:"#1DB8A4", tealLight:"#4DD9C8", cream:"#F5F2EA", creamDark:"#EAE6D8",
  text:"#1C2B40", textMuted:"#5A6B80", white:"#FFFFFF",
  red:"#E05252", green:"#2EB87A", purple:"#7C5CBF", orange:"#E08830",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:${C.cream};color:${C.text};}
    ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${C.creamDark};}
    ::-webkit-scrollbar-thumb{background:${C.navyMid};border-radius:3px;}
    .fade{animation:fi 0.35s ease;}
    @keyframes fi{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .card{background:white;border-radius:14px;box-shadow:0 2px 12px rgba(12,31,63,.08);}
    .ch:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(12,31,63,.14);transition:all .2s;}
    .bp{background:#0C1F3F;color:white;border:none;border-radius:8px;padding:10px 20px;font-weight:600;font-size:14px;cursor:pointer;}
    .bg{background:#C8A032;color:white;border:none;border-radius:8px;padding:10px 20px;font-weight:600;font-size:14px;cursor:pointer;}
    .bo{background:transparent;color:#0C1F3F;border:2px solid #0C1F3F;border-radius:8px;padding:8px 18px;font-weight:600;font-size:14px;cursor:pointer;}
    .bo:hover{background:#0C1F3F;color:white;}
    .fb{background:#0C1F3F0d;border-left:4px solid #1DB8A4;border-radius:0 8px 8px 0;padding:13px 17px;margin:10px 0;font-family:'JetBrains Mono',monospace;font-size:13px;color:#0C1F3F;}
    input[type="radio"]{accent-color:#0C1F3F;width:15px;height:15px;}
    input[type="range"]{accent-color:#1DB8A4;width:100%;}
    .pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.04em;}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
    @media(max-width:720px){.g2,.g3{grid-template-columns:1fr;}}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  `}</style>
);

const EX = [
  {id:1,unit:1,pts:5,section:"Balanza de Pagos",
   question:"¿Cuál grupo de transacciones compone la Cuenta Corriente?",
   options:["Variación de reservas internacionales, IED y préstamos externos","Balanza comercial, servicios y transferencias","Exportaciones de bienes, cuenta de capital y reservas del BC","Dividendos, intereses y emisión de bonos soberanos"],
   correct:1,
   explanation:"La CC = Balanza Comercial (X−Q) + Servicios + Transferencias Netas (remesas, donaciones).\n\nLa opción A describe la **Cuenta Financiera**; la C mezcla la CC con Cuenta de Capital; la D son flujos de renta.",
   mechanism:"X + Servicios + Remesas → Cuenta Corriente → Posición neta frente al mundo",
   formula:"CC = (X−Q) + Saldo_Servicios + Transferencias_Netas"},
  {id:2,unit:1,pts:5,section:"Cuenta Financiera",
   question:"¿Cuál afirmación es correcta sobre el registro en la Cuenta Financiera?",
   options:["Un aumento de activos externos se registra como crédito (+)","Una disminución de pasivos externos se registra como crédito (+)","Un aumento de pasivos externos se registra como crédito (+)","Una disminución de activos externos se registra como débito (−)"],
   correct:2,
   explanation:"Regla: **Entradas de capital = Crédito (+)**.\n↑ Pasivos externos = extranjeros prestan al país → Entra capital → Crédito (+).\n↑ Activos externos = el país compra activos afuera → Sale capital → Débito (−).",
   mechanism:"↑ Pasivos (deuda, IED recibida) → Entrada capital → Crédito (+) en CF",
   formula:"CF = ΔPasivos − ΔActivos | CF > 0 → entrada neta de capital"},
  {id:3,unit:1,pts:5,section:"Tipo de Cambio Real",
   question:"Si los precios internos suben más que los externos con TC constante, ¿qué ocurre con la BC?",
   options:["Las exportaciones aumentan porque el país es más competitivo","Las importaciones disminuyen porque los bienes externos se encarecen","Las exportaciones disminuyen y las importaciones aumentan, deteriorando la BC","La BC no varía porque el TC nominal está fijo"],
   correct:2,
   explanation:"TCR = E × P*/P. Si P↑↑ con E y P* fijos → TCR↓ → pérdida de competitividad.\nBienes domésticos se encarecen → ↓X. Importados se abaratan → ↑Q. **BC = X−Q se deteriora.**",
   mechanism:"↑P doméstico → TCR↓ → X↓, Q↑ → Balanza Comercial deteriorada",
   formula:"TCR = E×(P*/P) | ΔTCR/TCR = ΔE/E + ΔP*/P* − ΔP/P"},
  {id:4,unit:1,pts:5,section:"Identidad Macroeconómica",
   question:"A partir de PNB = C+I+G+XN+... y S = PNB−C−G, ¿cuál es la expresión de la CC?",
   options:["CC = I − S","CC = G − T","CC = S − I","CC = PNB − C"],
   correct:2,
   explanation:"S = PNB − C − G → PNB = S + C + G.\nSustituyendo: **CC = S − I**.\nSi S > I → superávit CC. Si S < I → déficit CC financiado con capital externo.",
   mechanism:"CC = S − I → Déficit CC implica Inversión > Ahorro → financiado con capital externo",
   formula:"CC = S − I = (Sp−Ip) + (T−G)"},
  {id:5,unit:1,pts:5,section:"Déficits Mellizos",
   question:"¿Bajo qué condición se presentan los 'déficits mellizos'?",
   options:["Déficit en CC y superávit en Cuenta de Capital","Déficit fiscal asociado a déficit en CC porque el gasto público excesivo reduce S nacional","BC pierde reservas y el TC se aprecia","Inversión privada supera al ahorro y el gobierno tiene superávit"],
   correct:1,
   explanation:"De CC = (Sp−Ip) + (T−G): si (T−G) < 0 (déficit fiscal) → S nacional ↓ → CC < 0 (déficit).\nLos dos déficits coexisten: déficit fiscal ↔ déficit en CC = **twin deficits**.",
   mechanism:"↑G > T → Déficit fiscal → ↓S nacional → CC = S−I < 0",
   formula:"CC = (Sp−Ip) + (T−G) | T−G < 0 → DEF_fiscal → CC < 0"},
  {id:6,unit:2,pts:5,section:"PPC Absoluta",
   question:"La PPC absoluta establece que en equilibrio Et debe cumplir que:",
   options:["Et = P*/P","Et = P/P*","Et × P* = P (una unidad extranjera compra la misma canasta)","Et = i − i*"],
   correct:2,
   explanation:"PPC absoluta = Ley de Un Solo Precio agregada: P = E × P* → **E × P* = P** ✓.\nDespejando: E_PPC = P/P*. Opción A invierte el cociente. Opción D es paridad de intereses.",
   mechanism:"Precio doméstico = TC × Precio externo → E = P/P* → TC de largo plazo",
   formula:"E_PPC = P/P*  equivale a  E × P* = P"},
  {id:7,unit:2,pts:5,section:"Tipo de Cambio Real",
   question:"Inflación Colombia 8%, EE.UU. 3%, TC constante. ¿Qué ocurre con el TCR?",
   options:["TCR aumenta → depreciación real y gana competitividad","TCR disminuye → bienes domésticos se encarecen y se pierde competitividad","TCR permanece constante porque la PPC garantiza equilibrio","TCR aumenta porque precios externos son relativamente más baratos"],
   correct:1,
   explanation:"ΔTCR/TCR = 0 + 3% − 8% = **−5%** → TCR baja → Apreciación real del peso.\nBienes domésticos se encarecen → exportadores pierden competitividad.",
   mechanism:"ΔE=0, π=8%, π*=3% → ΔTCR=−5% → Apreciación real → X↓, Q↑",
   formula:"ΔTCR/TCR = ΔE/E + π_USA − π_COL = 0 + 3% − 8% = −5%"},
  {id:8,unit:2,pts:5,section:"PPC Relativa",
   question:"Según la PPC relativa, la devaluación esperada E^e_{t+1}/Et se expresa como:",
   options:["(1+i)/(1+i*) tasas de interés","(1+Πe)/(1+Πe*) inflaciones esperadas","P/P* precios actuales","M/M* ofertas monetarias"],
   correct:1,
   explanation:"PPC relativa: la variación del TC iguala el diferencial de inflaciones.\n(E_t/E_{t-1}) = (1+π)/(1+π*) → devaluación esperada = **(1+Πe)/(1+Πe*)** ✓.\nOpción A es la PNCI.",
   mechanism:"π_dom > π_ext → Depreciación esperada del TC para mantener competitividad",
   formula:"E^e_{t+1}/Et = (1+πe)/(1+πe*) ≈ 1 + (πe − πe*)"},
  {id:9,unit:2,pts:5,section:"Sobrevaluación",
   question:"Si TC nominal observado < TC de equilibrio PPC, ¿cuál es la situación?",
   options:["Moneda subvaluada → favorece exportaciones","Moneda sobrevaluada → perjudica exportaciones porque bienes domésticos son más caros","Moneda en equilibrio de largo plazo","Moneda depreciada sin efectos sobre competitividad"],
   correct:1,
   explanation:"E_spot < E_PPC → el peso vale más de lo que debería → **Sobrevaluado/Revaluado**.\nBienes domésticos relativamente caros para extranjeros → ↓X, ↑Q → BC deteriorada.",
   mechanism:"E_spot < E_PPC → Peso sobrevaluado → X↓, Q↑ → BC deteriorada",
   formula:"E_spot < E_PPC=P/P* → Sobrevaluación | E_spot > E_PPC → Subvaluación"},
  {id:10,unit:2,pts:5,section:"Enfoque Monetario",
   question:"Según el enfoque monetario M·V=P·Y y PPC, ¿cuál NO influye directamente sobre E?",
   options:["Oferta monetaria (M)","Nivel de producción (Y)","Nivel de precios externo (P*)","Reservas internacionales brutas del BC"],
   correct:3,
   explanation:"E = P/P* = (M·V/Y)/P*. Variables directas: M, V, Y, P*.\nLas **reservas brutas** no aparecen directamente (sí afectan M vía intervención, pero no directamente).",
   mechanism:"M↑ → P↑ (TQM) → E=P/P* ↑ | Y↑ → P↓ → E↓ (apreciación)",
   formula:"E = P/P* = (M×V)/(Y×P*) | Variables directas: M, V, Y, P*"},
  {id:11,unit:3,pts:5,section:"PNCI",
   question:"La PNCI establece que en equilibrio:",
   options:["Tasa doméstica = tasa externa + inflación esperada","Diferencial de tasas = devaluación esperada del TC","TC forward = TC spot + inflación doméstica","Reservas deben crecer al ritmo del diferencial de tasas"],
   correct:1,
   explanation:"PNCI: K(1+i) = (K/E)(1+i*)E^e → **(1+i) = (E^e/E)(1+i*)**.\nAproximación: **i ≈ i* + ΔE^e/E** → diferencial de tasas = depreciación esperada.",
   mechanism:"i > i* → Entra capital → Apreciación spot → E↓ hasta equilibrar PNCI",
   formula:"(1+i_COL) = (E^e/E)(1+i*) | Aprox: i_COL − i* ≈ ΔE^e/E"},
  {id:12,unit:3,pts:5,section:"PNCI Colombia",
   question:"Si aumenta iCOL con todo lo demás constante, ¿qué ocurre con Et (TC spot)?",
   options:["Et aumenta → peso se deprecia","Et disminuye → peso se aprecia por entrada de capitales","Et no cambia porque la PNCI solo aplica en largo plazo","Et aumenta porque mayor tasa genera salidas de capital"],
   correct:1,
   explanation:"PNCI: (1+iCOL)/(1+iUSA) = E^e/E_t. Si ↑iCOL con E^e e iUSA fijos → Para equilibrar: **E_t debe bajar** → Peso se **aprecia**.\n\nEjemplo Dr. Mesa: DTF=9.45%, LIBOR=5.53%, E=3,665 → E^e=3,801 → Deprec. esperada=3.7%.",
   mechanism:"↑iCOL → Mayor rendimiento → Entrada capitales → ↑ Oferta $ → ↓E_t (apreciación)",
   formula:"E_t = E^e×(1+i*)/(1+i) | Ej: E_t=3665 → E^e = 3665×(1.0945/1.0553) = 3,801"},
  {id:13,unit:3,pts:5,section:"PCI vs PNCI",
   question:"¿Cuál es la diferencia fundamental entre PCI y PNCI?",
   options:["PCI usa TC spot, PNCI usa forward","PCI elimina riesgo cambiario con forward; PNCI usa E^e sin cobertura","PCI aplica solo con TC fijo, PNCI con flotación","PCI y PNCI son equivalentes"],
   correct:1,
   explanation:"**PCI:** inversionista cubre con contrato **forward** F. Condición: (1+i) = (F/E)(1+i*).\n**PNCI:** asume riesgo cambiario usando E^e. Condición: (1+i) = (E^e/E)(1+i*).\nDiferencia clave: cobertura con forward vs. expectativas sin cobertura.",
   mechanism:"PCI: F fijo hoy → sin riesgo | PNCI: E^e incierto → con riesgo cambiario",
   formula:"PCI: (1+i)=(F/E)(1+i*) | PNCI: (1+i)=(E^e/E)(1+i*)"},
  {id:14,unit:3,pts:5,section:"Mundell-Fleming",
   question:"En Mundell-Fleming con libre movilidad K, expansión monetaria sobre TC nominal:",
   options:["Aprecia el TC porque ↑M baja tasas y atrae capitales","Deprecia el TC porque ↓i genera salidas de capital y exceso demanda de divisas","Sin efecto porque PM es neutral","Aprecia el TC porque ↑M reduce inflación"],
   correct:1,
   explanation:"↑M → ↓i → i < i* → Salida K → Exceso demanda dólares → **↑E (depreciación)** → ↑NX → ↑Y.\nLa PM es MUY efectiva con TC flexible.",
   mechanism:"↑M → ↓i → Salida K → ↑ Dda $ → ↑E (deprecia) → ↑NX → ↑Y",
   formula:"LM: ↑M→↓i | BP: i<i*→Salida K→↑E | IS: ↑E→↑NX→↑Y"},
  {id:15,unit:3,pts:5,section:"Microestructura",
   question:"En la microestructura del mercado de divisas, ¿característica de los agentes 'chartistas'?",
   options:["Calculan equilibrio con modelos macroeconómicos fundamentales","Forman expectativas a partir de valores pasados del TC sin modelo teórico","Usan la PPC para anticipar TC en largo plazo","Solo operan con contratos forward"],
   correct:1,
   explanation:"**Fundamentalistas:** usan modelos (PPC, PNCI, M-F) → estabilizadores.\n**Chartistas:** basan decisiones en **patrones históricos** de precios y volumen → pueden ser desestabilizadores.",
   mechanism:"Chartistas: E_pasado → Patrón → E_futuro predicho (sin fundamentos)",
   formula:"Chartistas: E_t+1=f(E_t,E_t-1,...) | Fundamentalistas: E_t=P/P* o i=i*+ΔE^e/E"},
  {id:16,unit:4,pts:5,section:"Mercado Cambiario",
   question:"En el mercado cambiario colombiano, ¿quién es demandante de divisas?",
   options:["Exportador colombiano que recibe dólares y los convierte a pesos","Inversor extranjero que trae capital en dólares","Importador colombiano que paga sus compras en el exterior","Banrep cuando vende dólares para evitar que el TC suba"],
   correct:2,
   explanation:"**Demandantes de dólares:** Importadores ✓, colombianos que viajan al exterior, empresas que pagan deuda en $.\n**Oferentes de dólares:** Exportadores, inversores extranjeros, Banrep cuando vende reservas.",
   mechanism:"Importador necesita $ → Demanda dólares → Si ↑Q → ↑Dda$ → Presión ↑E",
   formula:"Dda$: Importadores + Deudores externos + Turistas | Oferta$: Exportadores + IED + Remesas"},
  {id:17,unit:4,pts:5,section:"Mercado Cambiario — Ingreso",
   question:"Si aumenta el ingreso doméstico (ΔY) en Colombia, ¿qué ocurre en el mercado cambiario?",
   options:["↑ Oferta dólares porque empresas exportan más","↑ Demanda dólares porque colombianos importan más, presionando el TC al alza","↓ Demanda dólares porque mayor ingreso reduce propensión a importar","TC se aprecia porque mayor ingreso atrae IED"],
   correct:1,
   explanation:"↑Y → ↑C → ↑Q (importaciones). Para pagar más importaciones → **↑ Demanda $** → **Presión ↑E**.\nFunción: Q = Q(Y,E) con ∂Q/∂Y = mq > 0.",
   mechanism:"↑Y → ↑Ingreso → ↑Q importaciones → ↑Dda$ → Presión ↑E (depreciación)",
   formula:"Q = Q₀ + mq×Y − nq×E | ∂Q/∂Y=mq>0 → ↑Y→↑Q→↑Dda$"},
  {id:18,unit:4,pts:5,section:"Intervención Cambiaria",
   question:"Si el BC compra dólares para evitar que el TC baje, ¿efecto sobre la oferta monetaria?",
   options:["Contrae M porque el BC retira pesos del mercado","Aumenta M porque el BC emite pesos para pagar los dólares que compra","Sin efecto si el BC esteriliza la intervención","Aumenta reservas pero no cambia M en el corto plazo"],
   correct:1,
   explanation:"BC **compra dólares** → paga con **pesos** → emite pesos → **↑ Base monetaria → ↑M**.\nEfecto directo sin esterilización. La opción C describe la esterilización (acción correctiva posterior).",
   mechanism:"BC compra $ → Paga con pesos → ↑B monetaria → ↑M=m×B",
   formula:"B=RIN×E+CDN | ↑RIN→↑B→↑M | Esterilización: BC vende TES→↓B"},
  {id:19,unit:4,pts:5,section:"TC Fijo",
   question:"¿Cuál es el objetivo central en un régimen de tipo de cambio fijo (hard peg)?",
   options:["La defensa del TC usando reservas internacionales","Control de inflación mediante metas de inflación independientes","Equilibrio externo mediante ajuste automático del mercado","Estabilización del producto mediante PM expansiva o contractiva"],
   correct:0,
   explanation:"En un **TC fijo**: objetivo único = **mantener E = Ē**, sin importar el costo en reservas.\nBC vende $ si hay presión depreciación; compra $ si hay presión apreciación.\nCosto: pérdida de autonomía monetaria (M endógena).",
   mechanism:"TC fijo → BC interviene comprando/vendiendo $ → Reservas como instrumento → M endógena",
   formula:"TC fijo: E=Ē | BC mantiene E usando reservas | Costo: M endógena"},
  {id:20,unit:4,pts:5,section:"Endogenización Monetaria",
   question:"¿Por qué bajo TC fijo 'la política monetaria se endogeniza a las intervenciones cambiarias'?",
   options:["Porque el BC puede fijar libremente la tasa de interés","Porque la compra/venta de divisas afecta directamente M, quitando autonomía","Porque en TC fijo la PF es el único instrumento","Porque los agentes privados determinan M via decisiones de portafolio"],
   correct:1,
   explanation:"BC compra $ → ↑M (expansión no deseada). BC vende $ → ↓M (contracción no deseada).\nEl BC **pierde control de M** porque M queda determinada por flujos de divisas, no por decisiones discrecionales.",
   mechanism:"TC fijo → BC compra/vende $ → M se mueve con flujo de divisas → M no es autónoma",
   formula:"M=m×B | B=RIN×E+CDN → ↑RIN→↑B→↑M (sin esterilización)"},
  {id:21,unit:4,pts:5,section:"Integ: Devaluación USD",
   question:"Devaluación del dólar en EE.UU. — ¿efecto sobre TC peso/dólar en Colombia?",
   options:["El dólar sube porque demanda de dólares aumenta en Colombia","El dólar baja (apreciación del peso) porque el dólar pierde valor — PPC","TC no cambia porque solo afecta al mercado estadounidense","El dólar sube porque genera entrada de capitales a Colombia"],
   correct:1,
   explanation:"Si dólar se devalúa internacionalmente (↑P_USA → ↑P*): PPC: E = P/P* → si P* ↑ y P constante → **E baja**.\nSe necesitan **menos pesos** para comprar un dólar → **Dólar baja en Colombia**.",
   mechanism:"↑P_USA (devalúa $) → PPC: E=P/P* → ↓E → Peso aprecia → Dólar baja",
   formula:"PPC: E_COP/USD = P_COL/P_USA | ↑P_USA → ↓E → Apreciación peso"},
  {id:22,unit:4,pts:5,section:"Integ: Expansión Monetaria",
   question:"Expansión monetaria en Colombia — ¿efecto sobre el precio del dólar?",
   options:["Dólar baja porque aumenta liquidez y agentes compran activos externos","Dólar sube (depreciación peso) — enfoque monetario y Mundell-Fleming","Dólar no cambia porque PM solo afecta inflación interna","Dólar sube porque expansión monetaria genera superávit en CC"],
   correct:1,
   explanation:"**Vía M-F:** ↑M → ↓i → i<i* → Salida K → ↑Dda$ → **↑E**.\n**Vía enfoque monetario:** ↑M → ↑P (TQM) → PPC: E=P/P* → **↑E**.\nAmbas: **el dólar sube**.",
   mechanism:"↑M → ↓i (M-F) AND ↑P (TQM) → Salida K y depreciación via PPC → ↑E",
   formula:"M-F: ↓i→Salida K→↑E | TQM+PPC: ↑M→↑P→E=P/P*↑"},
  {id:23,unit:4,pts:5,section:"Integ: Exportaciones",
   question:"Aumento en exportaciones colombianas — ¿efecto sobre el TC nominal?",
   options:["Dólar baja (apreciación peso) porque exportadores ofrecen más dólares — teoría BP","Dólar sube porque exportadores demandan dólares para pagar costos","Dólar sube porque más exportaciones implican más importaciones de insumos","TC no varía porque exportaciones e importaciones siempre se compensan"],
   correct:0,
   explanation:"↑X → exportadores reciben más dólares y los convierten a pesos → **↑ Oferta dólares** → Precio del dólar baja → **Apreciación del peso**.\nDesde BP: ↑X → ↑CC → Entrada neta divisas → Presión apreciación.",
   mechanism:"↑X → ↑Ingresos $ → Exportadores venden $ por pesos → ↑Oferta$ → ↓E (dólar baja)",
   formula:"Oferta$: X + IED + Remesas | ↑X→↑Oferta$→↓E (apreciación)"},
  {id:24,unit:4,pts:5,section:"Integ: FED",
   question:"Alza en tasa de la FED — ¿qué efecto produce sobre el TC en Colombia?",
   options:["Dólar baja porque EE.UU. se vuelve menos atractivo","Dólar sube (depreciación peso) porque capitales salen de Colombia hacia EE.UU. — PNCI","Dólar baja porque FED contrae oferta de dólares en el mundo","TC no cambia porque tasa FED solo afecta bonos del Tesoro"],
   correct:1,
   explanation:"PNCI: (1+iCOL)/(1+iFED) = E^e/E_t. Si ↑iFED con iCOL e E^e fijos → **E_t debe subir**.\nEE.UU. ofrece mayor rentabilidad → Capitales salen de Colombia → ↑Dda$ → **Dólar sube**.",
   mechanism:"↑iFED → EE.UU. más atractivo → Salida K de Colombia → ↑Dda$ → ↑E (dólar sube)",
   formula:"PNCI: E_t=E^e×(1+i*)/(1+iCOL) | ↑i*→↑E_t→Depreciación peso"},
  {id:25,unit:4,pts:5,section:"Integ: Remesas",
   question:"Incremento de remesas del exterior hacia Colombia — ¿efecto sobre el TC?",
   options:["Dólar sube porque remesas generan mayor demanda de bienes importados","Dólar baja (apreciación peso) porque remesas = mayor oferta de divisas — CC","Dólar sube porque remesas aumentan ingreso e importaciones","TC no varía porque remesas no forman parte de la BP"],
   correct:1,
   explanation:"Remesas se registran en **Cuenta de Transferencias** de la CC.\n↑ Remesas (dólares enviados) → receptores venden $ por pesos → **↑ Oferta dólares** → **↓E** → Apreciación del peso.",
   mechanism:"↑Remesas → ↑Entrada $ → Familias venden $ por pesos → ↑Oferta$ → ↓E (dólar baja)",
   formula:"CC = BC + Servicios + Transferencias_Netas | ↑Remesas→↑CC→↑Oferta$→↓E"},
];

const QUIZZES = {
  u1:{title:"Mini-Test · Unidad 1",subtitle:"Paridades internacionales y mercado de divisas",questions:[
    {q:"La PCI se diferencia de la PNCI en que:",opts:["PCI usa tasas reales, PNCI tasas nominales","PCI elimina riesgo cambiario con contrato forward","PCI aplica solo en economías cerradas","PCI requiere libre movilidad de bienes"],correct:1,hint:"Piensa en qué mecanismo cubre el riesgo de devaluación."},
    {q:"Si π_COL=8% y π_USA=3%, depreciación esperada del peso según PPC relativa:",opts:["11%","3%","≈5%","8%"],correct:2,hint:"ΔE/E ≈ π − π* = diferencial de inflaciones."},
    {q:"Un 'déficit mellizo' ocurre cuando:",opts:["Déficit simultáneo en CC y Cuenta de Capital","Déficit fiscal reduce S nacional y genera déficit en CC","BC pierde reservas y TC se deprecia","Inversión privada supera al ahorro y gobierno tiene superávit"],correct:1,hint:"CC = S − I = (Sp−Ip) + (T−G)."},
    {q:"En el enfoque monetario, un aumento de Y con M constante produce:",opts:["Depreciación del TC nominal","Aumento del nivel de precios doméstico","Apreciación del TC nominal","No afecta el TC nominal"],correct:2,hint:"Si Y↑ y M constante → P↓ (TQM) → E=P/P* ↓."},
    {q:"Bajo TC fijo con libre movilidad K, expansión fiscal (↑G) genera:",opts:["↑Y y depreciación TC","Ningún efecto (PM la neutraliza)","↑Y sin alterar TC (entrada K lo sostiene)","↓S nacional y apreciación TC"],correct:2,hint:"En Mundell-Fleming con TC fijo, la PF es muy efectiva."},
  ]},
  u2:{title:"Mini-Test · Unidad 2",subtitle:"OA-DA en economía abierta y Mundell-Fleming",questions:[
    {q:"En M-F con TC flexible, una expansión monetaria es:",opts:["Inefectiva porque entrada K aprecia el TC","Muy efectiva porque depreciación amplifica efecto via NX","Solo afecta precios en largo plazo","Eleva tasa de interés y contrae inversión"],correct:1,hint:"↑M → ↓i → Salida K → ↑E → ↑NX → ↑Y"},
    {q:"La Condición Marshall-Lerner establece que una depreciación mejora la BC si:",opts:["El TCR > 1","Las elasticidades-precio de X y Q (en valor abs.) suman más de 1","El BC tiene suficientes reservas","La inflación doméstica es menor que la externa"],correct:1,hint:"El efecto neto sobre X−Q depende de las elasticidades."},
    {q:"El 'overshooting' del TC implica que:",opts:["TC se ajusta inmediatamente al equilibrio LP","En CP el TC se deprecia MÁS que su nuevo equilibrio LP","TC queda permanentemente sobrevaluado","TC no responde a cambios monetarios"],correct:1,hint:"Dornbusch (1976): precios rígidos en CP → TC sobrepasa su equilibrio."},
    {q:"Si Banrep sube la tasa de interés para frenar inflación, ¿qué ocurre con el TC?",opts:["↑E (depreciación peso)","↓E (apreciación peso)","E no cambia","E fluctúa sin dirección"],correct:1,hint:"PNCI: ↑i_COL → Colombia más atractiva → Entrada K → ↑Oferta$ → ↓E."},
    {q:"Una entrada masiva de IED a Colombia tiende a:",opts:["Depreciar el peso","Apreciar el peso (↓E)","No afectar el TC","Depreciar solo en largo plazo"],correct:1,hint:"IED = entrada de $ → ↑Oferta dólares → ↓E (apreciación)."},
  ]},
};

const UNITS = [
  {id:1,code:"U1",color:"#1DB8A4",title:"Enfoque Monetario Internacional",
   topics:["Paridades internacionales (PPC, PCI, PNCI)","Mercados de divisas y sistemas cambiarios","Modelo Krugman — renta y tipo de cambio","Modelo Mundell-Fleming"],partial:"Parcial 1 (35%)"},
  {id:2,code:"U2",color:"#C8A032",title:"OA-DA en Economía Abierta",
   topics:["Derivación DA en economía abierta","OA clásica y keynesiana","Choques reales/financieros TC fijo/flexible","Overshooting del TC (Dornbusch)"],partial:"Parcial 1 (35%)"},
  {id:3,code:"U3",color:"#7C5CBF",title:"Regímenes Cambiarios y Pol. Monetaria",
   topics:["Regímenes, políticas y sistemas intermedios","Creación de dinero y esterilización","Intervención esterilizada y no esterilizada","Modelo síntesis (i; P) con intervención"],partial:"Parcial 2 (35%)"},
  {id:4,code:"U4",color:"#E05252",title:"Determinantes del TCR",
   topics:["Modelo Krugman TC flexible (precios fijos)","Modelo síntesis (i; TCR)","Choques reales y financieros en (i, TCR)","Bienes transables (T) y no transables (N)"],partial:"Parcial 2 (35%)"},
  {id:5,code:"U5",color:"#1A3660",title:"Enfoque Real Internacional",
   topics:["Ahorro, inversión y cuenta corriente","Dimensión intertemporal de la CC","Política fiscal, ahorro e inversión","Teoría Harrod-Balassa-Samuelson"],partial:"Final (30%)"},
  {id:6,code:"U6",color:"#2EB87A",title:"Tópicos de Política Monetaria",
   topics:["Eficiencia de la política monetaria","Reglas vs. discrecionalidad","Esquemas de inflación objetivo","Macroeconomía del TC en Colombia"],partial:"Final (30%)"},
];

const RESOURCES = [
  {year:"2023",title:"Tasas de interés y crecimiento: más allá de la política monetaria",source:"La Silla Vacía",url:"https://www.lasillavacia.com",tag:"Política Monetaria"},
  {year:"2022",title:"Intervenir el dólar para frenar la inflación, el debate",source:"La Silla Vacía",url:"https://www.lasillavacia.com",tag:"Intervención Cambiaria"},
  {year:"2022",title:"La encrucijada de la política monetaria en Colombia",source:"La Silla Vacía",url:"https://www.lasillavacia.com",tag:"Inflación Colombia"},
  {year:"2022",title:"Dólar en Colombia: los dilemas de la especulación",source:"La Silla Vacía",url:"https://www.lasillavacia.com",tag:"TC Colombia"},
  {year:"2021",title:"Efectividad de la política monetaria en Colombia",source:"UN Periódico Digital",url:"https://unperiodico.unal.edu.co",tag:"Política Monetaria"},
  {year:"2014",title:"Evaluando las intervenciones cambiarias en Colombia 2004-2012",source:"Estudios Gerenciales",url:"https://www.sciencedirect.com",tag:"Intervención Cambiaria"},
  {year:"2013",title:"Modelando el esquema de intervenciones del TC para Colombia",source:"Cuadernos de Economía",url:"http://www.scielo.org.co",tag:"Econometría"},
];

// ── DIAGRAMS ─────────────────────────────────────────────────────────────────
function ForexMarket() {
  const [shock, setShock] = useState("none");
  const W=420,H=230,ox=50,oy=200,aw=340,ah=165;
  const scenarios = {
    none: {dS:0,sS:0,label:"Equilibrio",desc:"Oferta y demanda de dólares se igualan en E*."},
    expX: {dS:0,sS:28,label:"↑ Oferta $ (exportaciones↑ / remesas↑ / IED↑)",desc:"S$ se desplaza derecha → E* baja → Peso se aprecia."},
    impUp:{dS:28,sS:0,label:"↑ Demanda $ (importaciones↑ / salida K)",desc:"D$ se desplaza derecha → E* sube → Peso se deprecia."},
    iFed: {dS:28,sS:0,label:"↑ i_FED → Salida K de Colombia → ↑ Dda $",desc:"Capitales salen → ↑D$ → ↑E → Depreciación del peso."},
    iCol: {dS:0,sS:28,label:"↑ i_COL → Entrada K → ↑ Oferta $",desc:"Colombia más rentable → entra capital → ↑S$ → ↓E → Apreciación."},
  };
  const sc = scenarios[shock];
  const Eq = 130 + sc.dS - sc.sS;
  const D = (e)=>ox+(aw*(210-e)/170)+sc.dS;
  const S = (e)=>ox+(aw*(e-30)/170)+sc.sS;
  const D0= (e)=>ox+(aw*(210-e)/170);
  const S0= (e)=>ox+(aw*(e-30)/170);
  const pts = [60,85,110,130,150,175,200];
  const dPts = pts.map(e=>`${D(e)},${oy-e}`).join(" ");
  const sPts = pts.map(e=>`${S(e)},${oy-e}`).join(" ");
  const d0Pts = pts.map(e=>`${D0(e)},${oy-e}`).join(" ");
  const s0Pts = pts.map(e=>`${S0(e)},${oy-e}`).join(" ");
  const eqX = (D(Eq)+S(Eq))/2;
  const col = sc.dS>sc.sS ? "#E05252" : sc.sS>sc.dS ? "#2EB87A" : "#0C1F3F";

  return (
    <div className="card" style={{padding:"22px 24px",marginBottom:20}}>
      <h3 style={{color:"#0C1F3F",fontWeight:700,fontSize:15,marginBottom:3}}>💱 Mercado de Divisas (Dólares)</h3>
      <p style={{color:"#5A6B80",fontSize:12,marginBottom:13}}>Eje vertical: TC (E) · Eje horizontal: Q$ · Analiza choques sobre la oferta y demanda</p>
      <div style={{display:"flex",gap:6,marginBottom:13,flexWrap:"wrap"}}>
        {[["none","Equilibrio"],["expX","↑ Oferta $"],["impUp","↑ Dda $"],["iFed","↑ i_FED"],["iCol","↑ i_COL"]]
          .map(([v,l])=>(
          <button key={v} onClick={()=>setShock(v)} style={{
            padding:"5px 11px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",
            background:shock===v?"#0C1F3F":"white",color:shock===v?"white":"#0C1F3F",
            border:`2px solid ${shock===v?"#0C1F3F":"#EAE6D8"}`}}>
            {l}
          </button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{maxWidth:W}}>
        <line x1={ox} y1={15} x2={ox} y2={oy+8} stroke="#1C2B40" strokeWidth={2}/>
        <line x1={ox-8} y1={oy} x2={ox+aw+8} y2={oy} stroke="#1C2B40" strokeWidth={2}/>
        <text x={ox-10} y={14} fill="#1C2B40" fontSize={13} fontWeight={700} textAnchor="middle">E</text>
        <text x={ox+aw+12} y={oy+4} fill="#1C2B40" fontSize={11}>Q$</text>
        {shock!=="none" && <>
          <polyline points={d0Pts} fill="none" stroke="#E05252" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4}/>
          <polyline points={s0Pts} fill="none" stroke="#2EB87A" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4}/>
        </>}
        <polyline points={dPts} fill="none" stroke="#E05252" strokeWidth={2.5}/>
        <text x={D(200)+8} y={oy-200} fill="#E05252" fontSize={13} fontWeight={700}>D$</text>
        <polyline points={sPts} fill="none" stroke="#2EB87A" strokeWidth={2.5}/>
        <text x={S(200)+8} y={oy-200} fill="#2EB87A" fontSize={13} fontWeight={700}>S$</text>
        <line x1={ox} y1={oy-Eq} x2={eqX} y2={oy-Eq} stroke={col} strokeWidth={1.2} strokeDasharray="4 3"/>
        <line x1={eqX} y1={oy} x2={eqX} y2={oy-Eq} stroke={col} strokeWidth={1.2} strokeDasharray="4 3"/>
        <circle cx={eqX} cy={oy-Eq} r={5} fill={col} stroke="white" strokeWidth={2}/>
        <text x={ox-6} y={oy-Eq+4} fill={col} fontSize={11} textAnchor="end" fontWeight={700}>E*</text>
        <text x={ox-5} y={oy-40} fill="#5A6B80" fontSize={9} textAnchor="end">bajo</text>
        <text x={ox-5} y={oy-155} fill="#5A6B80" fontSize={9} textAnchor="end">alto</text>
      </svg>
      <div style={{background:`${col}14`,borderRadius:8,padding:"10px 14px",borderLeft:`3px solid ${col}`}}>
        <p style={{fontWeight:700,fontSize:13,color:col}}>{sc.label}</p>
        <p style={{fontSize:12,color:"#1C2B40",marginTop:3}}>{sc.desc}</p>
      </div>
    </div>
  );
}

function TCRCalc() {
  const [eT,setET]=useState(4134);
  const [eT1,setET1]=useState(3667);
  const [piC,setPiC]=useState(5.35);
  const [piU,setPiU]=useState(3.79);
  const dE=((eT/eT1-1)*100).toFixed(2);
  const dTCR=(parseFloat(dE)+piU-piC).toFixed(2);
  const app=parseFloat(dTCR)<0;
  return (
    <div className="card" style={{padding:"22px 24px",marginBottom:20}}>
      <h3 style={{color:"#0C1F3F",fontWeight:700,fontSize:15,marginBottom:3}}>🧮 Calculadora ΔTCR</h3>
      <p style={{color:"#5A6B80",fontSize:12,marginBottom:14}}>Ejemplo del Dr. Mesa (17/02/26): E_25=4134, E_26=3667, π_COL=5.35%, π_USA=3.79% → ΔTCR=−12.86%</p>
      <div className="g2" style={{marginBottom:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>TC período actual (E_t): <b style={{color:"#1DB8A4"}}>${eT}</b></label>
          <input type="range" min={3500} max={5500} value={eT} onChange={e=>setET(+e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>TC período anterior (E_t-1): <b style={{color:"#C8A032"}}>${eT1}</b></label>
          <input type="range" min={3000} max={5500} value={eT1} onChange={e=>setET1(+e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>Inflación Colombia (π_COL): <b style={{color:"#E05252"}}>{piC}%</b></label>
          <input type="range" min={0} max={20} step={0.05} value={piC} onChange={e=>setPiC(+e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>Inflación EE.UU. (π_USA): <b style={{color:"#2EB87A"}}>{piU}%</b></label>
          <input type="range" min={0} max={15} step={0.05} value={piU} onChange={e=>setPiU(+e.target.value)}/>
        </div>
      </div>
      <div className="fb">
        ΔTCR/TCR = ΔE/E + π_USA − π_COL<br/>
        = <b>{dE}%</b> + {piU}% − {piC}%<br/>
        = <b style={{color:app?"#E05252":"#2EB87A"}}>{dTCR}%  {app?"→ Apreciación real (pierde competitividad) 📉":"→ Depreciación real (gana competitividad) 📈"}</b>
      </div>
      <div style={{background:`${app?"#E05252":"#2EB87A"}12`,borderRadius:8,padding:"10px 14px",marginTop:8,borderLeft:`3px solid ${app?"#E05252":"#2EB87A"}`}}>
        <p style={{fontSize:12,color:"#1C2B40"}}>
          {app?`El peso se revalúa y pierde competitividad. ΔE=${dE}% insuficiente frente al diferencial de inflación ${(piC-piU).toFixed(2)}%.`
              :`El peso se deprecia en términos reales, ganando competitividad exportadora. ΔE=${dE}% supera el diferencial de inflación.`}
        </p>
      </div>
    </div>
  );
}

function PNCISim() {
  const [iC,setIC]=useState(9.45);
  const [iU,setIU]=useState(5.53);
  const [Es,setEs]=useState(3665);
  const Ef=Es*(1+iC/100)/(1+iU/100);
  const dep=((Ef/Es-1)*100).toFixed(2);
  const col=parseFloat(dep)>0?"#E05252":"#2EB87A";
  const data=[{p:0,e:Es},{p:3,e:Es*0.25+Ef*0.75},{p:6,e:Es*0.1+Ef*0.9},{p:12,e:Ef}];
  return (
    <div className="card" style={{padding:"22px 24px",marginBottom:20}}>
      <h3 style={{color:"#0C1F3F",fontWeight:700,fontSize:15,marginBottom:3}}>⚖️ PNCI — Simulador</h3>
      <p style={{color:"#5A6B80",fontSize:12,marginBottom:14}}>Ejemplo clase Dr. Mesa: DTF=9.45%, LIBOR=5.53%, E=3,665 → E^e=3,801.14 (depreciación=3.7%)</p>
      <div className="g2" style={{marginBottom:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>DTF / i_COL: <b style={{color:"#1DB8A4"}}>{iC.toFixed(2)}%</b></label>
          <input type="range" min={1} max={25} step={0.05} value={iC} onChange={e=>setIC(+e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>LIBOR / i_USA: <b style={{color:"#C8A032"}}>{iU.toFixed(2)}%</b></label>
          <input type="range" min={0} max={15} step={0.05} value={iU} onChange={e=>setIU(+e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#0C1F3F",display:"block",marginBottom:4}}>TC Spot (E_hoy): <b style={{color:"#0C1F3F"}}>${Es}</b></label>
          <input type="range" min={3000} max={6000} value={Es} onChange={e=>setEs(+e.target.value)}/>
        </div>
        <div style={{background:"#F5F2EA",borderRadius:10,padding:"10px 14px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <p style={{fontSize:11,color:"#5A6B80"}}>TC Futuro Implícito (E^e)</p>
          <p style={{fontSize:26,fontWeight:800,color:col}}>${Ef.toFixed(0)}</p>
          <p style={{fontSize:12,color:col,fontWeight:600}}>Depr. esperada: {dep}%</p>
        </div>
      </div>
      <div className="fb">
        E^e = E_spot × (1+i_COL)/(1+i_USA)<br/>
        = ${Es} × (1+{iC}%)/(1+{iU}%) = <b style={{color:col}}>${Ef.toFixed(2)}</b>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D8"/>
          <XAxis dataKey="p" tickFormatter={v=>`t+${v}m`} tick={{fontSize:10}}/>
          <YAxis tick={{fontSize:10}} domain={[Math.min(Es,Ef)-200, Math.max(Es,Ef)+200]} tickFormatter={v=>`$${v}`}/>
          <Tooltip formatter={v=>`$${v.toFixed(0)}`}/>
          <Line dataKey="e" stroke={col} strokeWidth={2.5} dot={false} name="TC proyectado"/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MFDiag() {
  const [pol, setPol]=useState("none");
  const pols = {
    none: {is:0,lm:0,label:"Equilibrio IS-LM-BP",col:"#0C1F3F",desc:"Equilibrio simultáneo en los tres mercados. Con libre movilidad K, BP es horizontal a i=i*."},
    expM: {is:30,lm:35,label:"Expansión Monetaria (TC flexible) — MUY EFECTIVA",col:"#1DB8A4",desc:"↑M → LM→ → ↓i → Salida K → ↑E (deprecia) → ↑NX → IS→ → ↑Y. La depreciación amplifica el efecto."},
    expG: {is:40,lm:0,label:"Expansión Fiscal (TC flexible) — INEFECTIVA",col:"#E05252",desc:"↑G → IS→ → ↑i > i* → Entrada K → ↓E (aprecia) → ↓NX → IS← → ΔY≈0. Crowding-out externo total."},
    expGF:{is:40,lm:25,label:"Expansión Fiscal (TC fijo) — MUY EFECTIVA",col:"#2EB87A",desc:"↑G → IS→ → ↑i → Entrada K → BC compra $ → ↑M → LM→ → ↑Y amplificado."},
  };
  const p=pols[pol];
  const W=400,H=220,ox=44,oy=195,aw=325,ah=165;
  const IS=(y)=>oy-(ah*(260-y)/200)+p.is;
  const LM=(y)=>oy-(ah*(y-20)/200)+p.lm;
  const BP=oy-100;
  const isP=[60,90,120,150,180,210,240].map(y=>`${ox+(aw*(y-20)/260)},${IS(y)}`).join(" ");
  const lmP=[60,90,120,150,180,210,240].map(y=>`${ox+(aw*(y-20)/260)},${LM(y)}`).join(" ");
  return (
    <div className="card" style={{padding:"22px 24px",marginBottom:20}}>
      <h3 style={{color:"#0C1F3F",fontWeight:700,fontSize:15,marginBottom:3}}>📊 Modelo Mundell-Fleming (IS-LM-BP)</h3>
      <p style={{color:"#5A6B80",fontSize:12,marginBottom:13}}>Con libre movilidad de capital: BP horizontal a i=i*. Eje vertical: i · Eje horizontal: Y</p>
      <div style={{display:"flex",gap:6,marginBottom:13,flexWrap:"wrap"}}>
        {[["none","Equilibrio"],["expM","PM (flex)"],["expG","PF (flex)"],["expGF","PF (fijo)"]].map(([v,l])=>(
          <button key={v} onClick={()=>setPol(v)} style={{
            padding:"5px 11px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",
            background:pol===v?"#0C1F3F":"white",color:pol===v?"white":"#0C1F3F",
            border:`2px solid ${pol===v?"#0C1F3F":"#EAE6D8"}`}}>
            {l}
          </button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{maxWidth:W}}>
        <line x1={ox} y1={14} x2={ox} y2={oy+6} stroke="#1C2B40" strokeWidth={2}/>
        <line x1={ox-6} y1={oy} x2={ox+aw+8} y2={oy} stroke="#1C2B40" strokeWidth={2}/>
        <text x={ox-8} y={13} fill="#1C2B40" fontSize={13} fontWeight={700} textAnchor="middle">i</text>
        <text x={ox+aw+10} y={oy+4} fill="#1C2B40" fontSize={11}>Y</text>
        <line x1={ox} y1={BP} x2={ox+aw} y2={BP} stroke="#7C5CBF" strokeWidth={2} strokeDasharray="8 4"/>
        <text x={ox+aw+4} y={BP+4} fill="#7C5CBF" fontSize={12} fontWeight={700}>BP=0</text>
        <text x={ox+aw-8} y={BP-7} fill="#7C5CBF" fontSize={9}>(i=i*)</text>
        <polyline points={isP} fill="none" stroke="#E05252" strokeWidth={2.5}/>
        <text x={ox+(aw*220/260)+10} y={IS(220)} fill="#E05252" fontSize={13} fontWeight={700}>IS</text>
        <polyline points={lmP} fill="none" stroke="#1DB8A4" strokeWidth={2.5}/>
        <text x={ox+(aw*220/260)+10} y={LM(220)} fill="#1DB8A4" fontSize={13} fontWeight={700}>LM</text>
        {pol!=="none" && <circle cx={ox+(aw*130/260)} cy={BP} r={5} fill={p.col} stroke="white" strokeWidth={2}/>}
        <text x={ox+6} y={BP-6} fill="#7C5CBF" fontSize={9}>i*</text>
      </svg>
      <div style={{background:`${p.col}12`,borderRadius:8,padding:"10px 14px",borderLeft:`3px solid ${p.col}`}}>
        <p style={{fontWeight:700,fontSize:13,color:p.col}}>{p.label}</p>
        <p style={{fontSize:12,color:"#1C2B40",marginTop:3}}>{p.desc}</p>
      </div>
    </div>
  );
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────
function HomeView({setTab}) {
  return (
    <div className="fade">
      <div style={{background:"linear-gradient(135deg,#0C1F3F 0%,#1A3660 55%,#1D4060 100%)",
        borderRadius:20,padding:"44px 40px",marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:260,height:260,borderRadius:"50%",background:"#1DB8A41a"}}/>
        <div style={{position:"absolute",bottom:-40,left:60,width:140,height:140,borderRadius:"50%",background:"#C8A03218"}}/>
        <div style={{position:"relative"}}>
          <p style={{color:"#4DD9C8",fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>
            Universidad Nacional de Colombia · Sede Medellín · 2026-1
          </p>
          <h1 style={{color:"white",fontFamily:"'DM Serif Display',serif",fontSize:34,lineHeight:1.15,marginBottom:14}}>
            Macroeconomía III<br/><span style={{color:"#E8C050",fontStyle:"italic"}}>Economía Abierta</span>
          </h1>
          <p style={{color:"rgba(255,255,255,.75)",fontSize:14,lineHeight:1.6,maxWidth:500,marginBottom:24}}>
            Entorno interactivo basado en la metodología del Dr. Ramón Javier Mesa Callejas. 5 notas de clase, 5 diagramas dinámicos, 25 ejercicios y Tutor IA.
          </p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="bg" onClick={()=>setTab("notes")} style={{fontSize:13}}>📝 Notas de Clase</button>
            <button onClick={()=>setTab("exercises")} style={{background:"rgba(255,255,255,.12)",color:"white",border:"2px solid rgba(255,255,255,.25)",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>⚙️ 25 Ejercicios</button>
            <button onClick={()=>setTab("diagrams")} style={{background:"rgba(255,255,255,.12)",color:"white",border:"2px solid rgba(255,255,255,.25)",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>📈 Diagramas</button>
          </div>
        </div>
      </div>
      <div className="g3" style={{marginBottom:22}}>
        {[{n:"5",l:"Notas de Clase",s:"PPC, Tasas, Monetario, BP, M-F",c:"#1DB8A4",i:"📝"},
          {n:"25",l:"Ejercicios",s:"Con solución y mecanismo",c:"#C8A032",i:"⚙️"},
          {n:"5",l:"Diagramas",s:"Interactivos y editables",c:"#7C5CBF",i:"📈"}]
          .map(s=>(
          <div key={s.n} className="card" style={{padding:"18px 20px",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:26}}>{s.i}</div>
            <div>
              <p style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"'DM Serif Display',serif",lineHeight:1}}>{s.n}</p>
              <p style={{fontSize:13,fontWeight:700,color:"#1C2B40"}}>{s.l}</p>
              <p style={{fontSize:11,color:"#5A6B80"}}>{s.s}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card" style={{padding:"20px 22px"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#0C1F3F",marginBottom:13}}>📅 Plan de Trabajo — Dr. Mesa</h3>
          {[["2 lecturas por sesión","Según el programa oficial del semestre"],
            ["Análisis gráfico primero","Antes de formalizar con ecuaciones matemáticas"],
            ["Mecanismos de transmisión","A → B → C → efecto económico concreto"],
            ["Ejercicios tipo parcial","Selección múltiple con justificación completa"],
            ["Mini-test por unidad","Retroalimentación inmediata al terminar"],
            ["Continuidad de sesión","Retomamos exactamente donde quedamos"]]
            .map(([t,d])=>(
            <div key={t} style={{display:"flex",gap:9,marginBottom:8,alignItems:"flex-start"}}>
              <span style={{background:"#1DB8A4",borderRadius:4,width:6,height:6,flexShrink:0,marginTop:6}}/>
              <div><span style={{fontWeight:600,fontSize:12,color:"#0C1F3F"}}>{t}:</span><span style={{fontSize:12,color:"#5A6B80",marginLeft:4}}>{d}</span></div>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:"20px 22px"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#0C1F3F",marginBottom:13}}>⚡ Acceso Rápido</h3>
          {[{tab:"notes",i:"📝",t:"Notas de Clase",d:"PPC, Paridad Tasas, Mundell-Fleming, BP",c:"#1DB8A4"},
            {tab:"diagrams",i:"📈",t:"Diagramas Interactivos",d:"Forex, TCR, PNCI, IS-LM-BP",c:"#C8A032"},
            {tab:"exercises",i:"⚙️",t:"25 Ejercicios Resueltos",d:"Todas las secciones del simulacro",c:"#0C1F3F"},
            {tab:"quiz_u1",i:"🎯",t:"Mini-Test Unidad 1",d:"Paridades + mercado cambiario",c:"#7C5CBF"},
            {tab:"quiz_u2",i:"🎯",t:"Mini-Test Unidad 2",d:"OA-DA y Mundell-Fleming",c:"#E08830"},
            {tab:"resources",i:"📄",t:"Recursos del Dr. Mesa",d:"7 publicaciones + bibliografía",c:"#2EB87A"},
            {tab:"tutor",i:"🤖",t:"Tutor IA",d:"Preguntas en tiempo real — metodología Mesa",c:"#E05252"},
          ].map(item=>(
            <div key={item.tab} className="ch" onClick={()=>setTab(item.tab)} style={{
              display:"flex",gap:11,alignItems:"center",padding:"7px 10px",marginBottom:5,
              borderRadius:8,cursor:"pointer",background:"#F5F2EA"}}>
              <span style={{fontSize:17}}>{item.i}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:"#0C1F3F"}}>{item.t}</p>
                <p style={{fontSize:11,color:"#5A6B80"}}>{item.d}</p>
              </div>
              <span style={{color:item.c,fontWeight:700,fontSize:15}}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfView() {
  return (
    <div className="fade" style={{paddingBottom:28}}>
      <div style={{background:"linear-gradient(135deg,#0C1F3F 0%,#1A3660 60%,#1DB8A433 100%)",
        borderRadius:18,padding:"38px 34px",marginBottom:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:200,height:200,borderRadius:"50%",background:"#C8A03218"}}/>
        <div style={{display:"flex",gap:26,alignItems:"flex-start",position:"relative",flexWrap:"wrap"}}>
          <div style={{width:86,height:86,borderRadius:"50%",background:"linear-gradient(135deg,#C8A032,#E8C050)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontFamily:"'DM Serif Display',serif",
            color:"#0C1F3F",fontWeight:700,flexShrink:0,border:"3px solid rgba(255,255,255,.25)"}}>RJM</div>
          <div>
            <p style={{color:"#4DD9C8",fontSize:12,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>Profesor Titular · UNAL Medellín</p>
            <h2 style={{color:"white",fontFamily:"'DM Serif Display',serif",fontSize:26,lineHeight:1.2,marginBottom:8}}>Dr. Ramón Javier<br/>Mesa Callejas</h2>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {["Macroeconomía Internacional","Política Monetaria","Regímenes Cambiarios"].map(t=>(
                <span key={t} className="pill" style={{background:"rgba(255,255,255,.12)",color:"rgba(255,255,255,.85)",border:"1px solid rgba(255,255,255,.2)"}}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="g2" style={{marginBottom:18}}>
        <div className="card" style={{padding:"20px 22px"}}>
          <h3 style={{color:"#0C1F3F",fontSize:14,fontWeight:700,marginBottom:12}}>📐 Metodología Pedagógica</h3>
          {[["Análisis gráfico primero","Cada concepto se explica visualmente antes de formalizar con ecuaciones."],
            ["Mecanismos de transmisión","Cadenas causales mapeadas: variable → canal → efecto."],
            ["Contexto colombiano","Los modelos se anclan en datos y políticas reales de Colombia."],
            ["Preguntas de aplicación","El estudiante predice movimiento de variables en escenarios concretos."],
          ].map(([t,d])=>(
            <div key={t} style={{background:"#F5F2EA",borderRadius:9,padding:"9px 13px",marginBottom:7}}>
              <p style={{fontWeight:600,fontSize:12,color:"#0C1F3F",marginBottom:2}}>{t}</p>
              <p style={{fontSize:11,color:"#5A6B80",lineHeight:1.5}}>{d}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:"20px 22px"}}>
          <h3 style={{color:"#0C1F3F",fontSize:14,fontWeight:700,marginBottom:12}}>📊 Evaluación 2026-1</h3>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            {[{l:"Parcial 1",v:"35%",d:"U1 y U2",c:"#1DB8A4"},{l:"Parcial 2",v:"35%",d:"U3 y U4",c:"#C8A032"},{l:"Final",v:"30%",d:"U5 y U6",c:"#0C1F3F"}].map(e=>(
              <div key={e.l} style={{flex:1,background:`${e.c}12`,border:`2px solid ${e.c}30`,borderRadius:9,padding:"12px 8px",textAlign:"center"}}>
                <p style={{fontSize:22,fontWeight:800,color:e.c,fontFamily:"'DM Serif Display',serif"}}>{e.v}</p>
                <p style={{fontWeight:700,color:"#1C2B40",fontSize:12}}>{e.l}</p>
                <p style={{fontSize:10,color:"#5A6B80"}}>{e.d}</p>
              </div>
            ))}
          </div>
          <p style={{fontSize:11,color:"#5A6B80",lineHeight:1.6}}>Actividades de aprendizaje fuera de clase pueden ser consideradas como parte de alguna evaluación, a discrecionalidad del profesor.</p>
        </div>
      </div>
    </div>
  );
}

function NotesView() {
  const [active,setActive]=useState("ppc");
  const chain=(steps)=>(
    <div style={{background:"#1DB8A410",borderRadius:10,padding:"11px 15px",margin:"10px 0"}}>
      <p style={{fontSize:11,color:"#1DB8A4",fontWeight:700,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚡ Mecanismo de Transmisión</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
        {steps.map((s,j)=>(
          <span key={j} style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{background:j===0?"#0C1F3F":j===steps.length-1?"#1DB8A4":"white",
              color:j===0?"white":j===steps.length-1?"white":"#1C2B40",
              border:`1.5px solid ${j===0?"#0C1F3F":"#1DB8A4"}40`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600}}>
              {s}</span>
            {j<steps.length-1&&<span style={{color:"#1DB8A4",fontWeight:700}}>→</span>}
          </span>
        ))}
      </div>
    </div>
  );
  const fb=(t)=><div className="fb">{t}</div>;
  const sec=(title,text)=>(<div style={{marginBottom:11}}><p style={{fontWeight:700,color:"#0C1F3F",fontSize:14,marginBottom:4}}>{title}</p><p style={{color:"#1C2B40",fontSize:13,lineHeight:1.65,whiteSpace:"pre-line"}}>{text}</p></div>);

  const NOTES={
    ppc:{title:"Paridad del Poder de Compra (PPC)",badge:"Clase 2-3",content:()=><>
      {sec("Estructura del sistema internacional","El Resto del Mundo conecta con Colombia a través de: ① Comercio Internacional (X y Q — transacciones reales en divisas) y ② Flujos de Capital (especulativo CP y productivo IED-LP). Las remesas también generan oferta de divisas.")}
      {fb("Igualdad de precios: P_$ = E_{$/US} × P*_US → Ley de Un Solo Precio")}
      {sec("PPC Absoluta","E_PPC = P/P* → Tipo de cambio de largo plazo.\nSi E_spot < E_PPC → Peso sobrevaluado. Si E_spot > E_PPC → Peso subvaluado.")}
      {fb("TCR = E × (P*/P) → Indicador de competitividad. TCR<1: apreciación real. TCR>1: depreciación real")}
      {chain(["P↑↑ doméstico","TCR↓","X↓","Q↑","BC deteriorada"])}
      {sec("PPC Relativa y ΔTCR","Variación del TC nominal = diferencial de inflaciones. ΔTCR añade la apreciación/depreciación real.")}
      {fb("ΔE/E = π_COL − π_USA | ΔTCR/TCR = ΔE/E + π_USA − π_COL")}
      {sec("Ejemplo Dr. Mesa (Clase 3, 17/02/26)","E_25=4134, E_26=3667 → ΔE/E=−11.3%\nπ_COL=5.35%, π_USA=3.79%\nΔTCR = −11.3% + 3.79% − 5.35% = −12.86% → El peso se revalúa y pierde competitividad.")}
      {fb("ΔTCR = −11.3% + 3.79% − 5.35% = −12.86% → Apreciación real del peso")}
    </>},
    rates:{title:"Paridad de Tasas de Interés (PCI y PNCI)",badge:"Clase 4 — 17/02/26",content:()=><>
      {sec("Principio base","Un inversor es indiferente entre invertir en pesos (tasa i) o en dólares (tasa i*) si la rentabilidad —expresada en pesos— es igual.")}
      {fb("K(1+i) = [K/E](1+i*)E^e → Rentabilidad en pesos = Rentabilidad externa en pesos")}
      {fb("(1+i) = (E^e/E)(1+i*) → Condición PNCI (con k=1)")}
      {chain(["i > i*","Entrada capitales","Oferta $ ↑","E_spot ↓","Hasta i = (E^e/E)(1+i*)"])}
      {sec("Ejemplo numérico del Dr. Mesa","DTF = 9.45%, LIBOR = 5.53%, E_spot = 3,665\nE^e = 3,665 × (1.0945/1.0553) = 3,801.14\nDepreciación esperada = 3.7%\nInterpretación: El mercado espera que el dólar suba de $3,665 a $3,801 en el año.")}
      {fb("E^e = E_spot × (1+DTF)/(1+LIBOR) = 3665×1.0945/1.0553 = 3,801.14")}
      {sec("PCI vs PNCI","PCI: cubre riesgo con contrato forward F → (1+i) = (F/E)(1+i*). Sin incertidumbre.\nPNCI: asume riesgo cambiario usando expectativa E^e → (1+i) = (E^e/E)(1+i*). Con riesgo.")}
      {fb("PCI: (1+i)=(F/E)(1+i*) → sin riesgo | PNCI: (1+i)=(E^e/E)(1+i*) → con riesgo")}
    </>},
    monetary:{title:"Enfoque Monetario del Tipo de Cambio",badge:"Clase 4",content:()=><>
      {sec("Teoría Cuantitativa del Dinero (TQM)","M × V = P × Q = PIB. La liquidez (M) debe igualar el valor de la producción nominal.")}
      {fb("M × V = P × Q → dM/M = dP/P + dQ/Q − dV/V")}
      {fb("Cantidad dinero = Inflación + Crecimiento PIB − Velocidad (esperada)")}
      {sec("Demanda de dinero y tasa de interés","M/P = L(Y; i) = kY (versión simplificada). ↑M/P → exceso liquidez → ↓i → EOM → fuga capitales → ↑E.")}
      {fb("M/P = L(Y;i) → ↑M/P → ↓i → EOM → Fuga capitales → ↑E → ↑P")}
      {chain(["↑M (BC emite)","M/P↑","i↓","Fuga capitales (i<i*)","EDD dólares↑","↑E (deprecia)","↑P (inflación)"])}
      {sec("Creación de dinero y función del BC","Primario: Banco Central → Base Monetaria (B). Secundario: Sistema financiero → m. M = m × B.\n\nFunción del BC: preservar capacidad adquisitiva del dinero (estabilidad de precios).")}
      {fb("M = m × B | B = RIN×E + CDN | ↑RIN → ↑B → ↑M")}
    </>},
    bp:{title:"Repaso Balanza de Pagos",badge:"29/04/26",content:()=><>
      {sec("Sistema de Cuentas Nacionales y BP","La BP registra transacciones residentes — no residentes. Se divide en: ① Cuenta No Financiera (DANE): CC + Cuenta de Capital. ② Cuenta Financiera (BanRep): activos y pasivos financieros externos.")}
      {fb("BP = CC + CF + ΔRI = 0 (saldo siempre cero por construcción contable)")}
      {sec("Carácter intertemporal","Déficit CC → obligaciones futuras (deuda, remisión de utilidades, pago de intereses). Si es transitorio: se financia con CF. Si es permanente → ajuste vía depreciación.")}
      {chain(["Déficit CC","Entrada neta capital (CF)","IED: remisión dividendos","Deuda: pago intereses","↓RIN o ↑deuda externa","Ajuste: depreciación ↑E"])}
      {sec("Ajuste de la BP","Un déficit permanente en la CC requiere depreciación del TC. La depreciación genera presión inflacionaria interna (↑P bienes importados).")}
      {fb("Ajuste BP: Déficit CC permanente → Depreciación → ↑E → ↑P importados → ↑P doméstico")}
    </>},
    mundell:{title:"Modelo Mundell-Fleming",badge:"Unidad 1",content:()=><>
      {sec("Los tres mercados","IS (bienes): Y=C+I+G+NX(E). LM (monetario): M/P=L(Y,i). BP (divisas con libre movilidad K): i=i* (BP horizontal).")}
      {fb("Libre movilidad K: i = i* → BP horizontal. El TC ajusta para mantener este equilibrio.")}
      {sec("Política Monetaria con TC flexible — MUY EFECTIVA","↑M → LM→ → ↓i → i<i* → Salida K → ↑E → ↑NX → IS→ → ↑Y. La depreciación amplifica el efecto multiplicador.")}
      {chain(["↑M","LM→ → ↓i<i*","Salida K","↑E (deprecia)","↑NX → IS→","↑Y (amplificado)"])}
      {sec("Política Fiscal con TC flexible — INEFECTIVA (Crowding-out externo)","↑G → IS→ → ↑i>i* → Entrada K → ↓E → ↓NX → IS← → ΔY≈0.")}
      {chain(["↑G","IS→ → ↑i>i*","Entrada K","↓E (aprecia)","↓NX → IS←","ΔY≈0 (inefectiva)"])}
      {sec("Política Fiscal con TC fijo — MUY EFECTIVA","↑G → IS→ → ↑i → Entrada K → BC compra $ → ↑M → LM→ → ↑Y amplificado.")}
      {fb("TC fijo: ↑G→↑Y (máximo) | TC flex: ↑G→ΔY≈0 | TC flex: ↑M→↑Y (máximo)")}
    </>},
  };

  const note=NOTES[active];
  return (
    <div className="fade">
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Notas de Clase</h2>
      <p style={{color:"#5A6B80",fontSize:14,marginBottom:18}}>Basadas directamente en las sesiones del Dr. Mesa · Semestre 2026-1</p>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {Object.entries(NOTES).map(([k,n])=>(
          <button key={k} onClick={()=>setActive(k)} style={{
            padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
            background:active===k?"#0C1F3F":"white",color:active===k?"white":"#0C1F3F",
            border:`2px solid ${active===k?"#0C1F3F":"#EAE6D8"}`
          }}>{n.title.split("(")[0].split("-")[0].trim().substring(0,20)}</button>
        ))}
      </div>
      <div className="card fade" style={{padding:"24px 26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#0C1F3F"}}>{note.title}</h3>
          <span className="pill" style={{background:"#1DB8A420",color:"#1DB8A4",border:"1px solid #1DB8A450"}}>{note.badge}</span>
        </div>
        {note.content()}
      </div>
    </div>
  );
}

function DiagramsView() {
  const [active,setActive]=useState("forex");
  return (
    <div className="fade">
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Diagramas Interactivos</h2>
      <p style={{color:"#5A6B80",fontSize:14,marginBottom:18}}>Explore los modelos, ajuste variables y observe los efectos en tiempo real</p>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {[["forex","Mercado Divisas"],["tcr","Calc. TCR"],["pnci","PNCI"],["mf","Mundell-Fleming"]].map(([k,l])=>(
          <button key={k} onClick={()=>setActive(k)} style={{
            padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
            background:active===k?"#0C1F3F":"white",color:active===k?"white":"#0C1F3F",
            border:`2px solid ${active===k?"#0C1F3F":"#EAE6D8"}`
          }}>{l}</button>
        ))}
      </div>
      <div className="fade">
        {active==="forex"&&<ForexMarket/>}
        {active==="tcr"&&<TCRCalc/>}
        {active==="pnci"&&<PNCISim/>}
        {active==="mf"&&<MFDiag/>}
      </div>
    </div>
  );
}

function ExDetail({ex,onBack}) {
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const ok=sel===ex.correct;
  return (
    <div className="card fade" style={{padding:"24px 26px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#1DB8A4",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:13,display:"flex",alignItems:"center",gap:5}}>← Volver</button>
      <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
        <span className="pill" style={{background:"#0C1F3F14",color:"#0C1F3F",border:"1px solid #0C1F3F25"}}>#{ex.id} · {ex.pts} pts</span>
        <span className="pill" style={{background:"#1DB8A414",color:"#1DB8A4",border:"1px solid #1DB8A440"}}>{ex.section}</span>
        <span className="pill" style={{background:"#C8A03214",color:"#C8A032",border:"1px solid #C8A03240"}}>U{ex.unit}</span>
      </div>
      <p style={{fontWeight:600,color:"#0C1F3F",fontSize:15,lineHeight:1.6,marginBottom:17}}>{ex.question}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:17}}>
        {ex.options.map((opt,i)=>{
          let bg="white",border=`2px solid #EAE6D8`,tc="#1C2B40";
          if(done){
            if(i===ex.correct){bg="#2EB87A14";border="2px solid #2EB87A";tc="#2EB87A";}
            else if(i===sel&&i!==ex.correct){bg="#E0525214";border="2px solid #E05252";tc="#E05252";}
          } else if(sel===i){bg="#0C1F3F0d";border="2px solid #0C1F3F";}
          return (
            <div key={i} onClick={()=>!done&&setSel(i)} style={{
              background:bg,border,borderRadius:10,padding:"11px 14px",cursor:done?"default":"pointer",
              display:"flex",alignItems:"flex-start",gap:10}}>
              <input type="radio" checked={sel===i} onChange={()=>{}} readOnly style={{marginTop:2,flexShrink:0}}/>
              <span style={{fontSize:13,color:tc,lineHeight:1.5}}>
                <strong style={{marginRight:5}}>{String.fromCharCode(65+i)})</strong>{opt}
              </span>
              {done&&i===ex.correct&&<span style={{marginLeft:"auto",color:"#2EB87A",fontSize:17}}>✓</span>}
              {done&&i===sel&&i!==ex.correct&&<span style={{marginLeft:"auto",color:"#E05252",fontSize:17}}>✗</span>}
            </div>
          );
        })}
      </div>
      {!done?(
        <button className="bp" onClick={()=>sel!==null&&setDone(true)} style={{opacity:sel===null?.5:1}}>Verificar</button>
      ):(
        <div>
          <div style={{background:`${ok?"#2EB87A":"#E05252"}12`,border:`2px solid ${ok?"#2EB87A":"#E05252"}30`,borderRadius:10,padding:"13px 17px",marginBottom:12}}>
            <p style={{fontWeight:700,color:ok?"#2EB87A":"#E05252",fontSize:14}}>{ok?"✓ ¡Respuesta correcta!":"✗ Respuesta incorrecta"}</p>
          </div>
          <div style={{background:"#F5F2EA",borderRadius:10,padding:"17px 19px"}}>
            <p style={{fontWeight:700,color:"#0C1F3F",marginBottom:9,fontSize:13}}>📚 Explicación paso a paso</p>
            <p style={{fontSize:13,color:"#1C2B40",lineHeight:1.75,whiteSpace:"pre-line"}} dangerouslySetInnerHTML={{__html:ex.explanation.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")}}/>
            <div style={{background:"#1DB8A410",borderRadius:8,padding:"10px 13px",marginTop:12}}>
              <p style={{fontSize:11,fontWeight:700,color:"#1DB8A4",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚡ Mecanismo de Transmisión</p>
              <div className="fb" style={{marginTop:0,fontSize:12}}>{ex.mechanism}</div>
            </div>
            <div style={{marginTop:9}}>
              <p style={{fontSize:11,fontWeight:700,color:"#0C1F3F",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Fórmula Clave</p>
              <div className="fb" style={{marginTop:0,fontSize:12}}>{ex.formula}</div>
            </div>
          </div>
          <button className="bo" onClick={()=>{setSel(null);setDone(false);}} style={{marginTop:12}}>Intentar de nuevo</button>
        </div>
      )}
    </div>
  );
}

function ExercisesView() {
  const [active,setActive]=useState(null);
  const [fU,setFU]=useState("all");
  const [fS,setFS]=useState("all");
  if(active) return <ExDetail ex={active} onBack={()=>setActive(null)}/>;
  const secs=["all",...new Set(EX.map(e=>e.section))];
  const filtered=EX.filter(e=>(fU==="all"||e.unit===+fU)&&(fS==="all"||e.section===fS));
  return (
    <div className="fade">
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Ejercicios Resueltos</h2>
      <p style={{color:"#5A6B80",fontSize:14,marginBottom:16}}>25 preguntas del simulacro con explicación, mecanismo y fórmula clave</p>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        {["all","1","2","3","4"].map(v=>(
          <button key={v} onClick={()=>setFU(v)} style={{padding:"5px 11px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
            background:fU===v?"#0C1F3F":"white",color:fU===v?"white":"#0C1F3F",border:`2px solid ${fU===v?"#0C1F3F":"#EAE6D8"}`}}>
            {v==="all"?"Todas las unidades":`Unidad ${v}`}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {secs.slice(0,9).map(s=>(
          <button key={s} onClick={()=>setFS(s)} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",
            background:fS===s?"#1DB8A4":"white",color:fS===s?"white":"#5A6B80",border:`1.5px solid ${fS===s?"#1DB8A4":"#EAE6D8"}`}}>
            {s==="all"?"Todas":s}
          </button>
        ))}
      </div>
      <p style={{fontSize:12,color:"#5A6B80",marginBottom:10}}>{filtered.length} ejercicio{filtered.length!==1?"s":""}</p>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {filtered.map(ex=>(
          <div key={ex.id} className="card ch" style={{padding:"14px 18px",cursor:"pointer",borderLeft:"4px solid #1DB8A4"}} onClick={()=>setActive(ex)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div style={{display:"flex",gap:6}}>
                <span className="pill" style={{background:"#0C1F3F10",color:"#0C1F3F",border:"1px solid #0C1F3F20"}}>#{ex.id}</span>
                <span className="pill" style={{background:"#1DB8A410",color:"#1DB8A4",border:"1px solid #1DB8A430"}}>{ex.section}</span>
              </div>
              <span style={{fontSize:11,color:"#5A6B80",fontWeight:600}}>{ex.pts}pts · U{ex.unit}</span>
            </div>
            <p style={{fontSize:13,color:"#1C2B40",lineHeight:1.5}}>{ex.question}</p>
            <p style={{fontSize:12,color:"#1DB8A4",marginTop:6,fontWeight:600}}>Ver solución →</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView({qk}) {
  const quiz=QUIZZES[qk];
  const [cur,setCur]=useState(0);
  const [ans,setAns]=useState({});
  const [sub,setSub]=useState(false);
  const [res,setRes]=useState(false);
  const q=quiz.questions[cur];
  const total=quiz.questions.length;
  const score=Object.entries(ans).filter(([i,a])=>quiz.questions[+i].correct===a).length;
  if(res){
    const pct=Math.round((score/total)*100);
    const gr=pct>=80?{l:"Excelente 🎓",c:"#2EB87A"}:pct>=60?{l:"Aprobado 📚",c:"#C8A032"}:{l:"Repasar 🔄",c:"#E05252"};
    return (
      <div className="card fade" style={{padding:"34px 30px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>{pct>=80?"🎓":pct>=60?"📚":"🔄"}</div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Resultado del Test</h2>
        <p style={{fontSize:44,fontWeight:800,color:gr.c,marginBottom:3}}>{pct}%</p>
        <p style={{fontWeight:700,color:gr.c,fontSize:16,marginBottom:20}}>{gr.l} — {score}/{total} correctas</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22,textAlign:"left"}}>
          {quiz.questions.map((q,i)=>{
            const ok=ans[i]===q.correct;
            return (
              <div key={i} style={{background:`${ok?"#2EB87A":"#E05252"}10`,borderRadius:8,padding:"9px 13px",borderLeft:`4px solid ${ok?"#2EB87A":"#E05252"}`}}>
                <p style={{fontSize:12,color:"#1C2B40",marginBottom:ok?0:3}}><strong>{i+1}.</strong> {q.q}</p>
                {!ok&&<p style={{fontSize:11,color:"#1DB8A4"}}>💡 {q.hint}</p>}
              </div>
            );
          })}
        </div>
        <button className="bp" onClick={()=>{setCur(0);setAns({});setSub(false);setRes(false);}}>Repetir Test</button>
      </div>
    );
  }
  return (
    <div className="fade">
      <div style={{marginBottom:16}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#0C1F3F",marginBottom:3}}>{quiz.title}</h2>
        <p style={{color:"#5A6B80",fontSize:13}}>{quiz.subtitle}</p>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:13,color:"#5A6B80"}}>Pregunta {cur+1} / {total}</span>
          <span style={{fontSize:13,fontWeight:600,color:"#0C1F3F"}}>{Math.round((cur/total)*100)}%</span>
        </div>
        <div style={{background:"#EAE6D8",borderRadius:99,height:5}}>
          <div style={{background:"#1DB8A4",borderRadius:99,height:5,width:`${((cur+1)/total)*100}%`,transition:"width .4s"}}/>
        </div>
      </div>
      <div className="card" style={{padding:"24px 26px"}}>
        <p style={{fontWeight:600,color:"#0C1F3F",fontSize:15,lineHeight:1.6,marginBottom:16}}>{q.q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {q.opts.map((opt,i)=>{
            let bg="white",border=`2px solid #EAE6D8`,tc="#1C2B40";
            if(sub){
              if(i===q.correct){bg="#2EB87A14";border="2px solid #2EB87A";tc="#2EB87A";}
              else if(ans[cur]===i&&i!==q.correct){bg="#E0525214";border="2px solid #E05252";tc="#E05252";}
            } else if(ans[cur]===i){bg="#0C1F3F0d";border="2px solid #0C1F3F";}
            return (
              <div key={i} onClick={()=>!sub&&setAns(p=>({...p,[cur]:i}))} style={{
                background:bg,border,borderRadius:10,padding:"10px 14px",cursor:sub?"default":"pointer",
                display:"flex",alignItems:"flex-start",gap:10}}>
                <input type="radio" checked={ans[cur]===i} onChange={()=>{}} readOnly style={{marginTop:2,flexShrink:0}}/>
                <span style={{fontSize:13,color:tc,lineHeight:1.5}}><strong style={{marginRight:5}}>{String.fromCharCode(65+i)})</strong>{opt}</span>
              </div>
            );
          })}
        </div>
        {sub&&<div className="fade" style={{background:"#1DB8A410",borderRadius:9,padding:"11px 14px",marginBottom:13,borderLeft:"4px solid #1DB8A4"}}>
          <p style={{fontSize:13,color:"#0C1F3F"}}><strong>💡</strong> {q.hint}</p>
        </div>}
        <div style={{display:"flex",gap:8}}>
          {!sub&&ans[cur]!==undefined&&<button className="bp" onClick={()=>setSub(true)}>Verificar</button>}
          {sub&&<button className="bg" onClick={()=>{if(cur<total-1){setCur(c=>c+1);setSub(false);}else setRes(true);}}>
            {cur<total-1?"Siguiente →":"Ver resultados"}
          </button>}
        </div>
      </div>
    </div>
  );
}

function ResourcesView() {
  return (
    <div className="fade">
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Recursos del Dr. Mesa</h2>
      <p style={{color:"#5A6B80",fontSize:14,marginBottom:18}}>Publicaciones y bibliografía del curso</p>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:26}}>
        {RESOURCES.map((r,i)=>(
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <div className="card ch" style={{padding:"14px 18px",borderLeft:"4px solid #C8A032",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",gap:6}}>
                  <span style={{background:"#0C1F3F",color:"white",borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700}}>{r.year}</span>
                  <span className="pill" style={{background:"#1DB8A414",color:"#1DB8A4",border:"1px solid #1DB8A440"}}>{r.tag}</span>
                </div>
                <span style={{fontSize:11,color:"#1DB8A4",fontWeight:600}}>↗</span>
              </div>
              <p style={{fontSize:13,color:"#1C2B40",fontWeight:600,marginBottom:2,lineHeight:1.4}}>{r.title}</p>
              <p style={{fontSize:11,color:"#5A6B80"}}>{r.source}</p>
            </div>
          </a>
        ))}
      </div>
      <div className="card" style={{padding:"20px 22px"}}>
        <h3 style={{fontSize:14,fontWeight:700,color:"#0C1F3F",marginBottom:12}}>📚 Bibliografía Principal</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[["Krugman & Obstfeld","Economía Internacional: Teoría y Política — 7ª ed.","Texto base"],
            ["De Gregorio","Macroeconomía: Teoría y Políticas — Pearson","Referencia central"],
            ["Sachs & Larrain","Macroeconomía en la Economía Global — 2ª ed.","Complementario"],
            ["FMI","Annual Report on Exchange Arrangements and Exchange Restrictions, 2025","Internacional"],
            ["BanRep","Taboada & Villamizar — Mitos y Realidades de la Política Monetaria (2024)","Colombia"],
          ].map(([a,t,tag])=>(
            <div key={a} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
              <span className="pill" style={{background:"#0C1F3F10",color:"#0C1F3F",border:"1px solid #0C1F3F20",flexShrink:0}}>{tag}</span>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"#0C1F3F"}}>{a}</p>
                <p style={{fontSize:11,color:"#5A6B80",lineHeight:1.4}}>{t}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TutorView() {
  const [msgs,setMsgs]=useState([{role:"assistant",content:"¡Hola! Soy el tutor de Macroeconomía III basado en la metodología del Dr. Ramón Javier Mesa Callejas (UNAL Medellín).\n\nPuedo explicarte conceptos con mecanismos de transmisión, resolver las 25 preguntas del simulacro paso a paso, o analizar escenarios del mercado cambiario colombiano. ¿Por dónde empezamos?"}]);
  const [inp,setInp]=useState(""); const [load,setLoad]=useState(false);
  const bot=useRef(null);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"})},[msgs]);
  const send=async()=>{
    if(!inp.trim()||load) return;
    const txt=inp.trim(); setInp("");
    setMsgs(p=>[...p,{role:"user",content:txt}]);
    setLoad(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:`Eres el tutor del curso Macroeconomía III de la Universidad Nacional de Colombia (UNAL Medellín), basado en la metodología del Dr. Ramón Javier Mesa Callejas.

METODOLOGÍA (aplica siempre):
1. Intuición económica y descripción gráfica (ejes y curvas) primero
2. Mecanismo de transmisión con flechas: A → B → C → resultado final
3. Fórmula matemática al final
4. Contexto colombiano (COP, DTF, BanRep, etc.)

CONTENIDO UNIDAD 1:
- BP: CC=(X-Q)+Servicios+Transferencias; CC=S-I; Déficits mellizos: CC=(Sp-Ip)+(T-G)
- PPC absoluta: E=P/P*; TCR=E×P*/P; ΔTCR/TCR=ΔE/E+π*-π
- Ejemplo Dr. Mesa: E_25=4134, E_26=3667, π_COL=5.35%, π_USA=3.79% → ΔTCR=-12.86%
- PNCI: (1+i)=(E^e/E)(1+i*); PCI: (1+i)=(F/E)(1+i*)
- Ejemplo clase: DTF=9.45%, LIBOR=5.53%, E=3665 → E^e=3801.14, depr=3.7%
- TQM: M×V=P×Q; M/P=L(Y,i)=kY; M=mB; B=RIN×E+CDN
- Mundell-Fleming: TC flex PM efectiva PF inefectiva; TC fijo PF efectiva PM endógena
- Chartistas vs fundamentalistas en mercado de divisas

Responde en español. Máximo 4 párrafos. Usa → para mecanismos.`,
          messages:msgs.concat({role:"user",content:txt}).map(m=>({role:m.role,content:m.content})),
        }),
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"Error al obtener respuesta.";
      setMsgs(p=>[...p,{role:"assistant",content:text}]);
    } catch(e){setMsgs(p=>[...p,{role:"assistant",content:"Error de conexión."}]);}
    setLoad(false);
  };
  const SUGG=["¿Cómo afecta una subida de la FED al peso colombiano? Explica con PNCI","Calcula la depreciación esperada si DTF=12% y LIBOR=5.5% y E=4200","¿Por qué la PM es más efectiva que la PF con TC flexible?","Explica los déficits mellizos con la identidad CC = S − I","¿Qué significa que el ΔTCR = −12.86% en Colombia?"];
  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 185px)",minHeight:490}}>
      <div style={{marginBottom:12}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#0C1F3F",marginBottom:3}}>Tutor IA · Metodología Mesa</h2>
        <p style={{color:"#5A6B80",fontSize:13}}>Preguntas, mecanismos y ejercicios al estilo del Dr. Mesa</p>
      </div>
      {msgs.length===1&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {SUGG.map(s=>(
          <button key={s} onClick={()=>setInp(s)} style={{background:"white",border:"1.5px solid #EAE6D8",borderRadius:8,padding:"6px 11px",fontSize:11,color:"#0C1F3F",cursor:"pointer",fontWeight:500}}
            onMouseEnter={e=>e.target.style.borderColor="#1DB8A4"} onMouseLeave={e=>e.target.style.borderColor="#EAE6D8"}>
            {s.length>52?s.slice(0,52)+"…":s}
          </button>
        ))}
      </div>}
      <div className="card" style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:11,marginBottom:9}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"83%",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
              background:m.role==="user"?"#0C1F3F":"white",color:m.role==="user"?"white":"#1C2B40",
              padding:"11px 14px",fontSize:13,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,.07)",whiteSpace:"pre-wrap"}}>
              {m.role==="assistant"&&<p style={{fontSize:10,fontWeight:700,color:"#1DB8A4",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.07em"}}>Tutor Macro III · Dr. Mesa</p>}
              {m.content}
            </div>
          </div>
        ))}
        {load&&<div style={{display:"flex",justifyContent:"flex-start"}}>
          <div style={{background:"white",borderRadius:"14px 14px 14px 4px",padding:"12px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
            <div style={{display:"flex",gap:5}}>{[0,1,2].map(d=><div key={d} style={{width:7,height:7,borderRadius:"50%",background:"#1DB8A4",animation:`bounce 1s ${d*.15}s infinite`}}/>)}</div>
          </div>
        </div>}
        <div ref={bot}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Escribe tu pregunta sobre macroeconomía internacional..."
          style={{flex:1,border:"2px solid #EAE6D8",borderRadius:10,padding:"11px 14px",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif",background:"white",color:"#1C2B40"}}
          onFocus={e=>e.target.style.borderColor="#1DB8A4"} onBlur={e=>e.target.style.borderColor="#EAE6D8"}/>
        <button className="bp" onClick={send} disabled={load||!inp.trim()} style={{padding:"11px 17px",opacity:load||!inp.trim()?.5:1}}>Enviar</button>
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
const TABS=[{id:"home",icon:"🏛",l:"Inicio"},{id:"professor",icon:"👨‍🏫",l:"Profesor"},{id:"units",icon:"📖",l:"Unidades"},
  {id:"notes",icon:"📝",l:"Notas"},{id:"diagrams",icon:"📈",l:"Diagramas"},{id:"exercises",icon:"⚙️",l:"Ejercicios"},
  {id:"quiz_u1",icon:"🎯",l:"Test U1"},{id:"quiz_u2",icon:"🎯",l:"Test U2"},{id:"resources",icon:"📄",l:"Recursos"},{id:"tutor",icon:"🤖",l:"Tutor IA"}];

export default function App() {
  const [tab,setTab]=useState("home");
  const [su,setSu]=useState(null);
  return (
    <>
      <G/>
      <div style={{minHeight:"100vh",background:"#F5F2EA"}}>
        <div style={{background:"#0C1F3F",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(0,0,0,.2)"}}>
          <div style={{maxWidth:1160,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",gap:2,overflowX:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 10px 11px 0",flexShrink:0,marginRight:6}}>
              <div style={{background:"#C8A032",borderRadius:7,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#0C1F3F",fontFamily:"'DM Serif Display',serif"}}>M</div>
              <div><p style={{color:"white",fontWeight:700,fontSize:13,lineHeight:1}}>Macro III</p><p style={{color:"#4DD9C8",fontSize:9,letterSpacing:"0.06em"}}>Dr. Mesa · UNAL</p></div>
            </div>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:tab===t.id?"#1DB8A425":"transparent",color:tab===t.id?"#4DD9C8":"rgba(255,255,255,.55)",
                border:"none",borderRadius:7,padding:"8px 10px",fontSize:11,fontWeight:tab===t.id?700:400,
                cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0,
                borderBottom:tab===t.id?"2px solid #1DB8A4":"2px solid transparent"}}>
                <span>{t.icon}</span><span>{t.l}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"24px 16px"}}>
          {tab==="home"&&<HomeView setTab={setTab}/>}
          {tab==="professor"&&<ProfView/>}
          {tab==="notes"&&<NotesView/>}
          {tab==="diagrams"&&<DiagramsView/>}
          {tab==="exercises"&&<ExercisesView/>}
          {tab==="quiz_u1"&&<QuizView qk="u1"/>}
          {tab==="quiz_u2"&&<QuizView qk="u2"/>}
          {tab==="resources"&&<ResourcesView/>}
          {tab==="tutor"&&<TutorView/>}
          {tab==="units"&&(
            <div className="fade">
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#0C1F3F",marginBottom:5}}>Programa del Curso</h2>
              <p style={{color:"#5A6B80",fontSize:14,marginBottom:18}}>Macroeconomía III · 2026-1 · Dr. Ramón Javier Mesa Callejas</p>
              <div className="g2">
                {UNITS.map(u=>(
                  <div key={u.id} className="card ch" style={{padding:"18px 20px",cursor:"pointer",borderLeft:`5px solid ${u.color}`}} onClick={()=>{setSu(u);setTab("udetail");}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{background:u.color,color:"white",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700}}>{u.code}</span>
                      <span className="pill" style={{background:"#0C1F3F12",color:"#0C1F3F",border:"1px solid #0C1F3F20"}}>{u.partial}</span>
                    </div>
                    <h3 style={{fontSize:13,fontWeight:700,color:"#0C1F3F",marginBottom:9,lineHeight:1.3}}>{u.title}</h3>
                    {u.topics.map(t=>(
                      <p key={t} style={{fontSize:11,color:"#5A6B80",marginBottom:3,display:"flex",gap:6,alignItems:"flex-start"}}>
                        <span style={{color:u.color}}>›</span>{t}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="udetail"&&su&&(
            <div className="fade">
              <button onClick={()=>setTab("units")} style={{background:"none",border:"none",color:"#1DB8A4",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:12}}>← Programa</button>
              <div className="card" style={{padding:"24px 26px",borderLeft:`6px solid ${su.color}`}}>
                <div style={{display:"flex",gap:9,marginBottom:12}}>
                  <span style={{background:su.color,color:"white",borderRadius:6,padding:"4px 12px",fontSize:13,fontWeight:700}}>{su.code}</span>
                  <span className="pill" style={{background:"#C8A03214",color:"#C8A032",border:"1px solid #C8A03240"}}>{su.partial}</span>
                </div>
                <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#0C1F3F",marginBottom:16}}>{su.title}</h2>
                {su.topics.map((t,i)=>(
                  <div key={t} style={{display:"flex",gap:11,alignItems:"center",background:"#F5F2EA",borderRadius:8,padding:"10px 14px",marginBottom:7}}>
                    <span style={{background:su.color,color:"white",borderRadius:5,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span>
                    <span style={{fontSize:13,color:"#1C2B40",fontWeight:500}}>{t}</span>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:18}}>
                  <button className="bp" onClick={()=>setTab("notes")}>Ver notas →</button>
                  <button className="bo" onClick={()=>setTab("exercises")}>Ejercicios</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{background:"#0C1F3F",borderTop:"3px solid #C8A032",padding:"13px 16px",marginTop:32}}>
          <div style={{maxWidth:1160,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:5}}>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:11}}>Macroeconomía III · UNAL Medellín · 2026-1 · Dr. Ramón Javier Mesa Callejas</p>
            <p style={{color:"#C8A032",fontSize:11,fontWeight:600}}>Entorno de Aprendizaje Interactivo</p>
          </div>
        </div>
      </div>
    </>
  );
}
