import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import InlineEquation from '../renderers/InlineEquation.svelte';
import { InputRule } from '@tiptap/core';


export const InlineEquationNode = Node.create({
  name: 'inlineEquation',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      formula: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'inline-equation',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'inline-equation-border' }, ['inline-equation', HTMLAttributes]];
  },

  addInputRules() {
    return [
      new InputRule({
        find: /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/, 
        handler: (props) => {
          const [, formula] = props.match;
          const node = this.type.create({ formula });
         
          props.state.tr.replaceWith(props.range.from, props.range.to, node);
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { from, to, empty } = editor.state.selection;
        const node = editor.state.selection.$from.nodeBefore;

        if (!empty || !node || node.type.name !== 'inlineEquation') return false;

        const formula = node.attrs.formula;
        const text = `$${formula}$`;

        editor
          .chain()
          .focus()
          .insertContentAt({ from: from - node.nodeSize, to }, text)
          .run();

        return true;
      },
    };
  },

  addNodeView() {
    return SvelteNodeViewRenderer(InlineEquation);
  },
  
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          const { formula } = node.attrs;
          state.write(`$${formula}$`);
        },
        parse: {
          inline: [
            {
              match: /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/,
              node: 'inlineEquation',
              getAttrs: (match) => ({
                formula: match[1].trim(),
              }),
            },
          ],
        },
      }
    }
  }
});