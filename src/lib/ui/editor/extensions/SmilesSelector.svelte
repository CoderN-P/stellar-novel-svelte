<script lang="ts">
	import { anyify, cn } from '$lib/ui/utils.js';
	import type { Editor } from '@tiptap/core';
	import { Check, FlaskConical } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import SmilesDrawer from 'smiles-drawer';
	import { theme } from 'mode-watcher';

	export let editor: Editor;
	export let range: any;

	const dispatch = createEventDispatcher();
	
	let smilesDrawer: any;
	let selectedSmiles = '';

	const commonSmiles = [
		{ name: 'Water', smiles: 'O' },
		{ name: 'Ethanol', smiles: 'CCO' },
		{ name: 'Glucose', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O' },
		{ name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O' },
		{ name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
		{ name: 'Vitamin C', smiles: 'CC([C@@H]([C@H]1[C@H]([C@@H](C(=O)O1)O)O)O' },
		{ name: 'Methane', smiles: 'C' },
		{ name: 'Benzene', smiles: 'c1ccccc1' },
		{ name: 'Carbon Dioxide', smiles: 'O=C=O' },
		{ name: 'Ammonia', smiles: 'N' }
	];

	let customSmiles = '';
	

	onMount(() => {
		// Initialize SmilesDrawer
		smilesDrawer = new SmilesDrawer.SvgDrawer({
			width: 200,
			height: 100,
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
					BACKGROUND: '#fff'
				}
			}
		});
	});
	let svgPreview;
	
	function drawMolecule(smiles: string) {
		SmilesDrawer.parse(smiles, function (tree) {
			smilesDrawer.draw(tree, svgPreview, $theme === 'dark' ? 'dark' : 'light');
		});
	}
	
	
	function selectSmiles(smiles: string) {
		selectedSmiles = smiles;
		drawMolecule(selectedSmiles);
	}
	
	function insertSmiles(smiles: string) {
		editor.chain().focus().insertContent({
			type: 'smiles',
			attrs: { smiles, label: 'Chem' }
		}).run();
		dispatch('close');
	}
</script>

<div
	class="fixed top-0 left-full ml-2 z-50 w-72 overflow-hidden rounded border dark:border-slate-800 border-gray-200 dark:bg-black bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1"
>
	<div class="flex items-center gap-2 mb-2">
		<FlaskConical size="16" class="text-blue-500" />
		<span class="text-sm font-medium">Common SMILES</span>
	</div>

	{#if selectedSmiles}
		<div class="mb-2 p-2 border dark:border-slate-800 border-gray-200 rounded">
			<svg bind:this={svgPreview} data-smiles={selectedSmiles} />
			<div class="mt-1 text-center text-sm font-medium">{selectedSmiles}</div>
			<div class="flex justify-center mt-2">
				<button
					type="button"
					class="px-2 py-1 text-xs rounded-md text-white bg-blue-500 hover:bg-blue-600"
					on:click={() => insertSmiles(selectedSmiles)}
				>
					Insert
				</button>
			</div>
		</div>
	{/if}

	<div class="space-y-1 max-h-48 overflow-y-auto">
		{#each commonSmiles as chemical}
			<button
				type="button"
				class="w-full flex items-center justify-between px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-800 {selectedSmiles === chemical.smiles ? 'bg-blue-50 dark:bg-blue-900/30' : ''}"
				on:click={() => selectSmiles(chemical.smiles)}
			>
				<span>{chemical.name}</span>
				<span class="text-xs text-gray-500 dark:text-slate-400">{chemical.smiles}</span>
			</button>
		{/each}
	</div>

	<div class="mt-2 pt-2 border-t dark:border-slate-800 border-gray-200">
		<form
			on:submit|preventDefault={(e) => {
				const input = anyify(e.target)[0];
				const smiles = input.value;
				if (smiles) {
					insertSmiles(smiles);
				}
			}}
			class="flex gap-1"
		>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus
				type="text"
				bind:value={customSmiles}
				placeholder="Enter custom SMILES"
				class="flex-1 dark:bg-black bg-white p-1 text-sm outline-none rounded border dark:border-slate-800 border-gray-200"
			/>
			<button
				type="submit"
				class="flex items-center rounded p-1 text-gray-600 transition-all dark:text-slate-300 hover:bg-slate-800 hover:bg-gray-100"
			>
				<Check class="h-4 w-4" />
			</button>
		</form>
	</div>
</div> 

<style>
    svg {
        width: 100%;
        height: auto;
    }
</style>