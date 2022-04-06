<template>
  <editor-content :editor="editor" />
</template>

<style lang="scss">
.ProseMirror {
  display: flex;
  outline: none;
  font-size: 20px;
  caret-color: transparent;

  .vim-cursor {
    &::after {
      content: attr(char);
      position: absolute;
      height: 20px;
      transform: translateY(4px);
      background: var(--cursor-background);
      color: transparent;
    }
  }
}
</style>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Vim } from '../extensions'

const editor = useEditor({
  content: '<p>I\'m running Tiptap with Vue.js. 🎉</p>',
  extensions: [ StarterKit, Vim ],
  autofocus: 'start'
})
</script>
