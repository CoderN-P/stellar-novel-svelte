import { mergeAttributes, Node } from '@tiptap/core';

export interface TableRowOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableRow: {
      /**
       * Add a new row to the table
       */
      addRow: () => ReturnType;
      /**
       * Delete the current row
       */
      deleteRow: () => ReturnType;
    };
  }
}

export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'table',

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [
      {
        tag: 'tr',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      addRow:
        () =>
        ({ commands }) => {
          return commands.insertContent('<tr><td></td></tr>');
        },
      deleteRow:
        () =>
        ({ commands }) => {
          return commands.deleteNode('tableRow');
        },
    };
  },
}); 