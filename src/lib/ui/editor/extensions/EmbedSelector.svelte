<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search } from 'lucide-svelte';
	import { embeds } from '$lib/stores/embeds.js';
	import { theme } from 'mode-watcher';

	export let editor: any;
	export let range: any;

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let selectedComponent: string | null = null;
	let parameter = '';

	$: currentTheme = $theme;

	$: filteredComponents = Object.keys($embeds).filter((name) =>
		name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	function handleSelect(componentName: string) {
		selectedComponent = componentName;
	}

	function handleEmbed() {
		if (!selectedComponent) return;

		const embedText = parameter ? `${selectedComponent} "${parameter}"` : selectedComponent;
		editor
			.chain()
			.focus()
			.insertContent({
				type: 'embed',
				attrs: { text: embedText }
			})
			.run();

		dispatch('close');
	}
</script>

<div
	class="z-50 w-96 overflow-hidden rounded-lg border dark:border-slate-700 border-gray-200 bg-white dark:bg-slate-800 shadow-xl"
>
	<div class="p-4 border-b dark:border-slate-700 border-gray-200">
		<h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">Embed Component</h3>
		<div class="mt-2 relative">
			<Search
				class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500"
			/>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search components..."
				class="w-full pl-10 pr-4 py-2 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
			/>
		</div>
	</div>

	<div class="max-h-96 overflow-y-auto p-2">
		{#if filteredComponents.length === 0}
			<div class="text-center py-4 text-gray-500 dark:text-slate-400">No components found</div>
		{:else}
			<div class="space-y-1">
				{#each filteredComponents as component}
					<button
						class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors
						{selectedComponent === component
							? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
							: 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}"
						on:click={() => handleSelect(component)}
					>
						{component}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if selectedComponent}
		<div class="p-4 border-t dark:border-slate-700 border-gray-200">
			<div class="space-y-4">
				<div>
					<label
						for="parameter"
						class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>
						Parameter (optional)
					</label>
					<input
						type="text"
						id="parameter"
						bind:value={parameter}
						placeholder="Enter parameter..."
						class="mt-1 w-full px-3 py-2 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
					/>
				</div>
				<button
					on:click={handleEmbed}
					class="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors"
				>
					Embed Component
				</button>
			</div>
		</div>
	{/if}
</div> 