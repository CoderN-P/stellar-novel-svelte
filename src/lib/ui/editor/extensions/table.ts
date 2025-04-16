import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface TableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    table: {
      /**
       * Add a new table
       */
      insertTable: (options?: { rows?: number; cols?: number }) => ReturnType;
      /**
       * Delete the current table
       */
      deleteTable: () => ReturnType;
      /**
       * Add a column at the current position
       */
      addColumnBefore: () => ReturnType;
      addColumnAfter: () => ReturnType;
      /**
       * Delete a column at the current position
       */
      deleteColumn: () => ReturnType;
      /**
       * Add a row at the current position
       */
      addRowBefore: () => ReturnType;
      addRowAfter: () => ReturnType;
      /**
       * Delete a row at the current position
       */
      deleteRow: () => ReturnType;
      /**
       * Toggle header row
       */
      toggleHeaderRow: () => ReturnType;
      /**
       * Toggle header column
       */
      toggleHeaderColumn: () => ReturnType;
      /**
       * Toggle header cell
       */
      toggleHeaderCell: () => ReturnType;
      /**
       * Merge cells
       */
      mergeCells: () => ReturnType;
      /**
       * Split cell
       */
      splitCell: () => ReturnType;
    };
  }
}

export const Table = Node.create<TableOptions>({
  name: 'table',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'tableRow+',

  tableRole: 'table',

  parseHTML() {
    return [
      {
        tag: 'table',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertTable:
        (options = {}) =>
        ({ commands }) => {
          const rows = options.rows || 3;
          const cols = options.cols || 3;
          const cells = Array(cols).fill('<td></td>').join('');
          const tableRows = Array(rows)
            .fill(`<tr>${cells}</tr>`)
            .join('');
          return commands.insertContent(`<table>${tableRows}</table>`);
        },
      deleteTable:
        () =>
        ({ commands }) => {
          return commands.deleteNode('table');
        },
      addColumnBefore:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.left;

          if (dispatch) {
            const cells = map.cellsInColumn(index).map((pos) => {
              const cell = table.node.nodeAt(pos);
              if (cell) {
                return cell.type.create(cell.attrs);
              }
            });

            const newCells = cells.map((cell) => {
              if (cell) {
                return ['td', 0, ['p', 0]];
              }
            });

            const newRow = ['tr', 0, ...newCells];
            const tableWithNewColumn = ['table', 0, ...table.node.content.content.map((row) => {
              return ['tr', 0, ...row.content.content, ...newCells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithNewColumn.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      addColumnAfter:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.right - 1;

          if (dispatch) {
            const cells = map.cellsInColumn(index).map((pos) => {
              const cell = table.node.nodeAt(pos);
              if (cell) {
                return cell.type.create(cell.attrs);
              }
            });

            const newCells = cells.map((cell) => {
              if (cell) {
                return ['td', 0, ['p', 0]];
              }
            });

            const tableWithNewColumn = ['table', 0, ...table.node.content.content.map((row) => {
              return ['tr', 0, ...row.content.content, ...newCells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithNewColumn.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      deleteColumn:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.left;

          if (dispatch) {
            const tableWithoutColumn = ['table', 0, ...table.node.content.content.map((row) => {
              const cells = row.content.content.filter((_, i) => i !== index);
              return ['tr', 0, ...cells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithoutColumn.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      addRowBefore:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.top;

          if (dispatch) {
            const row = table.node.content.child(index);
            const cells = row.content.content.map((cell) => {
              return ['td', 0, ['p', 0]];
            });

            const newRow = ['tr', 0, ...cells];
            const tableWithNewRow = ['table', 0, ...table.node.content.content.slice(0, index), newRow, ...table.node.content.content.slice(index)];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithNewRow.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      addRowAfter:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.bottom - 1;

          if (dispatch) {
            const row = table.node.content.child(index);
            const cells = row.content.content.map((cell) => {
              return ['td', 0, ['p', 0]];
            });

            const newRow = ['tr', 0, ...cells];
            const tableWithNewRow = ['table', 0, ...table.node.content.content.slice(0, index + 1), newRow, ...table.node.content.content.slice(index + 1)];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithNewRow.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      deleteRow:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.top;

          if (dispatch) {
            const tableWithoutRow = ['table', 0, ...table.node.content.content.slice(0, index), ...table.node.content.content.slice(index + 1)];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithoutRow.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      toggleHeaderRow:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.top;

          if (dispatch) {
            const row = table.node.content.child(index);
            const cells = row.content.content.map((cell) => {
              const type = cell.type.name === 'tableHeader' ? 'tableCell' : 'tableHeader';
              return [type, 0, ['p', 0]];
            });

            const newRow = ['tr', 0, ...cells];
            const tableWithToggledHeader = ['table', 0, ...table.node.content.content.slice(0, index), newRow, ...table.node.content.content.slice(index + 1)];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithToggledHeader.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      toggleHeaderColumn:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const rect = map.rectBetween(selection.from, selection.from);
          const index = rect.left;

          if (dispatch) {
            const tableWithToggledHeader = ['table', 0, ...table.node.content.content.map((row) => {
              const cells = row.content.content.map((cell, i) => {
                if (i === index) {
                  const type = cell.type.name === 'tableHeader' ? 'tableCell' : 'tableHeader';
                  return [type, 0, ['p', 0]];
                }
                return cell;
              });
              return ['tr', 0, ...cells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithToggledHeader.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      toggleHeaderCell:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const pos = map.cellAround(selection.from);
          if (!pos) return false;

          const cell = table.node.nodeAt(pos);
          if (!cell) return false;

          if (dispatch) {
            const type = cell.type.name === 'tableHeader' ? 'tableCell' : 'tableHeader';
            const newCell = [type, 0, ['p', 0]];

            dispatch(tr.setNodeMarkup(pos, null, cell.attrs));

            const tableWithToggledCell = ['table', 0, ...table.node.content.content.map((row) => {
              const cells = row.content.content.map((c) => {
                if (c === cell) {
                  return newCell;
                }
                return c;
              });
              return ['tr', 0, ...cells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithToggledCell.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      mergeCells:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const cells = map.cellsInRange(selection);
          if (cells.length < 2) return false;

          if (dispatch) {
            const firstCell = table.node.nodeAt(cells[0]);
            if (!firstCell) return false;

            const attrs = { ...firstCell.attrs, colspan: cells.length };
            const newCell = ['td', attrs, ['p', 0]];

            const tableWithMergedCells = ['table', 0, ...table.node.content.content.map((row) => {
              const cells = row.content.content.map((cell, i) => {
                if (cells.includes(i)) {
                  return i === cells[0] ? newCell : null;
                }
                return cell;
              }).filter(Boolean);
              return ['tr', 0, ...cells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithMergedCells.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
      splitCell:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const table = findTable(selection);
          if (!table) return false;

          const map = TableMap.get(table.node);
          const pos = map.cellAround(selection.from);
          if (!pos) return false;

          const cell = table.node.nodeAt(pos);
          if (!cell) return false;

          if (dispatch) {
            const attrs = { ...cell.attrs, colspan: 1 };
            const newCell = ['td', attrs, ['p', 0]];

            const tableWithSplitCell = ['table', 0, ...table.node.content.content.map((row) => {
              const cells = row.content.content.map((c) => {
                if (c === cell) {
                  return [newCell, newCell];
                }
                return c;
              }).flat();
              return ['tr', 0, ...cells];
            })];

            dispatch(tr.replaceWith(
              table.pos,
              table.pos + table.node.nodeSize,
              state.schema.nodeFromJSON({
                type: 'table',
                content: tableWithSplitCell.slice(2).map((row) => ({
                  type: 'tableRow',
                  content: row.slice(2).map((cell) => ({
                    type: cell[0] === 'th' ? 'tableHeader' : 'tableCell',
                    content: [{ type: 'paragraph' }],
                  })),
                })),
              })
            ));
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-t': () => this.editor.commands.insertTable({ rows: 3, cols: 3 }),
      'Mod-Backspace': () => this.editor.commands.deleteTable(),
      'Mod-Alt-0': () => this.editor.commands.toggleHeaderRow(),
      'Mod-Alt-\\': () => this.editor.commands.toggleHeaderColumn(),
      'Mod-Alt-]': () => this.editor.commands.toggleHeaderCell(),
      'Mod-Alt-[': () => this.editor.commands.mergeCells(),
      'Mod-Alt-=': () => this.editor.commands.splitCell(),
      'Mod-Alt-+': () => this.editor.commands.addColumnAfter(),
      'Mod-Alt--': () => this.editor.commands.deleteColumn(),
      'Mod-Alt-Enter': () => this.editor.commands.addRowAfter(),
      'Mod-Alt-Backspace': () => this.editor.commands.deleteRow(),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableResize'),
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement;
              if (!target.classList.contains('table-resize-handle')) return false;

              const table = findTable(view.state.selection);
              if (!table) return false;

              const startX = event.pageX;
              const startWidth = target.parentElement?.offsetWidth || 0;

              const onMouseMove = (e: MouseEvent) => {
                const currentX = e.pageX;
                const diff = currentX - startX;
                const newWidth = Math.max(50, startWidth + diff);
                if (target.parentElement) {
                  target.parentElement.style.width = `${newWidth}px`;
                }
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);

              return true;
            },
          },
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                const table = findTable(selection);
                if (!table || table.pos !== pos) return;

                const map = TableMap.get(node);
                const cells = map.cellsInRange(selection);

                cells.forEach((cellPos) => {
                  const cell = node.nodeAt(cellPos);
                  if (!cell) return;

                  const dom = document.createElement('div');
                  dom.classList.add('table-resize-handle');
                  dom.style.position = 'absolute';
                  dom.style.right = '-5px';
                  dom.style.top = '0';
                  dom.style.bottom = '0';
                  dom.style.width = '10px';
                  dom.style.cursor = 'col-resize';
                  dom.style.zIndex = '10';

                  decorations.push(
                    Decoration.widget(cellPos + cell.nodeSize - 1, () => dom, {
                      side: 1,
                    })
                  );
                });
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Helper function to find a table in the document
function findTable(selection: any) {
  const { $anchor } = selection;
  for (let depth = $anchor.depth; depth > 0; depth--) {
    const node = $anchor.node(depth);
    if (node.type.name === 'table') {
      return { pos: $anchor.start(depth), node };
    }
  }
  return null;
}

// TableMap class to help with table operations
class TableMap {
  width: number;
  height: number;
  map: number[];
  cells: any[];

  constructor(table: any) {
    this.width = 0;
    this.height = 0;
    this.map = [];
    this.cells = [];

    let pos = 0;
    table.descendants((node: any, pos: number) => {
      if (node.type.name === 'tableRow') {
        this.height++;
        let rowWidth = 0;
        node.forEach((cell: any) => {
          const colspan = cell.attrs.colspan || 1;
          const rowspan = cell.attrs.rowspan || 1;
          for (let i = 0; i < colspan; i++) {
            for (let j = 0; j < rowspan; j++) {
              if (i === 0 && j === 0) {
                this.cells.push(cell);
                this.map.push(pos);
              } else {
                this.map.push(-1);
              }
            }
          }
          rowWidth += colspan;
        });
        this.width = Math.max(this.width, rowWidth);
      }
    });
  }

  static get(table: any) {
    return new TableMap(table);
  }

  cellAround(pos: number) {
    for (let i = 0; i < this.map.length; i++) {
      if (this.map[i] === pos) return i;
    }
    return null;
  }

  cellsInRange(selection: any) {
    const cells: number[] = [];
    const { $anchor, $head } = selection;
    const start = Math.min($anchor.pos, $head.pos);
    const end = Math.max($anchor.pos, $head.pos);

    for (let i = 0; i < this.map.length; i++) {
      if (this.map[i] >= start && this.map[i] <= end) {
        cells.push(i);
      }
    }

    return cells;
  }

  cellsInColumn(index: number) {
    const cells: number[] = [];
    for (let i = 0; i < this.height; i++) {
      const pos = this.map[i * this.width + index];
      if (pos !== -1) {
        cells.push(pos);
      }
    }
    return cells;
  }

  rectBetween(from: number, to: number) {
    const fromIndex = this.cellAround(from);
    const toIndex = this.cellAround(to);
    if (fromIndex === null || toIndex === null) return null;

    const fromRow = Math.floor(fromIndex / this.width);
    const fromCol = fromIndex % this.width;
    const toRow = Math.floor(toIndex / this.width);
    const toCol = toIndex % this.width;

    return {
      top: Math.min(fromRow, toRow),
      bottom: Math.max(fromRow, toRow) + 1,
      left: Math.min(fromCol, toCol),
      right: Math.max(fromCol, toCol) + 1,
    };
  }
} 