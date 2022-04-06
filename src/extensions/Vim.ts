import { Extension } from '@tiptap/vue-3'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey } from 'prosemirror-state'

let decorationSet: DecorationSet

enum VimMode {
  Normal = 'normal',
  Insert = 'insert',
  Visual = 'visual',
  Command = 'command',
  Replace = 'replace',
}

let mode : VimMode = VimMode.Normal

let cursorDecoration: Decoration

export const Vim = Extension.create({
  name: 'vim',

  addProseMirrorPlugins() {
    const extensionThis = this

    const vimPlugin = new Plugin({
      key: new PluginKey('vimPlugin'),

      props: {
        decorations(state) {
          return this.getState(state).decorationSet
        },
        attributes: {
          'vim-active': 'true'
        }
      },

      state: {
        init: (config, state) => {
          const { from, to } = state.selection

          cursorDecoration = Decoration.inline(from - 1, to , {
            class: 'vim-cursor'
          })

          decorationSet = DecorationSet.create(state.doc, [cursorDecoration])

          return { mode, decorationSet }
        },
        apply: (tr, value, oldState, newState) => {
          let { from, to } = newState.selection

          from = from - 1

          from = from === 0 ? 1 : from

          cursorDecoration = Decoration.inline(from, to, { class: 'vim-cursor', char: newState.doc.textBetween(from + 1, to + 1) })

          decorationSet = DecorationSet.create(newState.doc, [cursorDecoration])
          
          return { mode, decorationSet }
        }
      }
    })

    return [vimPlugin]
  }
})
