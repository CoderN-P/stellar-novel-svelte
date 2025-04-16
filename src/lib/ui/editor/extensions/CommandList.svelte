<script lang="ts">
	import { getPrevText } from '$lib/editor.js';
	import { LoadingCircle } from '$lib/ui/icons/index.js';
	import { useCompletion } from 'ai/svelte';
	import type { CommandItemProps } from './slash-command.js';
	import { anyify } from '$lib/ui/utils.js';
	import { addToast } from '$lib/ui/toasts.svelte';
	import EmbedSelector from './EmbedSelector.svelte';
	import VocabularySelector from './VocabularySelector.svelte';
	import SmilesSelector from './SmilesSelector.svelte';
	import { createEventDispatcher } from 'svelte';

	export let items: CommandItemProps[] = [];
	export let command: any;
	export let editor: any;
	export let range: any;

	const dispatch = createEventDispatcher();
	let selectedIndex = 0;
	let showEmbedSelector = false;
	let showVocabularySelector = false;
	let showSmilesSelector = false;

	const { complete, isLoading } = useCompletion({
		id: 'novel',
		api: '/api/generate',
		onResponse: (response) => {
			if (response.status === 429) {
				addToast({
					data: {
						text: 'You have reached your request limit for the day.',
						type: 'error'
					}
				});
				// va.track('Rate Limit Reached');
				return;
			}
			editor.chain().focus().deleteRange(range).run();
		},
		onFinish: (_prompt, completion) => {
			// highlight the generated text
			editor.commands.setTextSelection({
				from: range.from,
				to: range.from + completion.length
			});
		},
		onError: (e) => {
			addToast({
				data: {
					text: e.message,
					type: 'error'
				}
			});
		}
	});

	const selectItem = (index: number) => {
		const item = items[index];
		// va.track('Slash Command Used', {
		// 	command: item.title
		// });
		if (item) {
			if (item.title === 'Continue writing') {
				if ($isLoading) return;
				complete(
					getPrevText(editor, {
						chars: 5000,
						offset: 1
					})
				);
			} else if (item.title === 'Embed Component') {
				showEmbedSelector = true;
				showVocabularySelector = false;
				showSmilesSelector = false;
			} else if (item.title === 'Vocabulary Term') {
				showVocabularySelector = true;
				showEmbedSelector = false;
				showSmilesSelector = false;
			} else if (item.title === 'SMILES String') {
				showSmilesSelector = true;
				showEmbedSelector = false;
				showVocabularySelector = false;
			} else {
				command(item);
			}
		}
	};

	const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
	const onKeyDown = (e: KeyboardEvent) => {
		if (!navigationKeys.includes(e.key)) return;
		e.preventDefault();
		if (e.key === 'ArrowUp') {
			selectedIndex = (selectedIndex + items.length - 1) % items.length;
		} else if (e.key === 'ArrowDown') {
			selectedIndex = (selectedIndex + 1) % items.length;
		} else if (e.key === 'Enter') {
			selectItem(selectedIndex);
		}

		const item = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
		if (item)
			item.scrollIntoView({
				block: 'nearest'
			});
	};

	let container: HTMLElement;

	function handleEmbedClose() {
		showEmbedSelector = false;
		dispatch('close');
	}

	function handleVocabularyClose() {
		showVocabularySelector = false;
		dispatch('close');
	}

	function handleSmilesClose() {
		showSmilesSelector = false;
		dispatch('close');
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="relative">
	{#if items.length > 0}
		<div
			id="slash-command"
			class="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border dark:border-slate-800 border-gray-200 dark:bg-slate-950 bg-white px-1 py-2 shadow-md transition-all"
			bind:this={container}
		>
			{#each items as item, index (index)}
				<button
					class="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm dark:text-slate-200 text-gray-900 dark:hover:bg-slate-800 hover:bg-gray-100 scroll-my-2
					{index === selectedIndex ? 'dark:bg-slate-800 bg-gray-100 dark:text-slate-100 text-gray-900' : ''}"
					on:click={() => selectItem(index)}
					data-index={index}
					type="button"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-md border dark:border-slate-800 border-gray-200 dark:bg-slate-900 bg-white"
					>
						{#if item.title === 'Continue writing' && $isLoading}
							<LoadingCircle />
						{:else}
							<svelte:component this={anyify(item.icon)} size="18" />
						{/if}
					</div>
					<div>
						<p class="font-medium">{item.title}</p>
						<p class="text-xs dark:text-slate-400 text-gray-500">{item.description}</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if showEmbedSelector}
		<div class="absolute top-0 left-full ml-2 z-50">
			<EmbedSelector {editor} {range} on:close={handleEmbedClose} />
		</div>
	{:else if showVocabularySelector}
		<div class="absolute top-0 left-full ml-2 z-50">
			<VocabularySelector {editor} {range} on:close={handleVocabularyClose} />
		</div>
	{:else if showSmilesSelector}
		<div class="absolute top-0 left-full ml-2 z-50">
			<SmilesSelector {editor} {range} on:close={handleSmilesClose} />
		</div>
	{/if}
</div>
