<script>
	import HoverCardWrapper from '$lib/components/ui/HoverCardWrapper.svelte';
	import { NodeViewWrapper } from 'svelte-tiptap';
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

	<HoverCardWrapper
		openDelay={10}
		closeDelay={10}
		triggerClass="inline-block"
		contentClass="dark:bg-slate-900/30 backdrop-blur-xl shadow-md shadow-slate-400/50"
	>
		<div slot="trigger">
			<span
				class="font-bold text-sky-500 dark:bg-sky-950 bg-sky-100 hover:bg-sky-50 py-0.5 px-2 mx-0.5 rounded-sm inline canCopy"
			>{node.attrs.term}</span>
		</div>

		<div slot="content">
			<p class="text-sm dark:text-slate-300 text-slate-700">
				<span
					class="font-black text-xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent inline-block mb-4"
				>Key Term
				</span><br />
				<span class="font-black">Definition: </span>
				{node.attrs.definition}
			</p>
		</div>
	</HoverCardWrapper>

{/if}
</NodeViewWrapper>