
<template>
  <div class="globe-container">

    <!-- PLANETA 3D -->
    <div ref="globeElement" class="globe"></div>

    <!-- CONTROLES DE AUDIO -->
    <div class="audio-controls">

      <button
        class="audio-button"
        @click="activarSonido"
      >
        {{ audioActivo
          ? '🔇 Desactivar sonido'
          : '🎵 Activar sonido' }}
      </button>

      <button
        class="test-button"
        @click="probarSonido"
      >
        🔊 Probar audio
      </button>

    </div>

    <!-- PANEL DE INFORMACIÓN NASA -->
    <div v-if="ubicacion" class="info-panel">

      <h2>🌍 Ubicación seleccionada</h2>

      <p>
        Latitud: {{ ubicacion.lat.toFixed(4) }}°
      </p>

      <p>
        Longitud: {{ ubicacion.lng.toFixed(4) }}°
      </p>

      <p v-if="cargando">
        Consultando imágenes NASA...
      </p>

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <!-- VIENTO -->
      <h3>💨 Viento</h3>

      <template v-if="vientoVisual">
        <template v-if="
          vientoVisual.disponible &&
          vientoVisual.caracteristicas
        ">
          <p>Análisis visual disponible</p>

          <p>
            Tono:
            {{ vientoVisual.caracteristicas.tono }}
          </p>

          <p>
            Saturación:
            {{ vientoVisual.caracteristicas.saturacion }}
          </p>

          <p>
            Brillo:
            {{ vientoVisual.caracteristicas.brillo }}
          </p>
        </template>

        <p v-else>
          Sin señal visual de viento.
        </p>
      </template>

      <p v-if="estadoViento">
        {{ estadoViento }}
      </p>

      <!-- OCÉANO -->
      <h3>🌊 Océano</h3>

      <template v-if="oceanoVisual">
        <template v-if="
          oceanoVisual.disponible &&
          oceanoVisual.clasificacion
        ">
          <p>
            Clasificación visual:
            {{ oceanoVisual.clasificacion.categoria }}
          </p>

          <p>
            Nivel sonoro:
            {{ oceanoVisual.clasificacion.nivel }}
          </p>
        </template>

        <p v-else>
          Sin señal oceánica en esta región.
        </p>
      </template>

      <p v-if="estadoOceano">
        {{ estadoOceano }}
      </p>

      <!-- LUCES NOCTURNAS -->
      <h3>🌃 Luces nocturnas</h3>

      <template v-if="lucesNocturnas">
        <template v-if="
          lucesNocturnas.disponible &&
          lucesNocturnas.caracteristicas
        ">
          <p>
            Brillo promedio:
            {{ lucesNocturnas.caracteristicas.brillo }}
          </p>

          <p>
            Brillo máximo:
            {{ lucesNocturnas.caracteristicas.brillo_maximo }}
          </p>

          <p>
            Píxeles iluminados:
            {{
              (
                lucesNocturnas.caracteristicas
                  .proporcion_iluminada * 100
              ).toFixed(1)
            }}%
          </p>
        </template>

        <p v-else>
          Sin señal de luces nocturnas.
        </p>
      </template>

      <p v-if="estadoLuces">
        {{ estadoLuces }}
      </p>

      <!-- LLUVIA -->
      <h3>🌧️ Lluvia</h3>

      <template v-if="lluviaVisual">
        <template v-if="lluviaVisual.disponible && lluviaVisual.caracteristicas">
          <p>Precipitación visual detectada</p>
          <p>Nivel musical: {{ lluviaVisual.caracteristicas.nivel }}</p>
          <p>
            Cobertura visual:
            {{ (lluviaVisual.caracteristicas.cobertura_visual * 100).toFixed(1) }}%
          </p>
        </template>
        <p v-else>Sin señal visual de lluvia.</p>
      </template>

      <p v-if="estadoLluvia">{{ estadoLluvia }}</p>

      <!-- VEGETACIÓN -->
      <h3>🌳 Vegetación</h3>

      <template v-if="vegetacionVisual">
        <template v-if="vegetacionVisual.disponible && vegetacionVisual.clasificacion">
          <p>
            Clasificación visual:
            {{ vegetacionVisual.clasificacion.categoria.replaceAll('_', ' ') }}
          </p>
          <p>
            Nivel musical:
            {{ vegetacionVisual.clasificacion.nivel }}
          </p>
          <p v-if="vegetacionVisual.caracteristicas">
            Cobertura verde:
            {{ (vegetacionVisual.caracteristicas.cobertura_verde * 100).toFixed(1) }}%
          </p>
        </template>
        <p v-else>Sin vegetación verde detectada en la imagen.</p>
      </template>

      <p v-if="estadoVegetacion">{{ estadoVegetacion }}</p>

      <!-- ESTADO DEL AUDIO -->
      <p class="audio-status">
        {{ audioActivo
          ? '🎶 Sonificación activada'
          : '🔇 Sonificación desactivada' }}
      </p>

    </div>

  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import Globe from 'globe.gl'
