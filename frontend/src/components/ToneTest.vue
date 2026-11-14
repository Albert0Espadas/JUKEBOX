
<script setup>
import { ref, onUnmounted } from 'vue'
import * as Tone from 'tone'

const reproduciendo = ref(false)

let synth = null
let secuencia = null

async function reproducir() {
  if (reproduciendo.value) return

  // Los navegadores requieren una interacción
  // del usuario para activar el audio.
  await Tone.start()

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.4,
      release: 1.2
    }
  }).toDestination()

  const notas = [
    'C4', 'E4', 'G4', 'B4',
    'A4', 'G4', 'E4', 'C4'
  ]

  secuencia = new Tone.Sequence(
    (time, nota) => {
      synth.triggerAttackRelease(nota, '8n', time)
    },
    notas,
    '4n'
  )

  Tone.getTransport().bpm.value = 100
  secuencia.start(0)
  Tone.getTransport().start()

  reproduciendo.value = true
}

function detener() {
  secuencia?.stop()
  secuencia?.dispose()
  secuencia = null

  Tone.getTransport().stop()
  Tone.getTransport().cancel()

  synth?.releaseAll()
  synth?.dispose()
  synth = null

  reproduciendo.value = false
}

onUnmounted(() => {
  detener()
})
</script>

<template>
  <div class="tone-test">
    <h2> JAKEBOX - Prueba de sonido</h2>

    <p>
      Nuestra primera melodía generada con Tone.js
    </p>

    <button
      v-if="!reproduciendo"
      @click="reproducir"
    >
      ▶ Reproducir música
    </button>

    <button
      v-else
      @click="detener"
    >
      ⏹ Detener música
    </button>

    <p v-if="reproduciendo">
       La Tierra está sonando...
    </p>
  </div>
</template>

<style scoped>
.tone-test {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #0b1120;
  color: white;
  text-align: center;
  border-radius: 16px;
}

button {
  background: #2563eb;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #1d4ed8;
}
</style>
