import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOptionType = "string" | "number";

export type FilterOption = {
  value: string;
  label: string;
  type: FilterOptionType;
};

const defaultFilterOptions: FilterOption[] = [
  { value: "task_id", label: "Task_ID", type: "string" as const },
  { value: "name", label: "Name", type: "string" as const },
  { value: "description", label: "Deskripsi", type: "string" as const },
  { value: "current_workload", label: "Current Workload", type: "number" as const },
];

interface SearchAndFilterProps {
  selectedFilter?: string;
  filterOptions?: FilterOption[];
  onFilterChange: (value: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentFilterOption?: FilterOption;
  filterValue?: string;
}



export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  selectedFilter = "name",
  filterOptions = defaultFilterOptions,
  onFilterChange,
  onInputChange,
  currentFilterOption,
  filterValue = "",
}) => {
  return (
    <div className="flex items-center space-x-2 py-[1vw] text-[1.25vw] w-[80vw] mx-auto">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-[1vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
        <Input
          placeholder={`Search ${currentFilterOption?.label || "Employee"}...`}
          value={filterValue}
          onChange={onInputChange}
          type={currentFilterOption?.type === "number" ? "number" : "text"}
          className="pl-[2vw] pr-[2vw] py-[1vw] w-full bg-gray-100 rounded-lg"
        />
      </div>

      {/* Filter Dropdown */}
      <Select value={selectedFilter} onValueChange={onFilterChange}>
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
  );
};

export default SearchAndFilter;