import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, X } from 'lucide-react';

// Types
type Employee = {
  employee_Id: string;
  name: string;
  team: string;
  image: string;
  email: string;
  phone: string;
  skill: string;
  role: string;
  current_Workload: number;
  start_Date: string;
};

type ApiResponse = {
  data: Employee[];
  error: string | null;
};

export default function SearchBarActivity() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const teamDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const responseData: ApiResponse = await response.json();

        if (responseData.error) {
          throw new Error(responseData.error);
        }

        setEmployees(responseData.data);
        const uniqueTeams = Array.from(new Set(responseData.data.map(emp => emp.team)));
        setTeams(uniqueTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setIsTeamDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees based on search and selected teams
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      employee.employee_Id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesTeam = 
      selectedTeams.length === 0 || selectedTeams.includes(employee.team);
    return matchesSearch && matchesTeam;
  });

  const handleEmployeeSelect = (employeeId: string) => {
    router.push(`/activity/${employeeId}`);
    setIsSearchFocused(false);
    setSearchValue("");
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading employees: {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[0.833vw] w-full py-[0.417vw]">
      {/* Search Bar */}
      <div className="relative flex-1" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={isLoading ? "Loading employees..." : "Search employees by name or ID..."}
            className="text-[1vw] w-full pl-[2.083vw] pr-[0.833vw] py-[0.625vw] rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            disabled={isLoading}
          />
          <Search className="absolute left-[0.625vw] top-1/2 -translate-y-1/2 w-[1vw] h-[1vw] text-gray-400" />
        </div>

        {/* Search Suggestions Dropdown */}
        {isSearchFocused && !isLoading && (
          <div className="absolute w-full mt-[0.208vw] bg-white rounded-lg shadow-lg border border-gray-200 max-h-[13.333vw] overflow-y-auto z-20">
            {filteredEmployees.slice(0, 10).length === 0 ? (
              <div className="px-[0.833vw] py-[0.625vw] text-gray-500">No employees found</div>
            ) : (
              filteredEmployees.slice(0, 10).map((employee) => (
                <div
                  key={employee.employee_Id}
                  onClick={() => handleEmployeeSelect(employee.employee_Id)}
                  className="px-[0.833vw] py-[0.625vw] hover:bg-gray-50 cursor-pointer"
                >
                  <div className="text-[1vw] font-medium">{employee.name}</div>
                  <div className="text-[0.729vw] text-gray-500">
                    {employee.employee_Id} • {employee.team}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Team Filter */}
      <div className="relative" ref={teamDropdownRef}>
        <button
          onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
          className="flex items-center gap-[0.417vw] px-[0.833vw] py-[0.625vw] rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <span className="text-[1vw] font-medium">
            Teams ({selectedTeams.length})
          </span>
          <ChevronDown className="w-[1vw] h-[1vw]" />
        </button>

        {/* Teams Dropdown */}
        {isTeamDropdownOpen && !isLoading && (
          <div className="absolute right-0 mt-[0.417vw] w-[16vw] bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-[0.417vw] space-y-[0.417vw]">
            {teams.map(team => (
              <label
                key={team}
                className="flex items-center gap-[0.417vw] px-[0.833vw] py-[0.417vw] hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team)}
                  onChange={() => toggleTeam(team)}
                  className="w-[0.833vw] h-[0.833vw] rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[1vw]">{team}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
