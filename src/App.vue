<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvas = ref(undefined as HTMLCanvasElement | undefined)

const handler: ProxyHandler<CanvasRenderingContext2D> = {
  get(target: CanvasRenderingContext2D, prop: keyof CanvasRenderingContext2D) {
    if (typeof target[prop] === 'function') {
      return function (...args) {
        console.log('calling', prop, '(', ...args, ')')
        return target[prop](...args)
      }
    }
    console.warn('retrieving non-function prop', prop)
    return target[prop]
  },
  set(target, prop, value) {
    console.log('setting', prop, '=', value)
    return (target[prop] = value)
  },
}

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const proxy = new Proxy(ctx, handler)

  proxy.moveTo(20, 20)
  proxy.lineTo(280, 280)
  proxy.strokeStyle = 'red'
  console.log(proxy.strokeStyle)
  proxy.stroke()
})
</script>

<template>
  <h1>Test</h1>
  <canvas ref="canvas" width="400" height="400" />
</template>

<style scoped></style>
