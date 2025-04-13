<script lang="ts">
	import { anyify, cn } from '$lib/ui/utils.js';
	import type { Editor } from '@tiptap/core';
	import { Check, Trash } from 'lucide-svelte';

	export let editor: Editor;
	export let isOpen: boolean;

	let inputRef: HTMLInputElement | null;

	function getSelectedDefinition(): string {
		const node = editor.state.selection.$from.nodeAfter;
		return node?.type.name === 'vocabulary' ? node.attrs.definition : '';
	}
</script>

<div class="relative">
	<button
		type="button"
		class="flex h-full items-center space-x-2 px-3 py-1.5 text-sm font-medium dark:text-slate-300 text-gray-600 dark:hover:bg-slate-800 dark:active:bg-slate-700 hover:bg-gray-100 active:bg-gray-200"
		on:click={() => {
			isOpen = !isOpen;
		}}
	>
		
		<p
			class={cn('underline decoration-gray-400 dark:decoration-slate-500 underline-offset-4', {
				'text-blue-500': editor.isActive('vocabulary')
			})}
		>
			Vocab
		</p>
	</button>
	{#if isOpen}
		<form
			on:submit={(e) => {
				e.preventDefault();
				const input = anyify(e.target)[0];
				const def = input.value;
				if (def) {
					editor.chain().focus().insertVocabularyNode(def).run();
				}
				isOpen = false;
			}}
			class="fixed top-full z-[99999] mt-1 flex w-60 overflow-hidden rounded border dark:border-slate-800 border-gray-200 dark:bg-black bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-1"
		>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus
				bind:this={inputRef}
				type="text"
				placeholder="Enter a definition"
				class="flex-1 dark:bg-black bg-white p-1 text-sm outline-none"
				value={getSelectedDefinition()}
			/>
			{#if getSelectedDefinition()}
				<button
					type="button"
					class="flex items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
					on:click={() => {
						editor.chain().focus().deleteNodeAtSelection('vocabulary').run();
						isOpen = false;
					}}
				>
					<Trash class="h-4 w-4" />
				</button>
			{:else}
				<button
					class="flex items-center rounded-sm p-1 text-gray-600 transition-all dark:text-slate-300 hover:bg-slate-800 hover:bg-gray-100"
				>
					<Check class="h-4 w-4" />
				</button>
			{/if}
		</form>
	{/if}
</div>
