<script lang="ts" context="module">
	export interface BubbleMenuItem {
		name: string;
		isActive: () => boolean;
		command: () => void;
		icon: typeof BoldIcon;
	}

</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Editor } from '@tiptap/core';
	import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import ColorSelector from './color-selector.svelte';
	import VocabSelector from './vocab-selector.svelte';
	import LinkSelector from './link-selector.svelte';
	import NodeSelector from './node-selector.svelte';
	import { BubbleMenuPlugin, type BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';
	import { onDestroy, onMount } from 'svelte';

	let element: HTMLElement;

	let isNodeSelectorOpen = writable(false);
	let isColorSelectorOpen = writable(false);
	let isVocabSelectorOpen = writable(false);
	let isLinkSelectorOpen = writable(false);

	export let editor: Editor;
	export let tippyOptions: BubbleMenuPluginProps['tippyOptions'] = {
		moveTransition: 'transform 0.15s ease-out',
		onHidden: () => {
			isNodeSelectorOpen.set(false);
			isColorSelectorOpen.set(false);
			isVocabSelectorOpen.set(false);
			isLinkSelectorOpen.set(false);
		}
	};
	export let pluginKey: BubbleMenuPluginProps['pluginKey'] = 'SvelteTiptapBubbleMenu';
	export let shouldShow: BubbleMenuPluginProps['shouldShow'] = ({ editor }) => {
		// don't show if image is selected
		if (editor.isActive('image')) {
			return false;
		}
		return editor.view.state.selection.content().size > 0;
	};
	export let updateDelay: BubbleMenuPluginProps['updateDelay'] = 250;

	const items: BubbleMenuItem[] = [
		{
			name: 'bold',
			isActive: () => editor.isActive('bold'),
			command: () => editor.chain().focus().toggleBold().run(),
			icon: BoldIcon
		},
		{
			name: 'italic',
			isActive: () => editor.isActive('italic'),
			command: () => editor.chain().focus().toggleItalic().run(),
			icon: ItalicIcon
		},
		{
			name: 'underline',
			isActive: () => editor.isActive('underline'),
			command: () => editor.chain().focus().toggleUnderline().run(),
			icon: UnderlineIcon
		},
		{
			name: 'strike',
			isActive: () => editor.isActive('strike'),
			command: () => editor.chain().focus().toggleStrike().run(),
			icon: StrikethroughIcon
		},
		{
			name: 'code',
			isActive: () => editor.isActive('code'),
			command: () => editor.chain().focus().toggleCode().run(),
			icon: CodeIcon
		}
	];

	const reset = () => {
		isNodeSelectorOpen.set(false);
		isColorSelectorOpen.set(false);
		isVocabSelectorOpen.set(false);
		isLinkSelectorOpen.set(false);
	};

	$: if (!$isNodeSelectorOpen) {
		reset();
	}

	$: if (!$isColorSelectorOpen) {
		reset();
	}

	$: if (!$isLinkSelectorOpen) {
		reset();
	}

	if (!editor) {
		throw new Error('Missing editor instance.');
	}

	onMount(() => {
		const plugin = BubbleMenuPlugin({
			pluginKey,
			editor,
			element,
			tippyOptions,
			shouldShow,
			updateDelay
		});

		editor.registerPlugin(plugin);
	});

	onDestroy(() => {
		editor.unregisterPlugin(pluginKey);
	});
</script>

<div
	bind:this={element}
	class="flex w-fit divide-x divide-gray-200 dark:divide-slate-800 rounded-lg border dark:border-slate-800 border-gray-200 dark:bg-black bg-white shadow-xl"
>
	<NodeSelector {editor} bind:isOpen={$isNodeSelectorOpen} />
	<VocabSelector {editor} bind:isOpen={$isVocabSelectorOpen} />
	<LinkSelector {editor} bind:isOpen={$isLinkSelectorOpen} />

	<div class="flex">
		{#each items as item, index (index)}
			<button
				on:click={item.command}
				class="p-2 text-gray-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 hover:bg-gray-100 active:bg-gray-200"
				type="button"
			>
				<svelte:component
					this={item.icon}
					class={cn('h-4 w-4', {
						'text-blue-500': item.isActive()
					})}
				/>
			</button>
		{/each}
	</div>
	<ColorSelector {editor} bind:isOpen={$isColorSelectorOpen} />
</div>
