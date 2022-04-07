<template>
  <editor-content :editor="editor" />
</template>

<style lang="scss">
.ProseMirror {
  outline: none;
  font-size: 20px;
  caret-color: transparent;

  &[show-cursor="true"] {
    caret-color: var(--text-color);
  }

  &[mode="normal"] {
    .vim-cursor {
      &::before {
        content: attr(char);
        position: absolute;
        background: var(--cursor-background);
        color: var(--cursor-text);
      }
    }
  }

  &[mode="insert"] {
    .vim-cursor {
      &::before {
        content: " ";
        position: absolute;
        width: 2px;
        background: var(--cursor-background);
        animation: blink 1s step-start 0s infinite;
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
