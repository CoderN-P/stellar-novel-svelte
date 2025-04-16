import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import Question from '../renderers/Question.svelte';
import { InputRule } from '@tiptap/core';

export const QuestionNode = Node.create({
  name: 'question',
  group: 'block',
  content: 'block+',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      options: {
        default: [],
        parseHTML: element => {
          const optionsAttr = element.getAttribute('data-options');
          return optionsAttr ? JSON.parse(optionsAttr) : [];
        },
        renderHTML: attributes => {
          return {
            'data-options': JSON.stringify(attributes.options)
          };
        }
      },
      correctOption: {
        default: '',
        parseHTML: element => element.getAttribute('data-correct-option') || '',
        renderHTML: attributes => {
          return {
            'data-correct-option': attributes.correctOption
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-question]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          return {
            options: JSON.parse(el.getAttribute('data-options') || '[]'),
            correctOption: el.getAttribute('data-correct-option') || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', {
      'data-question': '',
      'data-options': JSON.stringify(HTMLAttributes.options),
      'data-correct-option': HTMLAttributes.correctOption,
    }, 0];
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^::\?$/,
        handler: ({ state, range }) => {
          const { from, to } = range;
          const questionNode = this.type.create({
            options: [],
            correctOption: '',
          });
          
          
          
          
          tr.replaceSelectionWith(questionNode);
          return tr;
        },
      }),
    ];
  },

  addCommands() {
    return {
      setQuestionOptions: (options: any[]) => ({ chain }) => {
        return chain()
          .updateAttributes('question', { options })
          .run();
      },
      setCorrectOption: (correctOption: string) => ({ chain }) => {
        return chain()
          .updateAttributes('question', { correctOption })
          .run();
      },
    };
  },

  addNodeView() {
    return SvelteNodeViewRenderer(Question);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const { options, correctOption } = node.attrs;
          
          // Start the question block
          state.write('::?\n');
          
          // Write options if they exist
          if (options && options.length > 0) {
            // Extract text from each option
            const optionTexts = options.map((option: any) => {
              if (option && option.content && option.content[0]) {
                return option.content[0].text || '';
              }
              return '';
            });
            
            state.write(optionTexts.join(' | ') + '\n');
          }
          
          // Write correct option as a letter (A, B, C, etc.)
          if (correctOption) {
            // Find the index of the correct option
            const correctOptionIndex = options.findIndex((opt: any) => 
              JSON.stringify(opt) === correctOption
            );
            
            if (correctOptionIndex >= 0) {
              // Convert index to letter (0 = A, 1 = B, etc.)
              const correctOptionLetter = String.fromCharCode(65 + correctOptionIndex);
              state.write(correctOptionLetter + '\n');
            }
          }
          
          // Write content
          state.renderContent(node);
          
          // End the question block
          state.write('\n::?');
        },
        parse: {
          setup(markdownit: any) {
            markdownit.block.ruler.before('paragraph', 'question', function(state: any, startLine: number, endLine: number, silent: boolean) {
              const start = state.bMarks[startLine] + state.tShift[startLine];
              const max = state.eMarks[startLine];
              const line = state.src.slice(start, max);
              
              // Check if this is the start of a question block
              if (line.trim() !== '::?') return false;
              
              // Find the end of the question block
              let nextLine = startLine + 1;
              let endingLine = startLine;
              
              while (nextLine < endLine) {
                const nextStart = state.bMarks[nextLine] + state.tShift[nextLine];
                const nextMax = state.eMarks[nextLine];
                const nextLineText = state.src.slice(nextStart, nextMax);
                
                if (nextLineText.trim() === '::?') {
                  endingLine = nextLine;
                  break;
                }
                
                nextLine++;
              }
              
              if (endingLine === startLine) return false;
              
              if (silent) return true;
              
              // Parse the question content
              const content = state.src.slice(
                state.bMarks[startLine + 1],
                state.eMarks[endingLine - 1]
              );
              
              // Split the content into lines
              const lines = content.split('\n');
              
              // Extract options and correct option
              let options = [];
              let correctOption = '';
              let contentStartLine = startLine + 1;
              
              if (lines.length >= 1) {
                const optionsLine = lines[0].trim();
                if (optionsLine.includes('|')) {
                  // Create rich text options from the text
                  options = optionsLine.split('|').map((opt: string) => ({
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: opt.trim()
                      }
                    ]
                  }));
                  contentStartLine++;
                }
              }
              
              if (lines.length >= 2) {
                const correctOptionLine = lines[1].trim();
                if (correctOptionLine) {
                  // Check if the correct option is a single letter (A, B, C, etc.)
                  if (/^[A-Z]$/.test(correctOptionLine)) {
                    // Convert letter to index (A = 0, B = 1, etc.)
                    const correctOptionIndex = correctOptionLine.charCodeAt(0) - 65;
                    
                    if (correctOptionIndex >= 0 && correctOptionIndex < options.length) {
                      correctOption = JSON.stringify(options[correctOptionIndex]);
                    }
                  } else {
                    // Legacy support: find the matching option by text
                    const correctOptionIndex = options.findIndex((opt: any) => 
                      opt.content && opt.content[0] && opt.content[0].text === correctOptionLine
                    );
                    
                    if (correctOptionIndex >= 0) {
                      correctOption = JSON.stringify(options[correctOptionIndex]);
                    }
                  }
                  contentStartLine++;
                }
              }
              
              // Create the question token
              const token = state.push('question', '', 0);
              token.block = true;
              token.attrs = {
                options,
                correctOption,
              };
              token.content = lines.slice(contentStartLine - (startLine + 1)).join('\n').trim();
              token.map = [startLine, endingLine + 1];
              
              // Process the content
              state.md.block.tokenize(state, startLine + 1, endingLine);
              
              state.line = endingLine + 1;
              return true;
            });
            
            markdownit.renderer.rules.question = function(tokens: any[], idx: number) {
              const token = tokens[idx];
              const options = JSON.stringify(token.attrs.options);
              const correctOption = token.attrs.correctOption;
              
              const divData = `<div data-question data-options='${options}' data-correct-option='${correctOption}'>${token.content}</div>`;
              console.log(divData);
              return divData;
            };
          }
        }
      }
    };
  }
}); 