<script>
	import { NodeViewWrapper } from 'svelte-tiptap';
	import Katex from 'svelte-katex';
	import 'katex/dist/katex.min.css';
	import { onMount, tick } from 'svelte';

	export let node;

	let mounted = false;

	onMount(async () => {
		await tick();
		mounted = true;
	});
</script>


<NodeViewWrapper class="my-2">
	{#if mounted}
		<div class="rounded-lg border border-gray-100 bg-white p-4">
			<Katex
				displayMode
				throwError={false}
				errorColor="red"
			>
				{node.attrs.formula}
			</Katex>
		</div>
	{/if}
</NodeViewWrapper>