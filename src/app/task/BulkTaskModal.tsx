"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Check,
  ChevronDown,
  FileText,
  Tag,
  AlertCircle,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Employee } from "@/app/task/types";
import { cn } from "@/lib/utils";

interface CreateTaskModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  employee_Ids: string[];
  title: string;
  type: string;
  description: string;
  status: string;
  priority: "High" | "Medium" | "Normal";
  workload: number;
  start_Date: string;
  end_Date: string;
}

export default function CreateTaskModal({
  userId,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<FormData>({
    employee_Ids: [],
    title: "",
    type: "",
    description: "",
    status: "Todo",
    priority: "Normal",
    workload: 0,
    start_Date: "",
    end_Date: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );
      const result = await response.json();

      if (Array.isArray(result)) {
        setEmployees(result);
        setFilteredEmployees(result);
      } else if (result.data && Array.isArray(result.data)) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setFilteredEmployees([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAssignee = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      employee_Ids: prev.employee_Ids.includes(employeeId)
        ? prev.employee_Ids.filter((id) => id !== employeeId)
        : [...prev.employee_Ids, employeeId],
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getSelectedEmployeesText = () => {
    const selectedEmployees = employees.filter((emp) =>
      formData.employee_Ids.includes(emp.employee_Id)
    );
    return (
      selectedEmployees.map((emp) => emp.name).join(", ") ||
      "Select employees..."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setLoading(true);
    setError("");

    try {
        const formattedData = {
          ...formData,
          workload: Number(formData.workload),
        };
    
        if (formattedData.employee_Ids.length === 0) {
          throw new Error("Please select at least one employee");
        }
    
        if (new Date(formattedData.end_Date) < new Date(formattedData.start_Date)) {
          throw new Error("End date cannot be earlier than start date");
        }
    
        console.log('Sending data:', formattedData);
    
        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/add/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          }
        );
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to create task: ${response.status}`);
        }
    
        const responseData = await response.json();
        console.log('Response:', responseData); 
    
        setShowConfirmation(false);
        setShowSuccess(true);
    
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
          onClose();
        }, 1500);
      } catch (error) {
        console.error("Error creating task:", error);
        setError(error instanceof Error ? error.message : "Failed to create task. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-[0.833vw] z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-[50vw] max-w-[60vw] h-[80vh] max-h-[90vh] overflow-y-auto relative"
      >
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </motion.div>
                <p className="text-xl font-semibold text-green-600">
                  Task created successfully!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Type
              </label>
              <input
                type="text"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter task type"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter task description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Workload (0 - 10)
              </label>
              <input
                type="number"
                name="workload"
                required
                min="0"
                max="10"
                value={formData.workload}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                name="start_Date"
                required
                value={formData.start_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                name="end_Date"
                required
                value={formData.end_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignees
              </label>
              <div className="relative">
                <div
                  className={cn(
                    "w-full border rounded-md cursor-pointer transition-all",
                    isDropdownOpen && "ring-2 ring-blue-500 border-blue-500"
                  )}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="p-3 min-h-[42px] flex items-center justify-between">
                    <span className="text-sm">
                      {getSelectedEmployeesText()}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isDropdownOpen && "transform rotate-180"
                      )}
                    />
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border rounded-md shadow-lg z-10">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full pl-10 pr-4 py-2 border rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredEmployees.map((employee) => (
                        <div
                          key={employee.employee_Id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleAssignee(employee.employee_Id)}
                        >
                          <div className="relative">
                            <img
                              src={employee.image || "/api/placeholder/32/32"}
                              alt={employee.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            {formData.employee_Ids.includes(
                              employee.employee_Id
                            ) && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {employee.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.team} • {employee.skill}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm bg-red-50 p-3 rounded-md flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Task Creation
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Title</span>
                        <p className="text-sm font-medium">{formData.title}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Type</span>
                        <p className="text-sm font-medium">{formData.type}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Priority</span>
                        <p className="text-sm font-medium">
                          {formData.priority}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Workload</span>
                        <p className="text-sm font-medium">
                          {formData.workload}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Start Date
                        </span>
                        <p className="text-sm font-medium">
                          {new Date(formData.start_Date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">End Date</span>
                        <p className="text-sm font-medium">
                          {new Date(formData.end_Date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Description</span>
                      <p className="text-sm font-medium">
                        {formData.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <p className="text-sm font-medium">{formData.status}</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Assignees</span>
                      <p className="text-sm font-medium">
                        {getSelectedEmployeesText()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Are you sure you want to create this task?
                  </p>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmedSubmit}
                    disabled={loading}
                    className={cn(
                      "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2",
                      loading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Creating..." : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
