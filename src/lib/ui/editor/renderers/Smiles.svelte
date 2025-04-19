<script lang="ts">
	import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap';
	import { theme } from 'mode-watcher';
	import { Edit, Beaker } from 'lucide-svelte';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import SmilesDrawer from 'smiles-drawer';

	export let node;
	export let updateAttributes;
	export let selected;

	const dispatch = createEventDispatcher();
	
	let isEditing = false;
	let editingSmiles = '';
	let editingLabel = '';
	let canvas: HTMLCanvasElement;
	let smilesDrawer: any;
	
	$: currentTheme = $theme;
	$: smiles = node.attrs.smiles || '';
	$: label = node.attrs.label || smiles;
	
	onMount(() => {
		// Initialize SmilesDrawer
		smilesDrawer = new SmilesDrawer.SvgDrawer({
			width: 300,
			height: 200,
			bondThickness: 1.5,
			bondLength: 15,
			atomVisualization: 'default',
			terminalCarbons: true,
			explicitHydrogens: false,
			themes: {
				dark: {
					C: '#fff',
					O: '#e74c3c',
					N: '#3498db',
					F: '#27ae60',
					CL: '#16a085',
					BR: '#d35400',
					I: '#8e44ad',
					P: '#d35400',
					S: '#f1c40f',
					B: '#e67e22',
					SI: '#e67e22',
					H: '#fff',
					BACKGROUND: '#1e293b'
				},
				light: {
					C: '#222',
					O: '#e74c3c',
					N: '#3498db',
					F: '#27ae60',
					CL: '#16a085',
					BR: '#d35400',
					I: '#8e44ad',
					P: '#d35400',
					S: '#f1c40f',
					B: '#e67e22',
					SI: '#e67e22',
					H: '#222',
					BACKGROUND: '#FFFFFF'
				}
			}
		});
		
	});
	
	let svgElement;

	afterUpdate(() => {
		if (typeof window === 'undefined') return;
		SmilesDrawer.parse(smiles, function (tree) {
			smilesDrawer.draw(tree, svgElement, $theme === 'dark' ? 'dark' : 'light');
		});
	});
	
	
	function startEditing() {
		editingSmiles = smiles;
		editingLabel = label;
		isEditing = true;
	}
	
	function saveChanges() {
		if (!editingSmiles.trim()) return;
		
		updateAttributes({
			smiles: editingSmiles.trim(),
			label: editingLabel.trim() || editingSmiles.trim()
		});
		
		isEditing = false;
	}
	
	function cancelEditing() {
		isEditing = false;
	}
</script>

<NodeViewWrapper class="my-2">
	{#if isEditing}
		<div class="smiles-editor">
			<div class="flex items-center gap-2 mb-2">
				<Beaker size="16" class="text-blue-500" />
				<span class="text-sm font-medium">Edit SMILES</span>
			</div>
			<div class="space-y-2">
				<div>
					<label for="smiles-input" class="block text-xs text-gray-500 dark:text-slate-400 mb-1">SMILES String</label>
					<input
						id="smiles-input"
						type="text"
						bind:value={editingSmiles}
						class="w-full px-2 py-1 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
						placeholder="Enter SMILES string..."
					/>
				</div>
				<div>
					<label for="label-input" class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Display Label (optional)</label>
					<input
						id="label-input"
						type="text"
						bind:value={editingLabel}
						class="w-full px-2 py-1 rounded-md border dark:border-slate-600 border-gray-200 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
						placeholder="Enter display label..."
					/>
				</div>
				<div class="flex justify-end gap-2 mt-2">
					<button
						on:click={cancelEditing}
						class="px-2 py-1 text-xs rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
					>
						Cancel
					</button>
					<button
						on:click={saveChanges}
						class="px-2 py-1 text-xs rounded-md text-white bg-blue-500 hover:bg-blue-600"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="smiles-display inline-flex flex-col border dark:border-slate-800 border-gray-100 items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300">
			<svg bind:this={svgElement} data-smiles={smiles} />
			<div class="flex items-center gap-1">
				<Beaker size="14" />
				<span class="text-sm">{label}</span>
				{#if selected}
					<button
						on:click={startEditing}
						class="ml-1 p-0.5 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800"
					>
						<Edit size="12" />
					</button>
				{/if}
			</div>
		</div>
	{/if}
</NodeViewWrapper>

<style>
	.smiles-node-wrapper {
		display: inline;
	}
	
	svg {
		width: 100%;
		height: auto;
	}
	
	.smiles-editor {
		position: absolute;
		z-index: 50;
		background-color: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		min-width: 250px;
	}
	
	:global(.dark) .smiles-editor {
		background-color: #1e293b;
		border-color: #334155;
	}
</style> 