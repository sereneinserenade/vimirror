<script setup lang="ts">
import Tiptap from './components/Tiptap.vue'
import { useTitle } from '@vueuse/core'
import { onMounted } from 'vue';

onMounted(() => {
  const title = import.meta.env.MODE === 'development' ? 'Dev-Vimirror' : 'Vimirror'

  useTitle(title)
})
</script>

<template>
  <main class="flex container">
    <Tiptap />
  </main>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
