
import * as Tone from 'tone'

// ============================================
// JAKEBOX — MOTOR DE SONIFICACIÓN NASA
// Instrumentos:
// 1. Océano
// 2. Viento visual
// 3. Luces nocturnas
// ============================================

// ===== OCÉANO =====

let sintetizadorOceano = null
let filtroOceano = null
let reverbOceano = null
let volumenOceano = null
let inicioOceanoPendiente = null

// ===== VIENTO =====

let sintetizadorViento = null
let filtroViento = null
let paneoViento = null
let reverbViento = null
let volumenViento = null
let inicioVientoPendiente = null

// ===== LUCES NOCTURNAS =====

let sintetizadorLuces = null
let filtroLuces = null
let reverbLuces = null
let volumenLuces = null
let inicioLucesPendiente = null

// ============================================
// ESCALAS MUSICALES
// ============================================

// Todos los instrumentos utilizan notas
// compatibles de Do mayor pentatónico.

const notasOceano = [
  'C3', 'D3', 'E3', 'G3', 'A3'
]

const notasViento = [
  'C4', 'D4', 'E4', 'G4', 'A4'
]

const notasLuces = [
  'C5', 'E5', 'G5', 'A5', 'C6'
]

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.max(minimo, Math.min(maximo, valor))
}

function seleccionarNota(nivel, notas) {
  const indice = Math.round(
    limitar(nivel) * (notas.length - 1)
  )

  return notas[indice]
}

// ============================================
// 1. INICIAR OCÉANO
// ============================================

export async function iniciarOceano() {
  await Tone.start()

  if (sintetizadorOceano) return

  if (inicioOceanoPendiente) {
    return inicioOceanoPendiente
  }

  inicioOceanoPendiente = (async () => {
    volumenOceano = new Tone.Volume(-18)
      .toDestination()

    reverbOceano = new Tone.Reverb({
      decay: 4,
      preDelay: 0.05,
      wet: 0.4
    }).connect(volumenOceano)

    filtroOceano = new Tone.Filter({
      type: 'lowpass',
      frequency: 1100
    }).connect(reverbOceano)

    sintetizadorOceano = new Tone.Synth({
      oscillator: {
        type: 'fatsine',
        count: 2,
        spread: 10
      },
      envelope: {
        attack: 0.6,
        decay: 0.5,
        sustain: 0.7,
        release: 2.5
      }
    }).connect(filtroOceano)

    await reverbOceano.generate()

    console.log('🌊 Océano listo')
  })()

  try {
    await inicioOceanoPendiente
  } finally {
    inicioOceanoPendiente = null
  }
}

// ============================================
// 2. REPRODUCIR OCÉANO
// ============================================

export function reproducirOceanoVisual(datos) {
  if (!sintetizadorOceano) return

  if (
    !datos?.disponible ||
    !datos?.clasificacion
  ) {
    detenerOceanoVisual()
    return
  }

  const nivel = Number(
    datos.clasificacion.nivel
  )

  if (!Number.isFinite(nivel)) {
    detenerOceanoVisual()
    return
  }

  const intensidad = limitar(nivel)

  const nota = seleccionarNota(
    intensidad,
    notasOceano
  )

  const ahora = Tone.now()

  filtroOceano.frequency.rampTo(
    500 + intensidad * 1400,
    0.5
  )

  sintetizadorOceano.triggerRelease(ahora)

  sintetizadorOceano.triggerAttackRelease(
    nota,
    3,
    ahora + 0.06,
    0.6
  )

  console.log(
    '🌊 Océano:',
    '| Categoría:',
    datos.clasificacion.categoria,
    '| Nota:',
    nota
  )
}

// ============================================
// 3. DETENER Y DESTRUIR OCÉANO
// ============================================

export function detenerOceanoVisual() {
  sintetizadorOceano?.triggerRelease()
}

export function destruirOceanoVisual() {
  detenerOceanoVisual()

  sintetizadorOceano?.dispose()
  filtroOceano?.dispose()
  reverbOceano?.dispose()
  volumenOceano?.dispose()

  sintetizadorOceano = null
  filtroOceano = null
  reverbOceano = null
  volumenOceano = null
}

