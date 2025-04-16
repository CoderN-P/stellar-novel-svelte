<script lang="ts">
	import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap';
	import { theme } from 'mode-watcher';
	import { Check, Edit, Plus, Trash, Eye, Settings } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { Editor } from '@tiptap/core';
	import { getContext } from 'svelte';
	import { defaultExtensions } from '$lib/ui/editor/extensions/index.js';

	export let node;
	export let updateAttributes;
	export let selected;
	let markdownRenderer = getContext('markdownRenderer') || SvelteMarkdown;

	const dispatch = createEventDispatcher();
	
	let newOption = '';
	let editingOptionIndex = -1;
	let editingOption = '';
	let activeTab = 'edit'; // 'view' or 'edit'
	let markdown = '';
	
	
	$: currentTheme = $theme;
	$: options = node.attrs.options || [];
	$: correctOption = node.attrs.correctOption || '';

	$: getMarkdown(node.content);
	
	function getMarkdown(node) {
		let nodeContent = { 
			type: 'doc',
			content: JSON.parse(JSON.stringify(node.content)),
		};
		

		const editor = new Editor({
				content: nodeContent,
				extensions: defaultExtensions,
			});
			markdown = editor.storage.markdown.getMarkdown();
			console.log(markdown);
			editor.destroy();
	}
	
	// Convert index to letter (0 = A, 1 = B, etc.)
	function indexToLetter(index: number): string {
		return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
	}
	
	function addOption() {
		if (!newOption.trim()) return;
		
		// Create a new option with rich text content
		const newOptionContent = {
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: newOption.trim()
				}
			]
		};
		
		const updatedOptions = [...options, newOptionContent];
		updateAttributes({ options: updatedOptions });
		newOption = '';
	}
	
	function removeOption(index: number) {
		const updatedOptions = options.filter((_, i) => i !== index);
		updateAttributes({ options: updatedOptions });
		
		// If the removed option was the correct one, clear the correct option
		if (correctOption === JSON.stringify(options[index])) {
			updateAttributes({ correctOption: '' });
		}
	}
	
	function editOption(index: number) {
		editingOptionIndex = index;
		// Extract text content from the rich text option
		const optionContent = options[index];
		if (optionContent && optionContent.content && optionContent.content[0]) {
			editingOption = optionContent.content[0].text || '';
		} else {
			editingOption = '';
		}
	}
	
	function saveEditedOption() {
		if (editingOptionIndex === -1 || !editingOption.trim()) return;
		
		// Create a new option with rich text content
		const editedOptionContent = {
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: editingOption.trim()
				}
			]
		};
		
		const updatedOptions = [...options];
		updatedOptions[editingOptionIndex] = editedOptionContent;
		
		updateAttributes({ options: updatedOptions });
		
		// If the edited option was the correct one, update the correct option
		if (correctOption === JSON.stringify(options[editingOptionIndex])) {
			updateAttributes({ correctOption: JSON.stringify(editedOptionContent) });
		}
		
		editingOptionIndex = -1;
		editingOption = '';
	}
	
	function setCorrectOption(option: any) {
		updateAttributes({ correctOption: JSON.stringify(option) });
	}
	
	// Helper function to get text content from a rich text option
	function getOptionText(option: any): string {
		if (!option || !option.content) return '';
		
		// If it's a simple text node
		if (option.content[0] && option.content[0].type === 'text') {
			return option.content[0].text || '';
		}
		
		// If it's a more complex structure, try to extract text
		return JSON.stringify(option);
	}
	
	// Check if an option is the correct one
	function isCorrectOption(option: any): boolean {
		if (!correctOption) return false;
		return correctOption === JSON.stringify(option);
	}
	
	// Get the index of the correct option
	function getCorrectOptionIndex(): number {
		if (!correctOption) return -1;
		return options.findIndex(opt => JSON.stringify(opt) === correctOption);
	}
</script>

<NodeViewWrapper class="question-node">
	<div class="relative my-4 rounded-lg border dark:border-slate-700 border-gray-200 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
		<div class="flex items-center justify-between p-3 border-b dark:border-slate-700 border-gray-200 bg-gray-50 dark:bg-slate-900">
			<h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">Question</h3>
			<div class="flex items-center space-x-2">
				<button 
					on:click={() => activeTab = 'view'}
					class="p-1 rounded-md {activeTab === 'view' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}"
					title="View Mode"
				>
					<Eye size="16" />
				</button>
				<button 
					on:click={() => activeTab = 'edit'}
					class="p-1 rounded-md {activeTab === 'edit' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}"
					title="Edit Mode"
				>
					<Settings size="16" />
				</button>
			</div>
		</div>
		
		<div class="{activeTab === 'edit' ? 'block' : 'hidden'}">
			<div class="p-4 space-y-4">
				<div>
					<h4 class="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Question Text</h4>
					<div class="border dark:border-slate-600 border-gray-200 rounded-md p-2 bg-white dark:bg-slate-900">
						<NodeViewContent class="prose dark:prose-invert max-w-none" contenteditable="true" />
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Options</h4>
					<div class="space-y-2">
						{#each options as option, index}
							<div class="flex items-center gap-2">
								<span class="font-medium text-gray-700 dark:text-slate-300 w-6">{indexToLetter(index)}.</span>
								{#if editingOptionIndex === index}
									<input
										type="text"
										bind:value={editingOption}
										class="flex-1 px-2 py-1 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
										on:keydown={(e) => e.key === 'Enter' && saveEditedOption()}
									/>
									<button
										on:click={saveEditedOption}
										class="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
									>
										<Check size="16" />
									</button>
								{:else}
									<div class="flex-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100">
										{getOptionText(option)}
									</div>
									<button
										on:click={() => editOption(index)}
										class="p-1 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
									>
										<Edit size="16" />
									</button>
									<button
										on:click={() => removeOption(index)}
										class="p-1 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
									>
										<Trash size="16" />
									</button>
									<button
										on:click={() => setCorrectOption(option)}
										class="p-1 rounded-md {isCorrectOption(option) ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}"
									>
										<Check size="16" />
									</button>
								{/if}
							</div>
						{/each}
						
						<div class="flex items-center gap-2">
							<span class="font-medium text-gray-700 dark:text-slate-300 w-6">{indexToLetter(options.length)}.</span>
							<input
								type="text"
								bind:value={newOption}
								placeholder="Add new option..."
								class="flex-1 px-2 py-1 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
								on:keydown={(e) => e.key === 'Enter' && addOption()}
							/>
							<button
								on:click={addOption}
								class="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
							>
								<Plus size="16" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
			
			<div class="{activeTab === 'view' ? 'block' : 'hidden'}">
				<div class="p-4">
					<div class="mb-4">
						<svelte:component this={markdownRenderer} source={markdown}/>
					</div>
					
					<div class="space-y-2">
						{#each options as option, index}
							<div class="flex items-start gap-2 p-2 rounded-md {isCorrectOption(option) ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'}">
								<span class="font-medium text-gray-700 dark:text-slate-300 w-6 mt-1">{indexToLetter(index)}.</span>
								<div class="flex-1">
									{getOptionText(option)}
									{#if isCorrectOption(option)}
										<span class="ml-2 text-xs text-green-600 dark:text-green-400">(Correct)</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
			</div>
			</div>
	</div>
</NodeViewWrapper>

<style>
	.question-node {
		position: relative;
	}
</style>