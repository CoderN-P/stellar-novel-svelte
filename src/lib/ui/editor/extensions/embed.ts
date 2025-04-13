import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import Embed from '../renderers/Embed.svelte';
import { InputRule } from '@tiptap/core';


export const EmbedNode = Node.create({
	name: 'embed',
	group: 'block',
	inline: false,
	selectable: true,
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			text: {
				default: '',
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'embed',
				getAttrs: (el) => {
					if (!(el instanceof HTMLElement)) return false;
					return {
						text: el.getAttribute('text') || '',
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ['embed', HTMLAttributes];
	},

	addInputRules() {
		return [
			new InputRule({
				find: /^\{\{(.+?)\}\}$/,
				handler: ({ match, state, range }) => {
					const [, text] = match;

					const node = this.type.create({ text: text.trim() });
					return state.tr.replaceWith(range.from, range.to, node);
				},
			}),
		];
	},

	addNodeView() {
		return SvelteNodeViewRenderer(Embed);
	},
	addKeyboardShortcuts() {
		return {
			Backspace: ({ editor }) => {
				const { from, to, empty } = editor.state.selection;
				const node = editor.state.selection.$from.nodeBefore;

				if (!empty || !node || node.type.name !== 'embed') return false;

				const textAttr = node.attrs.text;
				const text = `{{\n${textAttr}\n}}`;

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
					const { text } = node.attrs;
					state.write(`{{${text}}}`);
				},
				parse: {
					setup(markdownit) {
						markdownit.block.ruler.before('paragraph', 'embed', function(state, startLine, endLine, silent) {
							const pos = state.bMarks[startLine] + state.tShift[startLine];
							const max = state.eMarks[startLine];
							const line = state.src.slice(pos, max);

							const match = /^\{\{([\s\S]+?)\}\}$/.exec(line);

							console.log(line, match);
							if (!match) return false;

							if (silent) return true;

							const token = state.push('embed', '', 0);
							token.block = true;
							token.content = match[1].trim();
							token.map = [startLine, startLine + 1];

							state.line = startLine + 1;
							return true;
						});

						markdownit.renderer.rules.embed = (tokens, idx) => {
							const content = tokens[idx].content;
							return `<embed text="${content}" />`;
						};
					}
				}
			},
		};
	}
});