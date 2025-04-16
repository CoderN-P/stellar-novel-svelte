import { mergeAttributes, Node } from '@tiptap/core';

export interface TableHeaderOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableHeader: {
      /**
       * Convert a cell to a header cell
       */
      setHeader: () => ReturnType;
      /**
       * Convert a header cell to a regular cell
       */
      setCell: () => ReturnType;
    };
  }
}

export const TableHeader = Node.create<TableHeaderOptions>({
  name: 'tableHeader',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'tableCell',

  content: 'block+',

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'th',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHeader:
        () =>
        ({ commands }) => {
          return commands.setNode('tableHeader');
        },
      setCell:
        () =>
        ({ commands }) => {
          return commands.setNode('tableCell');
        },
    };
  },
}); 