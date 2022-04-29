<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

import { Vim, defaultKeymap } from '../extensions'
import { editorStateMock } from '../mocks'

const editor = useEditor({
  content: editorStateMock,
  extensions: [StarterKit, Vim],
  autofocus: 'start',
})

const copyEditorJson = () => navigator.clipboard.writeText(JSON.stringify(editor.value?.getJSON()))

const supportedCommands = defaultKeymap.map((val) => val.keys).join(', ')
</script>

<template>
  <section class="tiptap-container flex flex-col gap-1em">
    <section class="menubar">
      <button class="pure-button pure-button-primary" @click="copyEditorJson">
        Copy editor JSON
      </button>
    </section>

    <editor-content class="editor-content" :editor="editor" />

    <section class="supported-commands-container flex flex-col">

      <h2> List of Supported Commands </h2>

      <span class="supported-commands"> {{ supportedCommands }} </span>
    </section>
  </section>
</template>

<style lang="scss">
.tiptap-container {
  margin: 1em 0 0 0;

  .editor-content {
    padding: 1em;
    margin: 1em 0;
    border-radius: 20px;
    border-left: 1px solid white;
    border-top: 1px solid white;
    border-right: 8px solid white;
    border-bottom: 8px solid white;
    width: 100%;
    max-width: 100%;

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
  }

  .supported-commands-container {

    .supported-commands {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 600;
      font-size: 1.1em;
    }
  }
}
</style>
