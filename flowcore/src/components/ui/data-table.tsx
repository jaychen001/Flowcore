import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyText: string;
};

export function DataTable<T>({ columns, rows, getRowKey, emptyText }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--fc-border)] bg-white p-6 text-sm text-[var(--fc-text-secondary)]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold uppercase text-[var(--fc-text-secondary)]">
          <tr>
            {columns.map((column) => (
              <th className="whitespace-nowrap px-4 py-3" key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--fc-border)]">
          {rows.map((row) => (
            <tr className="hover:bg-[var(--fc-surface-muted)]" key={getRowKey(row)}>
              {columns.map((column) => (
                <td className="whitespace-nowrap px-4 py-3" key={column.key}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
