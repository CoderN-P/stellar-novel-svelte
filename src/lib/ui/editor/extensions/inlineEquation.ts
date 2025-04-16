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
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return {
            formula: el.getAttribute('data-formula') || '',
          };
        },
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
          setup(markdownit) {
            markdownit.inline.ruler.before('emphasis', 'inline_equation', function (state, silent) {
              const start = state.pos;
              const max = state.posMax;

              if (state.src[start] !== '$') return false;

              // Find matching closing $
              let end = start + 1;
              while (end < max && state.src[end] !== '$') {
                end++;
              }

              if (end >= max) return false;
              const formula = state.src.slice(start + 1, end);

              if (silent) return true;

              const token = state.push('inline_equation', '', 0);
              token.content = formula;
              token.attrs = { formula };
              state.pos = end + 1;
              return true;
            });
            
            markdownit.renderer.rules.inline_equation = (tokens, idx) => {
              const token = tokens[idx];
              const formula = token.attrs?.formula || '';
              return `<inline-equation data-formula="${formula}"></inline-equation>`;
            };
          }
        },
      }
    }
  }
});