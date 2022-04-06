<template>
  <editor-content :editor="editor" />
</template>

<style lang="scss">
.ProseMirror {
  display: flex;
  outline: none;
  font-size: 20px;
}
</style>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
  extensions: [
    StarterKit,
  ],
})
</script>
