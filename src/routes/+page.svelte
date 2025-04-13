<script lang="ts">
	import { type EditorType, Editor } from '$lib/index.js';
	import Nav from './nav.svelte';

	let saveStatus = 'Saved';
	let editor: EditorType;
	
	let componentMap = {
		test: () =>
			import ('$lib/components/testEmbed.svelte'),
	}
</script>

<Nav />



<main class="flex flex-col items-center gap-4 justify-center sm:pt-[15vh] sm:px-4">
	<Editor
		bind:editor
		{componentMap}
		onUpdate={() => {
			saveStatus = 'Unsaved';
		}}
		onDebouncedUpdate={() => {
			saveStatus = 'Saving...';
			// Simulate a delay in saving.
			setTimeout(() => {
				saveStatus = 'Saved';
			}, 500);
		}}
	>
		<div
			class="absolute right-5 top-5 z-10 mb-5 rounded-lg dark:bg-slate-900 bg-gray-100 px-2 py-1 dark:text-gray-500 text-sm text-gray-400"
		>
			{saveStatus}
		</div>
	</Editor>
</main>
