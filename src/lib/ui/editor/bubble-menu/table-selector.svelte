<script lang="ts">
  import { cn } from '$lib/utils';
  import { Editor } from '@tiptap/core';
  import { Table, TableRow, TableCell } from 'lucide-svelte';

  export let editor: Editor;
  export let isVisible = false;

  let showForm = false;
  let rows = 3;
  let cols = 3;

  function insertTable() {
    editor.chain().focus().insertTable({ rows, cols }).run();
    showForm = false;
  }

  function deleteTable() {
    editor.chain().focus().deleteTable().run();
  }

  function addRow() {
    editor.chain().focus().addRow().run();
  }

  function deleteRow() {
    editor.chain().focus().deleteRow().run();
  }

  function addCell() {
    editor.chain().focus().addCell().run();
  }

  function deleteCell() {
    editor.chain().focus().deleteCell().run();
  }
</script>

<div class="flex items-center gap-1">
  <button
    class={cn(
      'flex h-8 w-8 items-center justify-center rounded-md p-1 text-sm font-medium',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50'
    )}
    on:click={() => (showForm = !showForm)}
    disabled={!isVisible}
  >
    <Table class="h-4 w-4" />
  </button>

  {#if showForm}
    <div
      class="absolute left-0 top-full z-50 mt-2 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
    >
      <form on:submit|preventDefault={insertTable} class="space-y-4">
        <div class="space-y-2">
          <label for="rows" class="text-sm font-medium">Rows</label>
          <input
            type="number"
            id="rows"
            bind:value={rows}
            min="1"
            max="10"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div class="space-y-2">
          <label for="cols" class="text-sm font-medium">Columns</label>
          <input
            type="number"
            id="cols"
            bind:value={cols}
            min="1"
            max="10"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            on:click={() => (showForm = false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Insert
          </button>
        </div>
      </form>
    </div>
  {/if}

  <button
    class={cn(
      'flex h-8 w-8 items-center justify-center rounded-md p-1 text-sm font-medium',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50'
    )}
    on:click={addRow}
    disabled={!isVisible}
  >
    <TableRow class="h-4 w-4" />
  </button>

  <button
    class={cn(
      'flex h-8 w-8 items-center justify-center rounded-md p-1 text-sm font-medium',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50'
    )}
    on:click={addCell}
    disabled={!isVisible}
  >
    <TableCell class="h-4 w-4" />
  </button>

  <button
    class={cn(
      'flex h-8 w-8 items-center justify-center rounded-md p-1 text-sm font-medium text-destructive',
      'hover:bg-destructive hover:text-destructive-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50'
    )}
    on:click={deleteTable}
    disabled={!isVisible}
  >
    <Table class="h-4 w-4" />
  </button>
</div> 