import { mergeAttributes, Node } from '@tiptap/core';

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCell: {
      /**
       * Add a new cell to the table
       */
      addCell: () => ReturnType;
      /**
       * Delete the current cell
       */
      deleteCell: () => ReturnType;
    };
  }
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'table',

  content: 'block*',

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'td',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      addCell:
        () =>
        ({ commands }) => {
          return commands.insertContent('<td></td>');
        },
      deleteCell:
        () =>
        ({ commands }) => {
          return commands.deleteNode('tableCell');
        },
    };
  },
}); 