import axios from 'axios'

import {
  iniciarAudio,
  detenerAudio,
  destruirAudio,
  probarSonido,

  reproducirOceanoVisual,
  detenerOceanoVisual,

  reproducirVientoVisual,
  detenerVientoVisual,

  reproducirLucesNocturnas,
  detenerLucesNocturnas,

  reproducirLluviaVisual,
  detenerLluviaVisual,

  reproducirVegetacionVisual,
  detenerVegetacionVisual
} from '../audio/windAudio.js'

// ============================================
// VARIABLES REACTIVAS
// ============================================

const globeElement = ref(null)
const ubicacion = ref(null)

const oceanoVisual = ref(null)
const vientoVisual = ref(null)
const lucesNocturnas = ref(null)
const lluviaVisual = ref(null)
const vegetacionVisual = ref(null)

const estadoOceano = ref('')
const estadoViento = ref('')
const estadoLuces = ref('')
const estadoLluvia = ref('')
const estadoVegetacion = ref('')

const cargando = ref(false)
const error = ref('')
const audioActivo = ref(false)

// ============================================
// VARIABLES DEL GLOBO
// ============================================

let globo = null
let resizeObserver = null

let consultaActual = 0
let componenteActivo = true
let iniciandoAudio = false

const API = 'http://127.0.0.1:8000/api'

// ============================================
// ACTIVAR / DESACTIVAR SONIDO
// ============================================

async function activarSonido() {
  if (iniciandoAudio) return

  if (audioActivo.value) {
    audioActivo.value = false
    detenerAudio()

    console.log('🔇 Audio desactivado')
    return
  }

  iniciandoAudio = true

  try {
    // Inicia los cinco instrumentos.
    const iniciado = await iniciarAudio()
    if (!iniciado) throw new Error('No se pudo iniciar Tone.js')

    if (!componenteActivo) return

    audioActivo.value = true
    error.value = ''

    console.log(
      '🎶 JAKEBOX: cinco instrumentos activos'
    )

    // Reproducir los datos ya consultados.
    if (oceanoVisual.value?.disponible) {
      reproducirOceanoVisual(
        oceanoVisual.value
      )
    }

    if (vientoVisual.value?.disponible) {
      reproducirVientoVisual(
        vientoVisual.value
      )
    }

    if (lucesNocturnas.value?.disponible) {
      reproducirLucesNocturnas(
        lucesNocturnas.value
      )
    }

    if (lluviaVisual.value?.disponible) {
      reproducirLluviaVisual(lluviaVisual.value)
    }

    if (vegetacionVisual.value?.disponible) {
      reproducirVegetacionVisual(vegetacionVisual.value)
    }

  } catch (err) {
    console.error(
      'Error al activar audio:',
      err
    )

    audioActivo.value = false
    error.value = 'No se pudo activar el sonido.'

  } finally {
    iniciandoAudio = false
  }
}

// ============================================
// CONSULTAR OCÉANO
// ============================================

