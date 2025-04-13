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
					block: [
						{
							match: /^\$\$(.+?)\$\$/,
							node: 'blockEquation',
							getAttrs: match => ({ formula: match[1].trim() }),
						},
					],
				},
			},
		};
	}
});