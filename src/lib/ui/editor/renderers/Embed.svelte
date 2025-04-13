<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { onMount, tick } from 'svelte';
	import LoadingSpinner from '$lib/ui/icons/loading-circle.svelte';
	import { NodeViewWrapper } from 'svelte-tiptap';
	import { embeds } from '$lib/stores/embeds.js';

	export let node;
	
	let embedName: string;
	let embed = null;
	let parameter;
	let errorMessageTimeout;

	onMount(async () => {
		await tick();
		let text = node.attrs.text;
		if (text.includes('"')) {
			const spaceIndex = text.indexOf(' ');
			const quoteStartIndex = text.indexOf('"');
			const quoteEndIndex = text.indexOf('"', quoteStartIndex + 1);

			embedName = text.substring(0, spaceIndex);
			parameter = text.substring(quoteStartIndex + 1, quoteEndIndex);
		} else {
			embedName = text;
		}

		// Set the error message timeout
		errorMessageTimeout = setTimeout(() => {
			if (embed === null) {
				embed = 'error'; // Flag for error message
			}
		}, 10000);

		if (!$embeds[embedName]) {
			console.error(`Cannot find component ${embedName}`);
			clearTimeout(errorMessageTimeout); // Clear timeout if already failed
			embed = 'error'; // Flag for error message
			return;
		}

		const { default: Component } = await $embeds[embedName]();
		embed = Component;
	});
</script>
<NodeViewWrapper>
{#if embed !== undefined && embed !== null}
	{#if embed === 'error'}
		<div class="relative">
			<Skeleton class="m-auto my-4" style="width:100%; height:500px;" />
			<div class="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
				<LoadingSpinner class="text-sky-500 w-12 h-12" />
			</div>
		</div>


		<p class="text-red-500 font-bold mb-4">Cannot find component <span class="rounded-md bg-gray-100 text-sm text-black px-1 p-0.5">{embedName}</span></p>
	{:else if embedName && embedName.includes('Image')}
		<div class="my-10" style="max-width: 800px;">
			<svelte:component
				this={embed}
				{...parameter !== null && parameter !== undefined ? { parameter } : {}}
			/>
		</div>
	{:else if embedName && embedName.includes('Language_Generic_Render')}
		<div class="my-4">
			<svelte:component
				this={embed}
				{...parameter !== null && parameter !== undefined ? { parameter } : {}}
			/>
		</div>
	{:else}
		<div
			style="max-width: 800px;"
			class="m-0 w-full my-10 bg-white dark:border-0 border border-slate-200 dark:bg-slate-900 rounded-lg p-8"
		>
			<svelte:component
				this={embed}
				{...parameter !== null && parameter !== undefined ? { parameter } : {}}
			/>
		</div>
	{/if}
{:else}
	<div class="relative">
		<Skeleton class="m-auto my-4" style="width:100%; height:500px;" />
		<div class="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
			<LoadingSpinner class="text-sky-500 w-12 h-12" />
		</div>
	</div>
{/if}
</NodeViewWrapper>