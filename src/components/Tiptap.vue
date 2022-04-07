<template>
  <editor-content :editor="editor" />
</template>

<style lang="scss">
.ProseMirror {
  display: flex;
  outline: none;
  font-size: 20px;
  caret-color: transparent;

  &[mode="normal"] {
    .vim-cursor {
      &::after {
        content: attr(char);
        position: absolute;
        background: var(--cursor-background);
        color: black;
      }
    }
  }

  &[mode="insert"] {
    .vim-cursor {
      &::after {
        content: " ";
        position: absolute;
        margin: 0 1px;
        width: 2px;
        background: var(--cursor-background);
        color: transparent;
        animation: blink 0.75s step-start 0s infinite;
        animation-timing-function: linear;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Vim } from '../extensions'

const editor = useEditor({
  content: '<p> This is an  example of VIM mode in Tiptap/ProseMirror. How do you like the name btw? </p>',
  extensions: [StarterKit, Vim],
  autofocus: 'start'
})
</script>
