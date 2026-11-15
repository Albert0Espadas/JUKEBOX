
import * as Tone from "tone";

// =====================================================
// JAKEBOX - ORQUESTA TERRESTRE
// Sonificación visual de datos NASA
//
// 🌊 Océano: melodía grave
// 💨 Viento: atmósfera sonora
// 🌃 Luces nocturnas: notas agudas
// 🌧️ Lluvia: percusión
// =====================================================

let audioIniciado = false;

// Instrumentos
let sintetizadorOceano = null;
let sintetizadorViento = null;
let sintetizadorLuces = null;
let sintetizadorLluvia = null;

// Efectos
let filtroOceano = null;
let filtroViento = null;
let filtroLuces = null;

let panoramaViento = null;

let reverbOceano = null;
let reverbViento = null;
let reverbLuces = null;

// Temporizadores para la percusión
let temporizadoresLluvia = [];

// Escalas musicales
const notasOceano = ["C3", "D3", "E3", "G3", "A3"];
const notasViento = ["C4", "D4", "E4", "G4", "A4"];
const notasLuces = ["C5", "E5", "G5", "A5", "C6"];

// =====================================================
// UTILIDADES
// =====================================================

function limitar(valor, minimo = 0, maximo = 1) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return minimo;
  }

  return Math.max(minimo, Math.min(maximo, numero));
}

function obtenerNota(notas, nivel) {
  const indice = Math.min(
    notas.length - 1,
    Math.floor(limitar(nivel) * notas.length)
  );

  return notas[indice];
}

function cancelarPercusion() {
  temporizadoresLluvia.forEach((id) => clearTimeout(id));
  temporizadoresLluvia = [];
}

// =====================================================
// 🌊 INSTRUMENTO 1: OCÉANO
// =====================================================

export async function iniciarOceano() {
  if (sintetizadorOceano) return;

  reverbOceano = new Tone.Freeverb({
    roomSize: 0.75,
    dampening: 2500
  }).toDestination();

  reverbOceano.wet.value = 0.45;

  filtroOceano = new Tone.Filter({
    frequency: 700,
    type: "lowpass"
  }).connect(reverbOceano);

  sintetizadorOceano = new Tone.Synth({
    oscillator: {
      type: "fatsine",
      count: 3,
      spread: 12
    },
    envelope: {
      attack: 0.8,
      decay: 0.6,
      sustain: 0.35,
      release: 2.5
    },
    volume: -18
  }).connect(filtroOceano);
}

export function reproducirOceanoVisual(datos) {
  if (!audioIniciado || !sintetizadorOceano) return;

  if (!datos?.disponible) {
    detenerOceanoVisual();
    return;
  }

  const nivel = limitar(datos.clasificacion?.nivel ?? 0);

  const nota = obtenerNota(notasOceano, nivel);

  filtroOceano.frequency.rampTo(
    250 + nivel * 1100,
    0.5
  );

  sintetizadorOceano.volume.rampTo(
    -24 + nivel * 9,
    0.5
  );

  sintetizadorOceano.triggerAttackRelease(
    nota,
    3,
    Tone.now() + 0.02,
    0.55
  );
}

export function detenerOceanoVisual() {
  sintetizadorOceano?.triggerRelease();
}

export function destruirOceanoVisual() {
  detenerOceanoVisual();

  sintetizadorOceano?.dispose();
  filtroOceano?.dispose();
  reverbOceano?.dispose();

  sintetizadorOceano = null;
  filtroOceano = null;
  reverbOceano = null;
}

// =====================================================
// 💨 INSTRUMENTO 2: VIENTO
// =====================================================

export async function iniciarVientoVisual() {
  if (sintetizadorViento) return;

  reverbViento = new Tone.Freeverb({
    roomSize: 0.85,
    dampening: 3000
  }).toDestination();

  reverbViento.wet.value = 0.6;

  panoramaViento = new Tone.Panner(0).connect(
    reverbViento
  );

  filtroViento = new Tone.Filter({
    frequency: 900,
    type: "lowpass"
  }).connect(panoramaViento);

  sintetizadorViento = new Tone.Synth({
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.3,
      release: 1.8
    },
    volume: -20
  }).connect(filtroViento);
}

