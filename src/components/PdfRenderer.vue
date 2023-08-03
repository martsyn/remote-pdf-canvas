<script setup lang="ts">
import { onMounted, ref } from 'vue'

import * as pdfLib from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.js?worker'
import wrapProxy from '@/wrapProxy'
import type { RenderParameters } from 'pdfjs-dist/types/src/display/api'

import pdfUrl from '@/assets/samplePdfWithImages.pdf?url'

const canvas = ref(undefined as HTMLCanvasElement | undefined)

let ctxResolve: ((ctx: CanvasRenderingContext2D) => void) | undefined = undefined
let ctxReject: ((reason: any) => void) | undefined = undefined

const ctxPromise = new Promise<CanvasRenderingContext2D>((resolve, reject) => {
  ctxResolve = resolve
  ctxReject = reject
})

onMounted(() => {
  if (!ctxResolve || !ctxReject) throw new Error('promises not working')
  if (!canvas.value) {
    ctxReject(new Error('canvas not set'))
    return
  }
  const ctx = canvas.value.getContext('2d')
  if (!ctx) {
    ctxReject(new Error('canvas 2d context cannot be initialized'))
    return
  }
  ctxResolve(ctx)
})

async function loadPdf() {
  pdfLib.GlobalWorkerOptions.workerPort = new PdfWorker()

  const pdf = await pdfLib.getDocument(pdfUrl).promise

  const [ctx, page] = await Promise.all([ctxPromise, pdf.getPage(1)])

  const scale = 2
  const viewport = page.getViewport({ scale: scale })
  // Support HiDPI-screens.
  const outputScale = window.devicePixelRatio ?? 1

  if (!canvas.value) throw 'not happening'

  canvas.value.width = Math.floor(viewport.width * outputScale)
  canvas.value.height = Math.floor(viewport.height * outputScale)
  canvas.value.style.width = Math.floor(viewport.width) + 'px'
  canvas.value.style.height = Math.floor(viewport.height) + 'px'

  const context = wrapProxy<CanvasRenderingContext2D>(ctx, {
    canvas: {
      width: canvas.value.width,
      height: canvas.value.height,
    },
  })

  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

  const renderContext: RenderParameters = {
    canvasContext: context,
    transform: transform,
    viewport: viewport,
  }
  page.render(renderContext)
}

loadPdf()
</script>

<template>
  <canvas ref="canvas" width="400" height="400" />
</template>

<style scoped></style>
