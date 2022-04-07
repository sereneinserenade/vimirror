import { Extension } from '@tiptap/vue-3'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Node as PMNode } from 'prosemirror-model'
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
    },
    history: {
      /**
       * Undo recent changes
       */
      undo: () => ReturnType,
      /**
       * Reapply reverted changes
       */
      redo: () => ReturnType,
    }

  }
}

export const Vim = Extension.create({
  name: 'vim',

  addProseMirrorPlugins() {
    const { editor } = this

    const vimModesPlugin = new Plugin({
      key: new PluginKey('vimPlugin'),

      props: {
        decorations(state) {
          return this.getState(state).decorationSet
        },
        attributes() {
          return {
            'vim-active': 'true',
            'mode': mode
          }
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

          cursorDecoration = Decoration.inline(from, to, {
            class: 'vim-cursor',
            char: state.doc.textBetween(from + 1, to + 2)
          })

          decorationSet = DecorationSet.create(state.doc, [cursorDecoration])

          return { mode, decorationSet }
        },
        apply: (tr, value, oldState, newState) => {
          let { from, to } = newState.selection

          console.log('-----------------')

          console.log(from, to)

          // from = from - 1

          // from = from === 0 ? 1 : from

          console.log(from, to)

          console.log('-----------------')

          cursorDecoration = Decoration.inline(from, to + 1, {
            class: 'vim-cursor',
            char: newState.doc.textBetween(from, to + 1)
          })

          const changeModeTo: VimModes = tr.getMeta(TransactionMeta.ChangeModeTo)

          if (VimModesList.includes(changeModeTo)) {
            mode = changeModeTo
            console.log('newMode:- ', mode)
          }

          decorationSet = DecorationSet.create(newState.doc, [cursorDecoration])

          console.log(decorationSet);
          

          return { mode, decorationSet }
        },
      },
    })

    const vimKeyMapPlugin = keymap({
      'Escape': (state, dispatch, view) => {
        if (!dispatch) return false

        dispatch(state.tr.setMeta(TransactionMeta.ChangeModeTo, VimModes.Normal))

        return true
      },

      'i': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        dispatch(state.tr.setMeta(TransactionMeta.ChangeModeTo, VimModes.Insert))

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
          // TODO: go down
          return true
        }

        return false
      },
      'k': (state, dispatch, view) => {
        if (!dispatch) return false

        const modesOfK = [VimModes.Normal, VimModes.Visual, VimModes.Command]
        
        if (modesOfK.includes(mode)) {
          // TODO: go up
          return true
        }

        return false
      },

      'w': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        const { doc, selection } = state

        const { from, to } = selection

        if (from !== to) return false

        const nodeWithPos = {
          node: undefined,
          pos: 0,
          to: 0
        } as { node?: PMNode, pos: number, to: number }

        doc.descendants((node, pos, parent) => {
          if (!node.isBlock || nodeWithPos.node) return

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize]

          if ((nodeFrom <= from) && (from <= nodeTo)) {
            nodeWithPos.node = node
            nodeWithPos.pos = pos
            nodeWithPos.to = nodeTo
          }
        })

        const content = nodeWithPos.node?.textContent

        if (!content) throw new Error('If theres no content, where the hell are you pressing the W from?')

        const inlineSelectionIndex = from - nodeWithPos.pos

        let foundSpace = false
        let indexToJump: number | undefined = undefined

        for(let i = inlineSelectionIndex; i < nodeWithPos.to; i += 1) {
          const currentChar = content[i]

          if (currentChar === ' ') foundSpace = true

          if (foundSpace && currentChar !== ' ') {
            indexToJump = i + 1
            break // breaking since we already found the index we want to jump to
          }
        }

        if (!indexToJump) return false

        const newPos = doc.resolve( nodeWithPos.pos + indexToJump)

        const newSelection = new TextSelection(newPos, newPos)

        dispatch(state.tr.setSelection(newSelection))

        return true
      },

      'b': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        const { doc, selection } = state

        const { from, to } = selection

        if (from !== to) return false

        const nodeWithPos = {
          node: undefined,
          pos: 0,
          to: 0
        } as { node?: PMNode, pos: number, to: number }

        doc.descendants((node, pos, parent) => {
          if (!node.isBlock || nodeWithPos.node) return

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize]

          if ((nodeFrom <= from) && (from <= nodeTo)) {
            nodeWithPos.node = node
            nodeWithPos.pos = pos
            nodeWithPos.to = nodeTo
          }
        })

        const content = nodeWithPos.node?.textContent

        if (!content) throw new Error('If theres no content, where the hell are you pressing the "b" from?')

        const inlineSelectionIndex = from - nodeWithPos.pos

        let foundSpace = false
        let indexToJump: number | undefined = undefined

        for(let i = inlineSelectionIndex - 3; i > 0; i -= 1) {
          const currentChar = content[i]

          if (currentChar === ' ') foundSpace = true

          if (currentChar === ' ' && content[i + 1] !== ' ') {
            indexToJump = i + 1
            break // breaking since we already found the index we want to jump to
          }
        }

        if (!indexToJump) return false

        const newPos = doc.resolve(nodeWithPos.pos + indexToJump + 1)

        const newSelection = new TextSelection(newPos, newPos)

        dispatch(state.tr.setSelection(newSelection))

        return true
      },

      'I': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        const { doc, selection } = state

        const { from, to } = selection

        if (from !== to) return false

        const nodeWithPos = {
          node: undefined,
          pos: 0,
          to: 0
        } as { node?: PMNode, pos: number, to: number }

        doc.descendants((node, pos, parent) => {
          if (!node.isBlock || nodeWithPos.node) return

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize]

          if ((nodeFrom <= from) && (from <= nodeTo)) {
            nodeWithPos.node = node
            nodeWithPos.pos = pos
            nodeWithPos.to = nodeTo
          }
        })

        const newPos = doc.resolve(nodeWithPos.pos + 1)

        const newSelection = new TextSelection(newPos, newPos)

        const tr = state.tr.setSelection(newSelection)
        tr.setMeta(TransactionMeta.ChangeModeTo, VimModes.Insert)

        dispatch(tr)

        return true
      },

      // undo
      'u': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        editor.commands.undo?.()

        return true
      },

      // redo
      'Ctrl-r': (state, dispatch, view) => {
        if (mode === VimModes.Insert || !dispatch) return false

        editor.commands.redo?.()

        return true
      }
    })

    return [vimModesPlugin, vimKeyMapPlugin]
  },

  addCommands() {
    return {
      // getMode: () => () => mode
    }
  }
})
