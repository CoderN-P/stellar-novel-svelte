<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { theme } from 'mode-watcher';

	export let editor: any;
	export let range: any;

	const dispatch = createEventDispatcher();

	let term = '';
	let definition = '';

	$: currentTheme = $theme;

	function handleCreate() {
		if (!term || !definition) return;

		editor
			.chain()
			.focus()
			.insertContent({
				type: 'vocabularyTerm',
				attrs: { 
					term: term.trim(),
					definition: definition.trim()
				}
			})
			.run();

		dispatch('close');
	}
</script>

<div
	class="z-50 w-96 overflow-hidden rounded-lg border dark:border-slate-700 border-gray-200 bg-white dark:bg-slate-800 shadow-lg"
>
	<div class="p-4 border-b dark:border-slate-700 border-gray-200">
		<h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">Create Vocabulary Term</h3>
		<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
			You can also use the syntax <code class="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">|term: definition|</code> to create vocabulary terms.
		</p>
	</div>

	<div class="p-4 space-y-4">
		<div>
			<label
				for="term"
				class="block text-sm font-medium text-gray-700 dark:text-slate-300"
			>
				Term
			</label>
			<input
				type="text"
				id="term"
				bind:value={term}
				placeholder="Enter term..."
				class="mt-1 w-full px-3 py-2 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
			/>
		</div>
		
		<div>
			<label
				for="definition"
				class="block text-sm font-medium text-gray-700 dark:text-slate-300"
			>
				Definition
			</label>
			<textarea
				id="definition"
				bind:value={definition}
				placeholder="Enter definition..."
				rows="3"
				class="mt-1 w-full px-3 py-2 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
			></textarea>
		</div>
		
		<button
			on:click={handleCreate}
			disabled={!term || !definition}
			class="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Create Vocabulary Term
		</button>
	</div>
</div> 