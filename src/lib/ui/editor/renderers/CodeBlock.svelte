<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { EditorState, StateEffect } from '@codemirror/state';
	import { javascript } from '@codemirror/lang-javascript';
	import { theme } from 'mode-watcher';
	import * as Select from '$lib/components/ui/select';
	import { python } from '@codemirror/lang-python';
	import { NodeViewWrapper } from 'svelte-tiptap';
	import { html } from '@codemirror/lang-html';
	import { Copy } from 'lucide-svelte';
	import { ayuLight } from 'thememirror';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { indentWithTab } from "@codemirror/commands";
	import { cpp } from '@codemirror/lang-cpp';
	import { java } from '@codemirror/lang-java';
	import { json } from '@codemirror/lang-json';
	import { markdown } from '@codemirror/lang-markdown';
	import { rust } from '@codemirror/lang-rust';
	import { xml } from '@codemirror/lang-xml';
	import { php } from '@codemirror/lang-php';

	export let updateAttributes;
	export let node;

	let editorDiv;
	let view;

	$: currentTheme = $theme;

	const languages = {
		javascript,
		python,
		html,
		cpp,
		java,
		json,
		markdown,
		rust,
		xml,
		php
	};
	
	let language = node.attrs.language || 'javascript';

	const langOptions = Object.keys(languages);

	function getThemeExtension() {
		return currentTheme === 'dark' ? oneDark : ayuLight;
	}

	function updateEditorTheme() {
		if (!view) return;
		
		const langExtension = languages[language]?.();
		if (!langExtension) return;

		view.dispatch({
			effects: StateEffect.reconfigure.of([
				basicSetup,
				getThemeExtension(),
				keymap.of([indentWithTab]),
				langExtension,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const text = update.state.doc.toString();
						updateAttributes({ content: text });
					}
				}),
				EditorView.theme({
					"&.cm-focused": {
						outline: "none",
					},
				}),
			]),
		});
	}

	$: if (currentTheme) {
		updateEditorTheme();
	}

	onMount(() => {
		view = new EditorView({
			state: EditorState.create({
				doc: node.content.textBetween(0, node.content.size, '\n'),
				extensions: [
					basicSetup,
					getThemeExtension(),
					keymap.of([indentWithTab]),
					languages[node.attrs.language || 'javascript'](),
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							const text = update.state.doc.toString();
							updateAttributes({ content: text });
						}
					}),
					EditorView.theme({
						"&.cm-focused": {
							outline: "none",
						},
					}),
				],
			}),
			parent: editorDiv,
		});
	});

	function setLanguage(lang) {
		language = lang.value;
		updateAttributes({ language: language });
		updateEditorTheme();
	}
</script>

<NodeViewWrapper>
	<div class="relative dark:bg-zinc-800 bg-white my-2 border dark:border-zinc-700 border-gray-200 rounded-lg overflow-hidden shadow-sm" contenteditable="false">
		<div class="w-full rounded-t-lg items-center border-b dark:border-zinc-700 border-gray-200 justify-between flex flex-row px-3 py-2 bg-gray-50 dark:bg-zinc-900">
			<button 
				on:click={() => {
					navigator.clipboard.writeText(node.content.textBetween(0, node.content.size, '\n'));
				}} 
				class="rounded-lg border dark:border-zinc-700 border-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 p-1.5 text-gray-500 dark:text-gray-400 cursor-pointer transition-colors"
			>
				<Copy class="w-4 h-4" />
			</button>
			<Select.Root onSelectedChange={setLanguage}>
				<Select.Trigger class="border dark:border-zinc-700 border-gray-200 dark:bg-zinc-800 bg-white text-gray-700 dark:text-gray-300 dark:hover:bg-zinc-700 hover:bg-gray-50 w-min h-min px-2 py-1 rounded-md text-sm transition-colors">
					{language}
				</Select.Trigger>
				<Select.Content>
					{#each langOptions as lang}
						<Select.Item value={lang}>
							{lang}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div bind:this={editorDiv} class="dark:text-gray-200" />
	</div>
</NodeViewWrapper>