export function reproducirVientoVisual(datos) {
  if (!audioIniciado || !sintetizadorViento) return;

  if (!datos?.disponible) {
    detenerVientoVisual();
    return;
  }

  const caracteristicas = datos.caracteristicas ?? {};

  const tono = limitar(caracteristicas.tono);
  const saturacion = limitar(caracteristicas.saturacion);
  const brillo = limitar(caracteristicas.brillo);

  const nivel = (tono + saturacion) / 2;
  const nota = obtenerNota(notasViento, nivel);

  // Saturación visual -> apertura del filtro
  filtroViento.frequency.rampTo(
    250 + saturacion * 2800,
    0.4
  );

  // Tono visual -> posición estéreo
  panoramaViento.pan.rampTo(
    tono * 2 - 1,
    0.5
  );

  // Brillo visual -> volumen
  sintetizadorViento.volume.rampTo(
    -28 + brillo * 13,
    0.4
  );

  sintetizadorViento.triggerAttackRelease(
    nota,
    1.8,
    Tone.now() + 0.02,
    0.5
  );
}

export function detenerVientoVisual() {
  sintetizadorViento?.triggerRelease();
}

export function destruirVientoVisual() {
  detenerVientoVisual();

  sintetizadorViento?.dispose();
  filtroViento?.dispose();
  panoramaViento?.dispose();
  reverbViento?.dispose();

  sintetizadorViento = null;
  filtroViento = null;
  panoramaViento = null;
  reverbViento = null;
}

// =====================================================
// 🌃 INSTRUMENTO 3: LUCES NOCTURNAS
// =====================================================

export async function iniciarLucesNocturnas() {
  if (sintetizadorLuces) return;

  reverbLuces = new Tone.Freeverb({
    roomSize: 0.65,
    dampening: 4200
  }).toDestination();

  reverbLuces.wet.value = 0.4;

  filtroLuces = new Tone.Filter({
    frequency: 1800,
    type: "lowpass"
  }).connect(reverbLuces);

  sintetizadorLuces = new Tone.Synth({
    oscillator: {
      type: "triangle"
    },
    envelope: {
      attack: 0.03,
      decay: 0.35,
      sustain: 0.15,
      release: 1
    },
    volume: -22
  }).connect(filtroLuces);
}

export function reproducirLucesNocturnas(datos) {
  if (!audioIniciado || !sintetizadorLuces) return;

  if (!datos?.disponible) {
    detenerLucesNocturnas();
    return;
  }

  const caracteristicas = datos.caracteristicas ?? {};

  const brillo = limitar(caracteristicas.brillo);
  const proporcion = limitar(
    caracteristicas.proporcion_iluminada
  );

  const nivel = limitar(
    brillo * 0.7 + proporcion * 0.3
  );

  const nota = obtenerNota(notasLuces, nivel);

  filtroLuces.frequency.rampTo(
    1000 + nivel * 4000,
    0.3
  );

  sintetizadorLuces.volume.rampTo(
    -30 + nivel * 14,
    0.3
  );

  sintetizadorLuces.triggerAttackRelease(
    nota,
    1.2,
    Tone.now() + 0.02,
    0.5
  );
}

export function detenerLucesNocturnas() {
  sintetizadorLuces?.triggerRelease();
}

export function destruirLucesNocturnas() {
  detenerLucesNocturnas();

  sintetizadorLuces?.dispose();
  filtroLuces?.dispose();
  reverbLuces?.dispose();

  sintetizadorLuces = null;
  filtroLuces = null;
  reverbLuces = null;
}

// =====================================================
// 🌧️ INSTRUMENTO 4: LLUVIA
// =====================================================

export async function iniciarLluviaVisual() {
  if (sintetizadorLluvia) return;

  sintetizadorLluvia = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 3,
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0,
      release: 0.08
    },
    volume: -20
  }).toDestination();
}

export function reproducirLluviaVisual(datos) {
  if (!audioIniciado || !sintetizadorLluvia) return;

  cancelarPercusion();

  if (!datos?.disponible) {
    detenerLluviaVisual();
    return;
  }

  const caracteristicas = datos.caracteristicas ?? {};

  const nivel = limitar(caracteristicas.nivel);
  const cobertura = limitar(
    caracteristicas.cobertura_visual
  );

  // Intensidad visual -> más golpes
  const golpes = Math.max(
    1,
    Math.round(1 + nivel * 5)
  );

  // Intensidad visual -> golpes más próximos
  const intervalo = 380 - nivel * 240;

  // Cobertura visual -> fuerza de la percusión
  const velocidad = limitar(
    0.18 + cobertura * 0.38,
    0.1,
    0.65
  );

  for (let i = 0; i < golpes; i++) {
    const temporizador = setTimeout(() => {
      if (!audioIniciado || !sintetizadorLluvia) {
        return;
      }

      const frecuencia = 100 + nivel * 100 + (i % 2) * 15;

      sintetizadorLluvia.triggerAttackRelease(
        frecuencia,
        "32n",
        Tone.now(),
        velocidad
      );
    }, i * intervalo);

    temporizadoresLluvia.push(temporizador);
  }
}