async function consultarOceanoVisual(
  lat,
  lng,
  idConsulta
) {
  try {
    const respuesta = await axios.get(
      `${API}/oceano-visual/`,
      {
        params: { lat, lon: lng }
      }
    )

    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    const datos = respuesta.data

    oceanoVisual.value = datos
    estadoOceano.value = ''

    console.log('🌊 Datos océano:', datos)

    if (!datos.disponible) {
      detenerOceanoVisual()
      return
    }

    if (audioActivo.value) {
      reproducirOceanoVisual(datos)
    }

  } catch (err) {
    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    console.error('Error océano:', err)

    estadoOceano.value =
      'No se pudo analizar el océano.'

    detenerOceanoVisual()
  }
}

// ============================================
// CONSULTAR VIENTO
// ============================================

async function consultarVientoVisual(
  lat,
  lng,
  idConsulta
) {
  try {
    const respuesta = await axios.get(
      `${API}/viento-visual/`,
      {
        params: { lat, lon: lng }
      }
    )

    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    const datos = respuesta.data

    vientoVisual.value = datos
    estadoViento.value = ''

    console.log('💨 Datos viento:', datos)

    if (!datos.disponible) {
      detenerVientoVisual()
      return
    }

    if (audioActivo.value) {
      reproducirVientoVisual(datos)
    }

  } catch (err) {
    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    console.error('Error viento:', err)

    estadoViento.value =
      'No se pudo analizar el viento.'

    detenerVientoVisual()
  }
}

// ============================================
// CONSULTAR LUCES NOCTURNAS
// ============================================

async function consultarLucesNocturnas(
  lat,
  lng,
  idConsulta
) {
  try {
    const respuesta = await axios.get(
      `${API}/luces-nocturnas/`,
      {
        params: { lat, lon: lng }
      }
    )

    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    const datos = respuesta.data

    lucesNocturnas.value = datos
    estadoLuces.value = ''

    console.log('🌃 Datos luces:', datos)

    if (!datos.disponible) {
      detenerLucesNocturnas()
      return
    }

    if (audioActivo.value) {
      reproducirLucesNocturnas(datos)
    }

  } catch (err) {
    if (
      !componenteActivo ||
      idConsulta !== consultaActual
    ) return

    console.error('Error luces nocturnas:', err)

    estadoLuces.value =
      'No se pudieron analizar las luces nocturnas.'

    detenerLucesNocturnas()
  }
}

// ============================================
// CONSULTAR LLUVIA
// ============================================

async function consultarLluviaVisual(lat, lng, idConsulta) {
  try {
    const respuesta = await axios.get(
      `${API}/lluvia-visual/`,
      { params: { lat, lon: lng } }
    )

    if (!componenteActivo || idConsulta !== consultaActual) return

    const datos = respuesta.data
    lluviaVisual.value = datos
    estadoLluvia.value = ''

    console.log('🌧️ Datos lluvia:', datos)

    if (!datos.disponible) {
      detenerLluviaVisual()
      return
    }

    if (audioActivo.value) {
      reproducirLluviaVisual(datos)
    }
  } catch (err) {
    if (!componenteActivo || idConsulta !== consultaActual) return

    console.error('Error lluvia:', err)
    estadoLluvia.value = 'No se pudo analizar la lluvia.'
    detenerLluviaVisual()
  }
}

// ============================================
// CONSULTAR VEGETACIÓN
// ============================================

async function consultarVegetacionVisual(lat, lng, idConsulta) {
  try {
    const respuesta = await axios.get(
      `${API}/vegetacion-visual/`,
      { params: { lat, lon: lng } }
    )

    if (!componenteActivo || idConsulta !== consultaActual) return

    const datos = respuesta.data
    vegetacionVisual.value = datos
    estadoVegetacion.value = ''

    console.log('🌳 Datos vegetación:', datos)

    if (!datos.disponible) {
      detenerVegetacionVisual()
      return
    }

    if (audioActivo.value) {
      reproducirVegetacionVisual(datos)
    }
  } catch (err) {
    if (!componenteActivo || idConsulta !== consultaActual) return

    console.error('Error vegetación:', err)
    estadoVegetacion.value = 'No se pudo analizar la vegetación.'
    detenerVegetacionVisual()
  }
}

// ============================================
// CONSULTAR LAS CINCO FUENTES NASA
// ============================================

