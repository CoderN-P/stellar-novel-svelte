<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { javascript } from '@codemirror/lang-javascript';
	import * as Select from '$lib/components/ui/select';
	import { python } from '@codemirror/lang-python';
	import { NodeViewWrapper } from 'svelte-tiptap';
	import { html } from '@codemirror/lang-html';
	import { Copy } from 'lucide-svelte';
	import { ayuLight } from 'thememirror';
	import { indentWithTab } from "@codemirror/commands"
	export let updateAttributes;
	export let node;

	let editorDiv;
	let view;

	const languages = {
		javascript,
		python,
		html
	};
	
	let language = node.attrs.language || 'javascript';

	const langOptions = Object.keys(languages);

	onMount(() => {
		view = new EditorView({
			state: EditorState.create({
				doc: node.content.textBetween(0, node.content.size, '\n'),
				extensions: [
					basicSetup,
					ayuLight,
					keymap.of([indentWithTab]),
					languages[node.attrs.language || 'javascript'](),
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							const text = update.state.doc.toString();
							updateAttributes({ content: text });
						}
					}),
				],
			}),
			parent: editorDiv,
		});
	});

	function setLanguage(lang) {
		updateAttributes({ language: lang });
	}
	
	
</script>

<NodeViewWrapper>
	<div class="relative bg-white my-2 border border-gray-100 text-white font-mono rounded-lg overflow-hidden" contenteditable="false">
		<div class="w-full rounded-t-lg items-center justify-between flex flex-row px-2 py-1">
			<button on:click={() => {
					navigator.clipboard.writeText(node.content.textBetween(0, node.content.size, '\n'));
				}} class="rounded-lg border border-gray-100 bg-white hover:bg-gray-50 p-2 text-gray-500 cursor-pointer">
				<Copy class="text-gray-500 w-4 h-4 " />
			</button>
			<Select.Root >
				<Select.Trigger class=" border border-gray-100 bg-white text-black hover:bg-gray-50 w-min h-min">
					<Select.Value placeholder="Language" class="mr-2" />
				</Select.Trigger>
					<Select.Content>
							{#each langOptions as lang}
								<Select.Item value={lang} on:click={() => setLanguage(lang)}>
									{lang}
								</Select.Item>
							{/each}
					</Select.Content>
			</Select.Root>
		</div>
		<div bind:this={editorDiv} />
	</div>
</NodeViewWrapper>
