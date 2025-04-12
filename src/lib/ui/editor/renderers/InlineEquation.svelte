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


<NodeViewWrapper class="inline">
	{#if mounted}

			<Katex
				displayMode={false}
				throwError={false}
				errorColor="red"
			>
				{node.attrs.formula}
			</Katex>
	{/if}
</NodeViewWrapper>