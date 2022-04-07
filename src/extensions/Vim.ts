import { Extension } from '@tiptap/vue-3'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { keymap, keydownHandler } from 'prosemirror-keymap'

let decorationSet: DecorationSet

enum VimModes {
  Normal = 'normal',
  Insert = 'insert',
  Visual = 'visual',
  Command = 'command',
  Replace = 'replace',
}

const VimModesList = [VimModes.Normal, VimModes.Insert, VimModes.Visual, VimModes.Command, VimModes.Replace]

enum TransactionMeta {
  ChangeModeTo = 'changeModeTo',
}

let mode: VimModes = VimModes.Normal

let cursorDecoration: Decoration

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vim: {
      /**
       * Example Command description.
       */
      // exampleCommand: () => ReturnType,
    }
  }
}

export const Vim = Extension.create({
  name: 'vim',

  addProseMirrorPlugins() {
    const extensionThis = this

    const vimModesPlugin = new Plugin({
      key: new PluginKey('vimPlugin'),

      props: {
        decorations(state) {
          return this.getState(state).decorationSet
        },
        attributes: {
          'vim-active': 'true'
        },
        handleDOMEvents: {
          keypress: (view, event) => {
            if (mode !== VimModes.Insert) event.preventDefault()

            return true

            // if (event.key === 'i') mode = VimModes.Insert

            // debugger
            // if (event.key === 'Escape') mode = VimModes.Normal

            // event.stopImmediatePropagation()
            // event.stopPropagation()

            // if (mode === VimModes.Insert) {
            //   return false
            // }

            // return false
          },
        }
      },

      state: {
        init: (config, state) => {
          const { from, to } = state.selection

          cursorDecoration = Decoration.inline(from - 1, to, {
            class: 'vim-cursor'
          })

          decorationSet = DecorationSet.create(state.doc, [cursorDecoration])

          return { mode, decorationSet }
        },
        apply: (tr, value, oldState, newState) => {
          let { from, to } = newState.selection

          from = from - 1

          from = from === 0 ? 1 : from

          cursorDecoration = Decoration.inline(from, to, {
            class: 'vim-cursor',
            char: newState.doc.textBetween(from + 1, to + 1)
          })

          const changeModeTo: VimModes = tr.getMeta(TransactionMeta.ChangeModeTo)

          if (VimModesList.includes(changeModeTo)) {
            mode = changeModeTo
            console.log('newMode:- ', mode)
          }

          decorationSet = DecorationSet.create(newState.doc, [cursorDecoration])

          return { mode, decorationSet }
        },
      },
    })

    const vimKeyMapPlugin = keymap({
      // enter insert mode
      'i': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        dispatch(state.tr.setMeta(TransactionMeta.ChangeModeTo, VimModes.Insert))

        return true
      },
      'Escape': (state, dispatch, view) => {
        if (!dispatch) return false

        dispatch(state.tr.setMeta(TransactionMeta.ChangeModeTo, VimModes.Normal))

        return true
      },
      'h': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        const { doc } = state

        const { from, to} = state.selection

        const [$from, $to] = [doc.resolve(from - 1), doc.resolve(to - 1)]

        const selection = new TextSelection($from, $to)

        dispatch(state.tr.setSelection(selection))

        return true
      },
      'l': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        const { doc } = state

        const { from, to} = state.selection

        const [$from, $to] = [doc.resolve(from + 1), doc.resolve(to + 1)]

        const selection = new TextSelection($from, $to)

        dispatch(state.tr.setSelection(selection))

        return true
      },
      'j': (state, dispatch, view) => {
        if (!dispatch) return false

        const modesOfJ = [VimModes.Normal, VimModes.Visual, VimModes.Command]
        
        if (modesOfJ.includes(mode)) {
          // Go down
          return true
        }

        return false
      },

    })

    return [vimModesPlugin, vimKeyMapPlugin]
  },

  addCommands() {
    return {
      // getMode: () => () => mode
    }
  }
})
