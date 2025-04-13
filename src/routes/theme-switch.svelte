<script lang="ts">
	import { browser } from '$app/environment';
	import { setMode, mode } from 'mode-watcher';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { Check, Monitor, Moon, Sun } from 'lucide-svelte';
	import { writable } from 'svelte/store';



	function wrapModeStore(readableStore, setter) {
		return {
			subscribe: readableStore.subscribe,
			set: setter,
			update: fn => {
				let value;
				const unsubscribe = readableStore.subscribe(v => value = v);
				unsubscribe(); // sync pull
				setter(fn(value));
			}
		};
	}

	const writableMode = wrapModeStore(mode, setMode);
	
	const {
		elements: { trigger, menu },
		builders: { createMenuRadioGroup }
	} = createDropdownMenu({
		preventScroll: false
	});

	const {
		elements: { radioGroup, radioItem }
	} = createMenuRadioGroup({
		value: writableMode,
		onValueChange({ next }) {

			if (next === 'dark') {
				setMode('light');
			} else if (next === 'light') {
				setMode('dark');
			} else if (next === 'system') {
				setMode('system');
			} 

			return next;
		}
	});
</script>

{#if browser}
	<button
		type="button"
		class="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100"
		use:melt={$trigger}
		aria-label="Update dimensions"
	>
		{#if $mode === 'system'}
			<Monitor class="square-5" />
		{:else if $mode === 'dark'}
			<Moon class="square-5" />
		{:else if $mode === 'light'}
			<Sun class="square-5" />
		{/if}
		<span class="sr-only">Open Dropdown menu</span>
	</button>
{/if}

<div
	class="border-stone-200 bg-white border rounded-md p-2 min-w-[200px] z-[999999]"
	use:melt={$menu}
>
	<div class="w-full" use:melt={$radioGroup}>
		<button
			type="button"
			class="w-full flex items-center gap-2 data-[highlighted]:bg-stone-100 p-2 rounded-[5px]"
			use:melt={$radioItem({ value: 'system' })}
		>
			<Monitor class="square-4" />
			System
			{#if $mode === 'system'}
				<Check class="square-4 ml-auto" />
			{/if}
		</button>
		<button
			type="button"
			class="w-full flex items-center gap-2 data-[highlighted]:bg-stone-100 p-2 rounded-[5px]"
			use:melt={$radioItem({ value: 'dark' })}
		>
			<Moon class="square-4" />
			Dark
			{#if $mode === 'dark'}
				<Check class="square-4 ml-auto" />
			{/if}
		</button>
		<button
			type="button"
			class="w-full flex items-center gap-2 data-[highlighted]:bg-stone-100 p-2 rounded-[5px]"
			use:melt={$radioItem({ value: 'light' })}
		>
			<Sun class="square-4" />
			Light
			{#if $mode === 'light'}
				<Check class="square-4 ml-auto" />
			{/if}
		</button>
	</div>
</div>
