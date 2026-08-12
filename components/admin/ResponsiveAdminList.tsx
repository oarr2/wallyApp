import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ResponsiveAdminColumn<TItem> = {
  key: string;
  header: string;
  cell: (item: TItem) => React.ReactNode;
  className?: string;
};

export function ResponsiveAdminList<TItem>({
  items,
  columns,
  getItemKey,
  renderCard,
  emptyMessage
}: {
  items: TItem[];
  columns: ResponsiveAdminColumn<TItem>[];
  getItemKey: (item: TItem) => string;
  renderCard: (item: TItem) => React.ReactNode;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-lime-300/20 bg-slate-900 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-lime-300/10 hover:bg-slate-900">
              {columns.map((column) => (
                <TableHead key={column.key} className={cn("text-slate-300", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={getItemKey(item)}
                className="border-slate-800 text-slate-100 hover:bg-slate-800/70"
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">{items.map(renderCard)}</div>
    </>
  );
}
