import { Node } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'
import VocabularyTerm from '../renderers/Vocabulary.svelte'
import { InputRule } from '@tiptap/core';

const vocabInputRule = (type) =>
  new InputRule({
    find: /\|([^:|]+):\s?([^|]+)\|$/, 
    handler: ({ state, match, range }) => {
      const [, term, definition] = match;
    
      const node = type.create({
        term: term.trim(),
        definition: definition.trim()
      });
    
      const tr = state.tr.replaceRangeWith(range.from, range.to, node);
  }
});

export const VocabularyNode = Node.create({
  name: 'vocabularyTerm',

  group: 'inline',
  inline: true,
  selectable: true,

  addAttributes() {
    return {
      term: {
        default: ''
      },
      definition: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-vocabulary-term]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return {
            term: el.getAttribute('data-term') || '',
            definition: el.getAttribute('data-definition') || '',
          };
        },
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', {
      'data-vocabulary-term': '',
      'data-term': HTMLAttributes.term,
      'data-definition': HTMLAttributes.definition,
    }, 0]
  },

  addCommands() {
    return {
      insertVocabularyNode: definition => ({ chain, state }) => {
        const { from, to } = state.selection
        const text = state.doc.textBetween(from, to)
        

        if (text) {
          return chain()
            .focus()
            .command(({ tr }) => {
              tr.replaceWith(
                from,
                to,
                this.type.create({ definition, term: text })
              )
              return true
            })
            .run()
        }

        return false
      },

      deleteNodeAtSelection: () => ({ chain, state }) => {
        const { from } = state.selection
        const node = state.selection.$from.nodeAfter
        if (node?.type.name !== 'vocabularyTerm') return false

        return chain()
          .focus()
          .deleteRange({ from, to: from + node.nodeSize })
          .run()
      }
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(VocabularyTerm)
  },
  
  addInputRules() {
    return [
      vocabInputRule(this.type)
    ]
  },
  
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          const { term, definition } = node.attrs;
          state.write(`|${term}: ${definition}|`);
        },
        parse: {
          setup(markdownit) {
            markdownit.inline.ruler.before('text', 'vocabulary', function(state, silent) {
              const start = state.pos;
              const max = state.posMax;

              if (state.src.charAt(start) !== '|') return false;
              let end = start + 1;
              while (end < max) {
                if (state.src[end] === '|' && state.src[end - 1] !== '\\') break;
                end++;
              }
              if (end >= max) return false;

              const content = state.src.slice(start + 1, end);
              if (!content.includes(':')) return false;

              const [termRaw, ...definitionParts] = content.split(':');
              const term = termRaw.trim();
              const definition = definitionParts.join(':').trim();

              if (!term || !definition) return false;

              if (!silent) {
                const token = state.push('vocabulary', '', 0);
                token.content = term;
                token.meta = { definition };
              }

              state.pos = end + 1;
              return true;
            });

            markdownit.renderer.rules.vocabulary = function(tokens, idx) {
              const token = tokens[idx];
              const term = token.content;
              const def = token.meta.definition;
              return `<span data-vocabulary-term data-term="${term}" data-definition="${def}">${term}</span>`;
            };
          },
          updateDOM(el){
            console.log(el);
          }
        },
        
      }
    }
  },
})