// ============================================
// 4. INICIAR VIENTO VISUAL
// ============================================

export async function iniciarVientoVisual() {
  await Tone.start()

  if (sintetizadorViento) return

  if (inicioVientoPendiente) {
    return inicioVientoPendiente
  }

  inicioVientoPendiente = (async () => {
    volumenViento = new Tone.Volume(-20)
      .toDestination()

    reverbViento = new Tone.Reverb({
      decay: 2.8,
      preDelay: 0.03,
      wet: 0.3
    }).connect(volumenViento)

    paneoViento = new Tone.Panner(0)
      .connect(reverbViento)

    filtroViento = new Tone.Filter({
      type: 'lowpass',
      frequency: 1500
    }).connect(paneoViento)

    sintetizadorViento = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.25,
        decay: 0.5,
        sustain: 0.55,
        release: 1.8
      }
    }).connect(filtroViento)

    await reverbViento.generate()

    console.log('💨 Viento visual listo')
  })()

  try {
    await inicioVientoPendiente
  } finally {
    inicioVientoPendiente = null
  }
}

// ============================================
// 5. REPRODUCIR VIENTO VISUAL
// ============================================

export function reproducirVientoVisual(datos) {
  if (!sintetizadorViento) return

  if (
    !datos?.disponible ||
    !datos?.caracteristicas
  ) {
    detenerVientoVisual()
    return
  }

  const tono = Number(
    datos.caracteristicas.tono
  )

  const saturacion = Number(
    datos.caracteristicas.saturacion
  )

  const brillo = Number(
    datos.caracteristicas.brillo
  )

  if (
    !Number.isFinite(tono) ||
    !Number.isFinite(saturacion) ||
    !Number.isFinite(brillo)
  ) {
    detenerVientoVisual()
    return
  }

  // Mapeo artístico del color.
  // No representa velocidad real en m/s.

  const intensidadVisual = limitar(
    (tono + saturacion) / 2
  )

  const nota = seleccionarNota(
    intensidadVisual,
    notasViento
  )

  const ahora = Tone.now()

  // Saturación = timbre brillante.
  filtroViento.frequency.rampTo(
    650 + limitar(saturacion) * 2000,
    0.4
  )

  // Tono = movimiento estéreo artístico.
  // No representa dirección geográfica.
  paneoViento.pan.rampTo(
    limitar(
      (tono - 0.5) * 1.2,
      -0.6,
      0.6
    ),
    0.5
  )

  // Brillo = pequeña variación de volumen.
  volumenViento.volume.rampTo(
    -25 + limitar(brillo) * 7,
    0.4
  )

  sintetizadorViento.triggerRelease(ahora)

  sintetizadorViento.triggerAttackRelease(
    nota,
    1.8,
    ahora + 0.06,
    0.55
  )

  console.log(
    '💨 Viento visual:',
    '| Nota:', nota,
    '| RGB:', datos.color,
    '| Nivel:', intensidadVisual.toFixed(2)
  )
}

// ============================================
// 6. DETENER Y DESTRUIR VIENTO
// ============================================

export function detenerVientoVisual() {
  sintetizadorViento?.triggerRelease()
}

export function destruirVientoVisual() {
  detenerVientoVisual()

  sintetizadorViento?.dispose()
  filtroViento?.dispose()
  paneoViento?.dispose()
  reverbViento?.dispose()
  volumenViento?.dispose()

  sintetizadorViento = null
  filtroViento = null
  paneoViento = null
  reverbViento = null
  volumenViento = null
}

// ============================================
// 7. INICIAR LUCES NOCTURNAS
// ============================================