export function detenerLluviaVisual() {
  cancelarPercusion();
  sintetizadorLluvia?.triggerRelease();
}

export function destruirLluviaVisual() {
  detenerLluviaVisual();

  sintetizadorLluvia?.dispose();
  sintetizadorLluvia = null;
}


// =====================================================
// 🌳 INSTRUMENTO 5: VEGETACIÓN
// =====================================================

let sintetizadorVegetacion = null;

const acordesVegetacion = [
  ["C4", "E4", "G4"],
  ["D4", "F4", "A4"],
  ["E4", "G4", "B4"],
  ["G4", "B4", "D5"]
];

export async function iniciarVegetacionVisual() {
  if (sintetizadorVegetacion) return;

  sintetizadorVegetacion = new Tone.PolySynth(
    Tone.Synth,
    {
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.8,
        decay: 0.5,
        sustain: 0.3,
        release: 2
      },
      volume: -25
    }
  ).toDestination();
}

export function reproducirVegetacionVisual(datos) {
  if (!audioIniciado || !sintetizadorVegetacion) return;

  if (!datos?.disponible) {
    detenerVegetacionVisual();
    return;
  }

  const nivel = limitar(
    datos.clasificacion?.nivel ?? 0
  );

  const indice = Math.min(
    acordesVegetacion.length - 1,
    Math.floor(nivel * acordesVegetacion.length)
  );

  sintetizadorVegetacion.volume.rampTo(
    -32 + nivel * 12,
    0.5
  );

  sintetizadorVegetacion.releaseAll();

  sintetizadorVegetacion.triggerAttackRelease(
    acordesVegetacion[indice],
    2.5,
    Tone.now() + 0.05,
    0.45
  );
}

export function detenerVegetacionVisual() {
  sintetizadorVegetacion?.releaseAll();
}

export function destruirVegetacionVisual() {
  detenerVegetacionVisual();
  sintetizadorVegetacion?.dispose();
  sintetizadorVegetacion = null;
}


// =====================================================
// CONTROL GENERAL DE LA ORQUESTA
// =====================================================

export async function iniciarAudio() {
  if (audioIniciado) return true;

  try {
    // Los navegadores requieren interacción del usuario.
    await Tone.start();

    await Promise.all([
      iniciarOceano(),
      iniciarVientoVisual(),
      iniciarLucesNocturnas(),
      iniciarLluviaVisual(),
      iniciarVegetacionVisual()
    ]);

    audioIniciado = true;

    console.log(
      "🎶 JAKEBOX: orquesta terrestre iniciada"
    );

    return true;
  } catch (error) {
    console.error(
      "No se pudo iniciar el audio de JAKEBOX:",
      error
    );

    return false;
  }
}

export function detenerAudio() {
  audioIniciado = false;

  detenerOceanoVisual();
  detenerVientoVisual();
  detenerLucesNocturnas();
  detenerLluviaVisual();
  detenerVegetacionVisual();

  console.log("🔇 JAKEBOX: audio detenido");
}

export function destruirAudio() {
  detenerAudio();

  destruirOceanoVisual();
  destruirVientoVisual();
  destruirLucesNocturnas();
  destruirLluviaVisual();
  destruirVegetacionVisual();

  console.log("🧹 JAKEBOX: instrumentos liberados");
}

// =====================================================
// PRUEBA DE AUDIO
// =====================================================

export async function probarSonido() {
  try {
    await iniciarAudio();

    if (!sintetizadorLuces) return;

    sintetizadorLuces.triggerAttackRelease(
      "C5",
      0.3,
      Tone.now() + 0.02,
      0.5
    );
  } catch (error) {
    console.error("Error probando el sonido:", error);
  }
}

// Compatibilidad con versiones anteriores
export function reproducirAtmosfera() {
  // Los sonidos se generan a partir de datos NASA.
}
