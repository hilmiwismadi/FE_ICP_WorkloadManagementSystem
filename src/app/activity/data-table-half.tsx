import * as React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// WorkloadStatusBar Component
const WorkloadStatusBar = ({ value }: { value: number }) => {
  const normalize = value / 15; // Normalize to percentage based on max workload of 15
  const percentage = normalize * 100;

  const getColor = () => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (value === 0) {
    return (
      <div className="flex items-center space-x-2 justify-center">
        <div className="w-28 h-2 bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-sm">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 justify-center">
      <div className="w-28 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[0.875vw] text-gray-600">
        {Number(percentage.toFixed(1))}%
      </span>
    </div>
  );
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTableHalf<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("type");
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pageSize),
    manualPagination: false,
  });

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    table.getColumn(value)?.setFilterValue("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    table.getColumn(selectedFilter)?.setFilterValue(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col justify-center items-center w-full mx-auto">
      <div className="w-full">
        {/* Search and Filter Section */}
        <div className="flex items-center space-x-2 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder={`Search...`}
              value={
                (table.getColumn(selectedFilter)?.getFilterValue() as string) ??
                ""
              }
              onChange={handleInputChange}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg"
            />
          </div>

          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[200px] bg-gray-100">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-[0.9vw] h-[0.8vw] ${
                        ["start_date", "end_date", "status"].includes(
                          header.column.id
                        )
                          ? "pl-[1vw] pr-[1vw] text-center"
                          : "pl-[1vw] pr-[3vw]"
                      }`}
                    >
                      {!header.isPlaceholder && (
                        <div
                          className={`flex items-center ${
                            ["start_date", "end_date", "status"].includes(
                              header.column.id
                            )
                              ? "justify-center"
                              : "justify-start"
                          }`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`text-[0.9vw] h-[0.8vw] ${
                          ["start_date", "end_date", "status"].includes(
                            cell.column.id
                          )
                            ? "px-[1vw] py-[0.5vw] text-center"
                            : "px-[1vw] py-[0.5vw]"
                        }`}
                      >
                        <div>
                          {cell.column.id === "workload" ? (
                            <WorkloadStatusBar
                              value={cell.getValue() as number}
                            />
                          ) : cell.column.id.includes("date") ? (
                            formatDate(cell.getValue() as Date)
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[5vw] text-left"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTableHalf;
