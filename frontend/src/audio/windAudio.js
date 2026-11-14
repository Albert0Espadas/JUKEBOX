
import * as Tone from 'tone'

let sintetizador = null
let filtro = null
let paneo = null
let volumen = null

// Iniciar el sistema de audio
export async function iniciarAudio() {
  await Tone.start()

  console.log('Estado de Tone.js:', Tone.getContext().state)

  if (sintetizador) return

  volumen = new Tone.Volume(-8).toDestination()

  paneo = new Tone.Panner(0).connect(volumen)

  filtro = new Tone.Filter({
    frequency: 1800,
    type: 'lowpass',
    rolloff: -12
  }).connect(paneo)

  sintetizador = new Tone.Synth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.03,
      decay: 0.2,
      sustain: 0.7,
      release: 0.8
    }
  }).connect(filtro)

  console.log('Motor de audio JAKEBOX iniciado')
}

// Probar Tone.js sin consultar NASA
export async function probarSonido() {
  try {
    await Tone.start()

    const prueba = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5
      }
    }).toDestination()

    prueba.triggerAttackRelease(
      'C5',
      1,
      Tone.now(),
      0.7
    )

    console.log('Nota de prueba reproducida')

    setTimeout(() => {
      prueba.dispose()
    }, 2500)

  } catch (error) {
    console.error('Error en la prueba de audio:', error)
  }
}

// Convertir datos NASA en sonido
export function reproducirViento(datos) {
  if (!sintetizador) {
    console.warn('Primero debes activar el audio')
    return
  }

  const { u, v, velocidad } = datos

  console.log('Sonificando viento NASA:', datos)

  const intensidad = Math.min(
    Math.max(velocidad, 0),
    30
  )

  // Velocidad del viento -> frecuencia
  const frecuenciaBase = 180 + intensidad * 12

  // Componente V -> variación de frecuencia
  const frecuenciaFinal = Math.max(
    80,
    frecuenciaBase + v * 3
  )

  // Intensidad -> brillo
  const brillo = 600 + intensidad * 100

  // Componente U -> posición estéreo
  const posicion = Math.max(
    -1,
    Math.min(1, u / 20)
  )

  filtro.frequency.rampTo(brillo, 0.3)
  paneo.pan.rampTo(posicion, 0.3)
  volumen.volume.rampTo(
    -10 + intensidad * 0.15,
    0.3
  )

  // Evitar conflictos entre notas consecutivas
  sintetizador.triggerRelease(Tone.now())

  const inicio = Tone.now() + 0.05

  sintetizador.triggerAttackRelease(
    frecuenciaFinal,
    1.5,
    inicio,
    0.8
  )

  console.log(
    'Frecuencia musical:',
    frecuenciaFinal.toFixed(2),
    'Hz'
  )
}

// Detener sonido
export function detenerAudio() {
  if (sintetizador) {
    sintetizador.triggerRelease()
  }
}

// Liberar recursos
export function destruirAudio() {
  sintetizador?.dispose()
  filtro?.dispose()
  paneo?.dispose()
  volumen?.dispose()

  sintetizador = null
  filtro = null
  paneo = null
  volumen = null
}


