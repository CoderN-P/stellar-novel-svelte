import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import BlockEquation from '../renderers/BlockEquation.svelte';
import { InputRule } from '@tiptap/core';


export const BlockEquationNode = Node.create({
	name: 'blockEquation',
	group: 'block',
	inline: false,
	selectable: true,
	atom: true,
	draggable: true,
	
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
				tag: 'block-equation',
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
		return ['block-equation', HTMLAttributes, 0];
	},

	addInputRules() {
		return [
			new InputRule({
				find: /^\$\$(.+?)\$\$$/,
				handler: ({ match, state, range }) => {
					const [, formula] = match;
					
					const node = this.type.create({ formula: formula.trim() });
					return state.tr.replaceWith(range.from, range.to, node);
				},
			}),
		];
	},

	addNodeView() {
		return SvelteNodeViewRenderer(BlockEquation);
	},
	addKeyboardShortcuts() {
		return {
			Backspace: ({ editor }) => {
				const { from, to, empty } = editor.state.selection;
				const node = editor.state.selection.$from.nodeBefore;

				if (!empty || !node || node.type.name !== 'blockEquation') return false;

				const formula = node.attrs.formula;
				const text = `$$\n${formula}\n$$`;

				editor
					.chain()
					.focus()
					.insertContentAt({ from: from - node.nodeSize, to }, text)
					.run();

				return true;
			},
		};
	},
	
	addStorage() {
		return {
			markdown: {
				serialize(state, node) {
					const { formula } = node.attrs;
					state.write(`$$${formula}$$`);
				},
				parse: {
					setup(markdownit) {
						markdownit.block.ruler.before('fence', 'block_equation', (state, startLine, endLine, silent) => {
							const startPos = state.bMarks[startLine] + state.tShift[startLine];
							const maxPos = state.eMarks[startLine];

							const lineText = state.src.slice(startPos, maxPos).trim();
							if (!lineText.startsWith('$$') || !lineText.endsWith('$$')) return false;

							if (silent) return true;

							const formula = lineText.slice(2, -2).trim();

							const token = state.push('block_equation', '', 0);
							token.block = true;
							token.attrs = { formula };
							token.content = formula;
							token.map = [startLine, startLine + 1];
							state.line = startLine + 1;

							return true;
						});
						markdownit.renderer.rules.block_equation = function(tokens, idx) {
							const formula = tokens[idx].attrs.formula;
							return `<block-equation data-formula="${formula}"></block-equation>`;
						}
					}
				},
			},
		};
	}
});