export async function iniciarLucesNocturnas() {
  await Tone.start()

  if (sintetizadorLuces) return

  if (inicioLucesPendiente) {
    return inicioLucesPendiente
  }

  inicioLucesPendiente = (async () => {
    // Las campanas tendrán menos volumen
    // para no tapar los otros instrumentos.

    volumenLuces = new Tone.Volume(-22)
      .toDestination()

    reverbLuces = new Tone.Reverb({
      decay: 3.2,
      preDelay: 0.02,
      wet: 0.35
    }).connect(volumenLuces)

    filtroLuces = new Tone.Filter({
      type: 'lowpass',
      frequency: 2400
    }).connect(reverbLuces)

    sintetizadorLuces = new Tone.Synth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.35,
        sustain: 0.15,
        release: 1.4
      }
    }).connect(filtroLuces)

    await reverbLuces.generate()

    console.log('🌃 Luces nocturnas listas')
  })()

  try {
    await inicioLucesPendiente
  } finally {
    inicioLucesPendiente = null
  }
}

// ============================================
// 8. REPRODUCIR LUCES NOCTURNAS
// ============================================

export function reproducirLucesNocturnas(datos) {
  if (!sintetizadorLuces) return

  if (
    !datos?.disponible ||
    !datos?.caracteristicas
  ) {
    detenerLucesNocturnas()
    return
  }

  const brillo = Number(
    datos.caracteristicas.brillo
  )

  if (!Number.isFinite(brillo)) {
    detenerLucesNocturnas()
    return
  }

  const intensidad = limitar(brillo)

  const nota = seleccionarNota(
    intensidad,
    notasLuces
  )

  const ahora = Tone.now()

  // Más brillo = sonido más presente.
  filtroLuces.frequency.rampTo(
    1300 + intensidad * 2700,
    0.3
  )

  volumenLuces.volume.rampTo(
    -24 + intensidad * 9,
    0.3
  )

  sintetizadorLuces.triggerRelease(ahora)

  sintetizadorLuces.triggerAttackRelease(
    nota,
    1.2,
    ahora + 0.06,
    0.5
  )

  console.log(
    '🌃 Luces nocturnas:',
    '| Nota:', nota,
    '| Brillo:', brillo
  )
}

// ============================================
// 9. DETENER Y DESTRUIR LUCES
// ============================================

export function detenerLucesNocturnas() {
  sintetizadorLuces?.triggerRelease()
}

export function destruirLucesNocturnas() {
  detenerLucesNocturnas()

  sintetizadorLuces?.dispose()
  filtroLuces?.dispose()
  reverbLuces?.dispose()
  volumenLuces?.dispose()

  sintetizadorLuces = null
  filtroLuces = null
  reverbLuces = null
  volumenLuces = null
}

// ============================================
// 10. CONTROLES GENERALES DE JAKEBOX
// ============================================

export async function iniciarAudio() {
  await Tone.start()

  await Promise.all([
    iniciarOceano(),
    iniciarVientoVisual(),
    iniciarLucesNocturnas()
  ])

  console.log(
    '🎶 JAKEBOX: tres instrumentos iniciados'
  )
}

export function detenerAudio() {
  detenerOceanoVisual()
  detenerVientoVisual()
  detenerLucesNocturnas()
}

export function destruirAudio() {
  detenerAudio()

  destruirOceanoVisual()
  destruirVientoVisual()
  destruirLucesNocturnas()

  console.log(
    '🔇 Recursos de audio liberados'
  )
}

// ============================================
// 11. PRUEBA RÁPIDA DE AUDIO
// ============================================

export async function probarSonido() {
  await Tone.start()

  const prueba = new Tone.Synth({
    oscillator: {
      type: 'sine'
    }
  }).toDestination()

  prueba.triggerAttackRelease(
    'C5',
    0.5,
    Tone.now(),
    0.3
  )

  setTimeout(() => {
    prueba.dispose()
  }, 1500)
}

// ============================================
// 12. COMPATIBILIDAD CON CÓDIGO ANTIGUO
// ============================================

// Conservamos esta función para que un
// componente viejo no falle al importarla.
// Ya no utiliza los datos MERRA-2.

export function reproducirAtmosfera() {
  console.warn(
    'reproducirAtmosfera() está obsoleta. ' +
    'Utiliza reproducirVientoVisual().'
  )
}