async function consultarDatosNASA(lat, lng) {
  const idConsulta = ++consultaActual

  cargando.value = true
  error.value = ''

  oceanoVisual.value = null
  vientoVisual.value = null
  lucesNocturnas.value = null
  lluviaVisual.value = null
  vegetacionVisual.value = null

  estadoOceano.value = ''
  estadoViento.value = ''
  estadoLuces.value = ''
  estadoLluvia.value = ''
  estadoVegetacion.value = ''

  // Detener notas anteriores.
  detenerOceanoVisual()
  detenerVientoVisual()
  detenerLucesNocturnas()
  detenerLluviaVisual()
  detenerVegetacionVisual()

  console.log(
    '🌍 Consultando cinco fuentes NASA:',
    { lat, lng }
  )

  await Promise.allSettled([
    consultarOceanoVisual(
      lat, lng, idConsulta
    ),

    consultarVientoVisual(
      lat, lng, idConsulta
    ),

    consultarLucesNocturnas(
      lat, lng, idConsulta
    ),

    consultarLluviaVisual(
      lat, lng, idConsulta
    ),

    consultarVegetacionVisual(
      lat, lng, idConsulta
    )
  ])

  if (
    componenteActivo &&
    idConsulta === consultaActual
  ) {
    cargando.value = false
  }
}

// ============================================
// CREAR PLANETA 3D
// ============================================

onMounted(() => {
  componenteActivo = true

  const elemento = globeElement.value

  globo = new Globe(elemento)
    .globeImageUrl(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
    )
    .bumpImageUrl(
      'https://unpkg.com/three-globe/example/img/earth-topology.png'
    )
    .backgroundColor('#020617')
    .showAtmosphere(true)
    .atmosphereColor('#38bdf8')
    .atmosphereAltitude(0.18)

    .onGlobeClick(({ lat, lng }) => {
      ubicacion.value = { lat, lng }

      console.log(
        '📍 Ubicación seleccionada:',
        { lat, lng }
      )

      consultarDatosNASA(lat, lng)
    })

  // ROTACIÓN AUTOMÁTICA
  globo.controls().autoRotate = true
  globo.controls().autoRotateSpeed = 0.35

  // AJUSTAR TAMAÑO
  const ajustarTamano = () => {
    if (!globo || !elemento) return

    globo.width(elemento.clientWidth)
    globo.height(elemento.clientHeight)
  }

  resizeObserver = new ResizeObserver(
    ajustarTamano
  )

  resizeObserver.observe(elemento)

  ajustarTamano()
})

// ============================================
// LIMPIAR RECURSOS
// ============================================

onUnmounted(() => {
  componenteActivo = false
  consultaActual++

  audioActivo.value = false

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (globo) {
    globo.controls().autoRotate = false
    globo.pauseAnimation()
    globo = null
  }

  detenerAudio()
  destruirAudio()

  console.log(
    'JAKEBOX: recursos de audio liberados'
  )
})
</script>

<style scoped>
.globe-container {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 500px;
  overflow: hidden;
  background: #020617;
}

.globe {
  width: 100%;
  height: 100%;
}

/* CONTROLES DE AUDIO */
.audio-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-button,
.test-button {
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.audio-button {
  border: 1px solid #38bdf8;
  background: #0f172a;
}

.audio-button:hover {
  background: #1e293b;
}

.test-button {
  border: 1px solid #60a5fa;
  background: #2563eb;
}

.test-button:hover {
  background: #1d4ed8;
}

/* PANEL NASA */
.info-panel {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 10;
  width: 285px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid rgba(125, 211, 252, 0.25);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  font-family: Arial, sans-serif;
  backdrop-filter: blur(12px);
  pointer-events: none;
}

.info-panel h2 {
  margin: 0 0 14px;
  font-size: 18px;
}

.info-panel h3 {
  margin: 16px 0 10px;
  font-size: 15px;
  color: #7dd3fc;
}

.info-panel p {
  margin: 8px 0;
  font-size: 14px;
}

.audio-status {
  margin-top: 16px !important;
  color: #86efac;
}

.error {
  color: #fca5a5;
}
</style>
