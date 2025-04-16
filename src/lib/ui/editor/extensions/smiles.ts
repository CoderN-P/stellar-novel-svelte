import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import Smiles from '../renderers/Smiles.svelte';
import { InputRule } from '@tiptap/core';

export const SmilesNode = Node.create({
  name: 'smiles',
  group: 'block',
  inline: false,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      smiles: {
        default: '',
        parseHTML: element => {
          if (!(element instanceof HTMLElement)) return '';
          return element.getAttribute('data-smiles') || '';
        },
        renderHTML: attributes => {
          return {
            'data-smiles': attributes.smiles
          };
        }
      },
      label: {
        default: '',
        parseHTML: element => {
          if (!(element instanceof HTMLElement)) return '';
          return element.getAttribute('data-label') || '';
        },
        renderHTML: attributes => {
          return {
            'data-label': attributes.label
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-smiles]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return {
            smiles: el.getAttribute('data-smiles') || '',
            label: el.getAttribute('data-label') || ''
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', {
      'data-smiles': HTMLAttributes.smiles,
      'data-label': HTMLAttributes.label,
      class: 'smiles-node'
    }, 0];
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[\[([^\]]+)\]\]$/,
        handler: ({ state, match, range }) => {
          
          const smiles = match[1].trim();

          const smilesNode = this.type.create({
            smiles,
            label: smiles
          });

          return state.tr.replaceWith(range.from, range.to, smilesNode);
        },
      }),
    ];
  },

  addCommands() {
    return {
      setSmiles: (smiles: string, label?: string) => ({ chain }) => {
        return chain()
          .updateAttributes('smiles', { smiles, label: label || smiles })
          .run();
      },
        
    };
  },

  addNodeView() {
    return SvelteNodeViewRenderer(Smiles);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const { smiles } = node.attrs;
          state.write(`[[${smiles}]]`);
        },
        parse: {
          setup(markdownit: any) {
            markdownit.inline.ruler.push('smiles', function(state: any, silent: boolean) {
              const start = state.pos;
              const max = state.posMax;
              const src = state.src;
              
              // Check if this is a SMILES pattern
              if (src.slice(start, start + 2) !== '[[') return false;
              
              // Find the end of the SMILES pattern
              let pos = start + 2;
              while (pos < max) {
                if (src.slice(pos, pos + 2) === ']]') {
                  // Found the end
                  if (silent) return true;
                  
                  // Extract the SMILES string
                  const smiles = src.slice(start + 2, pos);
                  
                  // Create the token
                  const token = state.push('smiles', '', 0);
                  token.attrs = {
                    smiles,
                    label: smiles
                  };
                  
                  // Update position
                  state.pos = pos + 2;
                  return true;
                }
                pos++;
              }
              
              return false;
            });
            
            markdownit.renderer.rules.smiles = (tokens: any, idx: number) => {
              const token = tokens[idx];
              const smiles = token.attrs?.smiles || '';
              return `<span data-smiles="${smiles}" class="smiles-node">${smiles}</span>`;
            };
            
            
          }
        }
      }
    };
  }
});