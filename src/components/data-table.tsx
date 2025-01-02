"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  FilterFn,
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

type FilterOption = {
  value: string;
  label: string;
  type: "string" | "number";
};

type WorkloadFilter = {
  value: number;
  operator: ">" | "<" | "=";
};

const filterOptions: FilterOption[] = [
  { value: "employee_id", label: "Employee ID", type: "string" },
  { value: "name", label: "Name", type: "string" },
  { value: "email", label: "Email", type: "string" },
  { value: "phone", label: "Phone", type: "string" },
  { value: "team", label: "Team", type: "string" },
  { value: "skill", label: "Skill", type: "string" },
  { value: "current_workload", label: "Current Workload", type: "number" },
];

const workloadOperators = [
  { value: ">", label: "Greater than" },
  { value: "<", label: "Less than" },
  { value: "=", label: "Equal to" },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedFilter, setSelectedFilter] = React.useState<string>("name");
  const [workloadFilter, setWorkloadFilter] = React.useState<WorkloadFilter>({
    value: 0,
    operator: ">",
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    filterFns: {
      workload: (row, columnId, filterValue: WorkloadFilter) => {
        const cellValue = row.getValue(columnId) as number;
        switch (filterValue.operator) {
          case ">":
            return cellValue > filterValue.value;
          case "<":
            return cellValue < filterValue.value;
          case "=":
            return cellValue === filterValue.value;
          default:
            return true;
        }
      },
    },
  });

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    table.getColumn(value)?.setFilterValue("");
  };

  const handleWorkloadChange = (value: string, type: "value" | "operator") => {
    const newFilter = {
      ...workloadFilter,
      [type]: type === "value" ? Number(value) : value,
    };
    setWorkloadFilter(newFilter);
    table.getColumn("current_workload")?.setFilterValue(newFilter);
  };

  const currentFilterOption = filterOptions.find(
    (option) => option.value === selectedFilter
  );

  const renderSearchInput = () => {
    if (selectedFilter === "current_workload") {
      return (
        <div className="flex space-x-2 flex-1">
          <Select
            value={workloadFilter.operator}
            onValueChange={(value) => handleWorkloadChange(value, "operator")}
          >
            <SelectTrigger className="w-[12vw] bg-gray-100">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {workloadOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-[1vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
            <Input
              type="number"
              placeholder="Enter workload value..."
              value={workloadFilter.value}
              onChange={(e) => handleWorkloadChange(e.target.value, "value")}
              className="pl-[2vw] pr-[2vw] py-[1vw] w-full bg-gray-100 rounded-lg"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex-1">
        <Search className="absolute left-[1vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
        <Input
          placeholder={`Search ${currentFilterOption?.label || "Employee"}...`}
          value={
            (table.getColumn(selectedFilter)?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn(selectedFilter)?.setFilterValue(e.target.value)
          }
          className="pl-[2vw] pr-[2vw] py-[1vw] w-full bg-gray-100 rounded-lg"
        />
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col flex-grow justify-center items-center w-[78vw] mx-[3vw]">
        <div className="w-full">
          {/* Search and Filter Section */}
          <div className="flex items-center space-x-2 py-[2vw] text-[1.25vw]">
            {renderSearchInput()}

            {/* Filter Dropdown */}
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[16vw] bg-gray-100">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border aspect-[1312/600]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                      className="flex-row items-center"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[6vw] text-center text-[1.25vw]"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-[1vw] mt-[1vw]">
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
    </>
  );
}
