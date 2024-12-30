"use client"

import { useCallback } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import debounce from 'lodash/debounce';

interface SearchBarProps {
  onSearch: (query: string) => Promise<any[]>;
  onSelect: (employee: any) => void;
}

export const SearchBar = ({ onSearch, onSelect }: SearchBarProps) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search employee..."
        onValueChange={debouncedSearch}
        className="h-9"
      />
      {loading && <CommandEmpty>Searching...</CommandEmpty>}
      {!loading && <CommandEmpty>No employee found.</CommandEmpty>}
      <CommandGroup>
        {results.map((employee) => (
          <CommandItem
            key={employee.id}
            onSelect={() => onSelect(employee)}
          >
            <div className="flex items-center">
              <span>{employee.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                (ID-{employee.id})
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
};

// components/ProfileHeader.tsx
interface ProfileHeaderProps {
  employee?: {
    id: string;
    name: string;
    position: string;
    department: string;
    avatar?: string;
  } | null;
}

export const ProfileHeader = ({ employee }: ProfileHeaderProps) => {
  if (!employee) {
    return (
      <div className="flex items-center gap-4 p-6 bg-navy-900 rounded-lg w-full">
        <p className="text-white">Select an employee to view their tasks</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-6 bg-navy-900 rounded-lg w-full">
      <div className="h-16 w-16 rounded-full overflow-hidden">
        <img
          src={employee.avatar || "/placeholder-avatar.png"}
          alt={employee.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-white">{employee.name}</h2>
        <p className="text-gray-400">ID-{employee.id}</p>
      </div>
      <div className="text-right">
        <p className="text-gray-400">{employee.position}</p>
        <p className="text-gray-400">{employee.department}</p>
      </div>
    </div>
  );
};

// components/NewTaskModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
}

export const NewTaskModal = ({ open, onClose, employeeId }: NewTaskModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [taskData, setTaskData] = useState({
    name: '',
    workload: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement task creation logic
    // Will be integrated with backend later
    console.log('Task Data:', { ...taskData, startDate, endDate, employeeId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Name *</label>
            <Input
              required
              value={taskData.name}
              onChange={e => setTaskData({ ...taskData, name: e.target.value })}
              placeholder="Enter Task Name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Workload *</label>
            <Input
              required
              value={taskData.workload}
              onChange={e => setTaskData({ ...taskData, workload: e.target.value })}
              placeholder="Enter Task Workload"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              required
              className="w-full min-h-[100px] p-2 rounded-md border resize-none"
              value={taskData.description}
              onChange={e => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Enter Task Description"
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};