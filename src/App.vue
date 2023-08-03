<template>
  <h1>pdfProxy</h1>
  <Suspense>
    <template #default>
      <PdfRenderer />
    </template>
    <template #fallback>Loading...</template>
  </Suspense>
</template>
<script setup lang="ts">
import PdfRenderer from '@/components/PdfRenderer.vue'
</script>
