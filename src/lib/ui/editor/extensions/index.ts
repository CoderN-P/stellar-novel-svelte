import { Editor, InputRule } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextStyle from '@tiptap/extension-text-style';
import TiptapUnderline from '@tiptap/extension-underline';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import UploadImagesPlugin from '../plugins/upload-images.js';
import SlashCommand from './slash-command.js';
import { InlineEquationNode } from '$lib/ui/editor/extensions/inlineEquation.js';
import { BlockEquationNode } from '$lib/ui/editor/extensions/blockEquation.js';
import UpdatedImage from './updated-image.js';
import { VocabularyNode } from './vocabulary.js';
import { CustomHeading } from './heading.js';
import { EmbedNode } from './embed.js';
import { CodeBlockNode } from '$lib/ui/editor/extensions/codeBlock.js';
import { QuestionNode } from '$lib/ui/editor/extensions/question.js';
import Smiles from '$lib/ui/editor/renderers/Smiles.svelte';
import { SmilesNode } from '$lib/ui/editor/extensions/smiles.js';

export const defaultExtensions = [
	StarterKit.configure({
		bulletList: {
			HTMLAttributes: {
				class: 'list-disc list-outside leading-3 -mt-2'
			}
		},
		orderedList: {
			HTMLAttributes: {
				class: 'list-decimal space-y-2 list-outside  '
			}
		},
		listItem: {
			HTMLAttributes: {
				class: 'leading-normal -mb-2'
			}
		},
		blockquote: {
			HTMLAttributes: {
				class: 'border-l-4 dark:border-slate-800 border-gray-200'
			}
		},
		codeBlock: false,
		heading: false,
		code: {
			HTMLAttributes: {
				class: 'rounded-md dark:bg-slate-800 bg-gray-100 px-1 py-0.5 font-mono text-sm dark:text-slate-300 text-gray-800',
				spellcheck: 'false'
			}
		},
		horizontalRule: false,
		dropcursor: {
			color: '#DBEAFE',
			width: 4
		},
		gapcursor: false
	}),
	CodeBlockNode,
	InlineEquationNode,
	CustomHeading,
	BlockEquationNode,
	GlobalDragHandle.configure({
		handle: '.drag-handle',
	}),
	// patch to fix horizontal rule bug: https://github.com/ueberdosis/tiptap/pull/3859#issuecomment-1536799740
	HorizontalRule.extend({
		addInputRules() {
			return [
				new InputRule({
					find: /^(?:---|—-|___\s|\*\*\*\s)$/,
					handler: ({ state, range }) => {
						const attributes = {};

						const { tr } = state;
						const start = range.from;
						const end = range.to;

						tr.insert(start - 1, this.type.create(attributes)).delete(
							tr.mapping.map(start),
							tr.mapping.map(end)
						);
					}
				})
			];
		}
	}).configure({
		HTMLAttributes: {
			class: 'mt-4 mb-6 border-t dark:border-slate-700 border-gray-300'
		}
	}),
	TiptapLink.configure({
		HTMLAttributes: {
			class:
				'text-blue-500 underline underline-offset-[3px] dark:hover:text-blue-600 hover:text-blue-400 transition-colors cursor-pointer'
		}
	}),
	TiptapImage.extend({
		addProseMirrorPlugins() {
			return [UploadImagesPlugin()];
		}
	}).configure({
		allowBase64: true,
		HTMLAttributes: {
			class: 'rounded-lg border dark:border-slate-800 border-gray-200'
		}
	}),
	UpdatedImage.configure({
		HTMLAttributes: {
			class: 'rounded-lg border dark:border-slate-800 border-gray-200'
		}
	}),
	Placeholder.configure({
		placeholder: ({ node }: any) => {
			if (node.type.name === 'heading') {
				return `Heading ${node.attrs.level}`;
			}
			return "Press '/' for commands, or '++' for AI autocomplete...";
		},
		includeChildren: true
	}),
	SlashCommand,
	VocabularyNode,
	TiptapUnderline,
	TextStyle,
	Color,
	SmilesNode,
	QuestionNode,
	EmbedNode,
	Highlight.configure({
		multicolor: true
	}),
	TaskList.configure({
		HTMLAttributes: {
			class: 'not-prose pl-2'
		}
	}),
	TaskItem.configure({
		HTMLAttributes: {
			class: 'flex items-start my-4'
		},
		nested: true
	}),
	Markdown.configure({
		html: false,
		transformCopiedText: true
	})
];
