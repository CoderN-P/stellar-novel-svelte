import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import CodeBlock from '../renderers/CodeBlock.svelte';
import { createLowlight, common } from 'lowlight';
import { nodeInputRule } from '@tiptap/core';

const lowlight = createLowlight(common);

export const CodeBlockNode = CodeBlockLowlight.extend({
	name: 'codeBlock',
	
	addAttributes() {
		return {
			language: {
				default: 'javascript',
			},
			content: {
				default: '',
			}
		}
	},
	
	addNodeView() {
		return SvelteNodeViewRenderer(CodeBlock);
	},
	addInputRules() {
		return [
			nodeInputRule({
				find: /```([a-z]+)?\s$/,
				type: this.type,
			})
		]
	},
	
	addStorage() {
		return {
			markdown: {
				serialize(state, node) {
					const { language, content } = node.attrs;
					console.log(node.attrs);
					state.write(`\`\`\`${language ?? 'javascript'}\n${content ?? ''}\n\`\`\``);
				},
			}
		}
	},
}).configure({ lowlight });