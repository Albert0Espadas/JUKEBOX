
<template>
  <div class="globe-container">

    <!-- Planeta 3D -->
    <div ref="globeElement" class="globe"></div>

    <!-- Controles de audio -->
    <div class="audio-controls">

      <button
        class="audio-button"
        @click="activarSonido"
      >
        {{ audioActivo
          ? ' Desactivar sonido'
          : ' Activar sonido' }}
      </button>

      <button
        class="test-button"
        @click="probarSonido"
      >
         Probar audio
      </button>

    </div>

    <!-- Panel de información NASA -->
    <div v-if="ubicacion" class="info-panel">

      <h2> Ubicación seleccionada</h2>

      <p>
        Latitud:
        {{ ubicacion.lat.toFixed(4) }}°
      </p>

      <p>
        Longitud:
        {{ ubicacion.lng.toFixed(4) }}°
      </p>

      <p v-if="cargando">
        Consultando datos NASA...
      </p>

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <template v-if="viento">

        <h3> Datos del viento</h3>

        <p>
          Velocidad:
          {{ viento.velocidad }} m/s
        </p>

        <p>
          Componente U:
          {{ viento.u }} m/s
        </p>

        <p>
          Componente V:
          {{ viento.v }} m/s
        </p>

        <p class="audio-status">
          {{ audioActivo
            ? ' Sonificación activada'
            : ' Sonificación desactivada' }}
        </p>

      </template>

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
  reproducirViento,
  detenerAudio,
  destruirAudio,
  probarSonido
} from '../audio/windAudio.js'

// Variables reactivas
const globeElement = ref(null)
const ubicacion = ref(null)
const viento = ref(null)
const cargando = ref(false)
const error = ref('')
const audioActivo = ref(false)

// Variables del globo
let globo = null
let resizeObserver = null
let consultaActual = 0

// Activar o desactivar la sonificación
async function activarSonido() {
  try {
    if (audioActivo.value) {
      detenerAudio()
      audioActivo.value = false
      return
    }

    await iniciarAudio()

    audioActivo.value = true

    console.log('Audio de JAKEBOX activado')

    if (viento.value) {
      reproducirViento(viento.value)
    }

  } catch (err) {
    console.error('Error al activar sonido:', err)
    error.value = 'No se pudo activar el audio.'
  }
}

// Consultar viento en la API Django
async function consultarViento(lat, lng) {
  const idConsulta = ++consultaActual

  cargando.value = true
  viento.value = null
  error.value = ''

  try {
    const respuesta = await axios.get(
      'http://127.0.0.1:8000/api/viento/',
      {
        params: {
          lat: lat,
          lon: lng
        }
      }
    )

    // Ignorar respuestas antiguas
    if (idConsulta !== consultaActual) return

    viento.value = respuesta.data.viento

    console.log('Datos NASA recibidos:', viento.value)

    // Reproducir solamente si está activado
    if (audioActivo.value) {
      reproducirViento(viento.value)
    }

  } catch (err) {
    if (idConsulta !== consultaActual) return

    console.error('Error al consultar NASA:', err)

    error.value =
      err.response?.data?.error ||
      'No se pudieron obtener los datos del viento.'

  } finally {
    if (idConsulta === consultaActual) {
      cargando.value = false
    }
  }
}

// Crear el globo terráqueo
onMounted(() => {
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
        'Coordenadas seleccionadas:',
        lat,
        lng
      )

      consultarViento(lat, lng)
    })

  // Rotación automática
  globo.controls().autoRotate = true
  globo.controls().autoRotateSpeed = 0.35

  // Ajustar el tamaño de la pantalla
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

// Limpiar recursos cuando Vue retire el componente
onUnmounted(() => {
  consultaActual++

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (globo) {
    globo.controls().autoRotate = false
    globo.pauseAnimation()
    globo = null
  }

  // Estas funciones deben estar AQUÍ
  detenerAudio()
  destruirAudio()
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

.info-panel {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 10;
  width: 280px;
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

