<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Root as HoverCard,
		Content as HoverCardContent,
		Trigger as HoverCardTrigger
	} from './hover-card';
	import {
		Root as Popover,
		Content as PopoverContent,
		Trigger as PopoverTrigger
	} from './popover';

	let isMobile = false;

	onMount(() => {
		isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	});

	export let openDelay = 50;
	export let closeDelay = 50;
	export let contentClass = '';
	export let triggerClass = '';
	export let side = 'bottom';
	export let align = 'start';
	export let sideOffset = 4;
</script>

{#if isMobile}
	<Popover>
		<PopoverTrigger class={triggerClass}>
			<slot name="trigger" />
		</PopoverTrigger>
		<PopoverContent class={contentClass}>
			<slot name="content" />
		</PopoverContent>
	</Popover>
{:else}
	<HoverCard {openDelay} {closeDelay}>
		<HoverCardTrigger class={triggerClass}>
			<slot name="trigger" />
		</HoverCardTrigger>
		<HoverCardContent class={contentClass} {align} {side} {sideOffset}>
			<slot name="content" />
		</HoverCardContent>
	</HoverCard>
{/if}