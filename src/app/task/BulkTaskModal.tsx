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
    status: "Ongoing",
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

  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return 'https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ'; 
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/uploads')) {
      return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
    }
    return imageUrl;
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );
      const result = await response.json();
  
      let formattedEmployees;
      if (Array.isArray(result)) {
        formattedEmployees = result.map((emp: any) => ({
          ...emp,
          image: getImageUrl(emp.image)
        }));
      } else if (result.data && Array.isArray(result.data)) {
        formattedEmployees = result.data.map((emp: any) => ({
          ...emp,
          image: getImageUrl(emp.image)
        }));
      } else {
        formattedEmployees = [];
      }
  
      setEmployees(formattedEmployees);
      setFilteredEmployees(formattedEmployees);
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
          className="bg-white rounded-[0.417vw] shadow-xl w-[50vw] max-w-[60vw] h-[80vh] max-h-[90vh] overflow-y-auto relative"
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
                  className="flex flex-col items-center space-y-[0.833vw]"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle2 className="w-[3.333vw] h-[3.333vw] text-green-500" />
                  </motion.div>
                  <p className="text-[1.042vw] font-semibold text-green-600">
                    Task created successfully!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    
          <div className="flex justify-between items-center p-[1.25vw] border-b">
            <h2 className="text-[1.042vw] font-semibold">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-[1.25vw] h-[1.25vw]" />
            </button>
          </div>
    
          <form onSubmit={handleSubmit} className="p-[1.25vw] space-y-[1.25vw] text-[1vw]"> 
            <div className="grid grid-cols-2 gap-[1.25vw]">
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <FileText className="w-[0.833vw] h-[0.833vw]" />
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-[0.625vw] py-[0.417vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter task title"
                />
              </div>
    
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <Tag className="w-[0.833vw] h-[0.833vw]" />
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter task type"
                />
              </div>
    
              <div className="col-span-2 space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <FileText className="w-[0.833vw] h-[0.833vw]" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter task description"
                />
              </div>
    
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <AlertCircle className="w-[0.833vw] h-[0.833vw]" />
                  Priority
                </label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] appearance-none focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <ChevronDown className="w-[0.833vw] h-[0.833vw] absolute right-[0.833vw] top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
    
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <AlertCircle className="w-[0.833vw] h-[0.833vw]" />
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
                  className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
    
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <Calendar className="w-[0.833vw] h-[0.833vw]" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_Date"
                  required
                  value={formData.start_Date}
                  onChange={handleInputChange}
                  className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
    
              <div className="space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <Calendar className="w-[0.833vw] h-[0.833vw]" />
                  End Date
                </label>
                <input
                  type="date"
                  name="end_Date"
                  required
                  value={formData.end_Date}
                  onChange={handleInputChange}
                  className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
    
              <div className="col-span-2 space-y-[0.417vw]">
                <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                  <Users className="w-[0.833vw] h-[0.833vw]" />
                  Assignees
                </label>
                <div className="relative">
                  <div
                    className={cn(
                      "w-full border rounded-[0.208vw] cursor-pointer transition-all",
                      isDropdownOpen && "ring-[0.104vw] ring-blue-500 border-blue-500"
                    )}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="p-[0.833vw] min-h-[2.188vw] flex items-center justify-between">
                      <span className="text-[1vw]">
                        {getSelectedEmployeesText()}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-[0.833vw] h-[0.833vw] transition-transform",
                          isDropdownOpen && "transform rotate-180"
                        )}
                      />
                    </div>
                  </div>
    
                  {isDropdownOpen && (
                    <div className="absolute w-full mt-[0.417vw] bg-white border rounded-[0.208vw] shadow-lg z-10">
                      <div className="p-[0.833vw] border-b">
                        <div className="relative">
                          <Search className="absolute left-[0.833vw] top-1/2 transform -translate-y-1/2 text-gray-400 w-[0.833vw] h-[0.833vw]" />
                          <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-[2.604vw] pr-[1.042vw] py-[0.521vw] border rounded-[0.208vw]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[16.667vw] overflow-y-auto">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.employee_Id}
                            className="flex items-center p-[0.833vw] hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => toggleAssignee(employee.employee_Id)}
                          >
                            <div className="relative">
                              <img
                                src={employee.image || "/api/placeholder/32/32"}
                                alt={employee.name}
                                className="w-[1.667vw] h-[1.667vw] rounded-full object-cover"
                              />
                              {formData.employee_Ids.includes(
                                employee.employee_Id
                              ) && (
                                <div className="absolute -top-[0.052vw] -right-[0.052vw] bg-blue-500 rounded-full p-[0.026vw]">
                                  <Check className="w-[0.625vw] h-[0.625vw] text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-[0.833vw]">
                              <div className="text-[1vw] font-medium">
                                {employee.name}
                              </div>
                              <div className="text-[0.625vw] text-gray-500">
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
                className="text-[1vw] text-red-600 bg-red-50 p-[0.833vw] rounded-[0.208vw] flex items-center gap-[0.417vw]"
              >
                <AlertCircle className="w-[0.833vw] h-[0.833vw]" />
                {error}
              </motion.div>
            )}
    
            <div className="flex justify-end gap-[1.042vw] pt-[1.042vw]">
              <button
                type="button"
                onClick={onClose}
                className="px-[1.042vw] py-[0.521vw] text-gray-600 hover:text-gray-800 transition-colors text-[1vw] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "px-[1.042vw] py-[0.521vw] bg-blue-600 text-white rounded-[0.208vw] hover:bg-blue-700 transition-colors text-[1vw] font-medium flex items-center gap-[0.417vw]",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading && <Loader2 className="w-[0.833vw] h-[0.833vw] animate-spin" />}
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
    
          <AnimatePresence>
            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-[1.042vw] z-[60]"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-[0.417vw] shadow-xl w-full max-w-[43.75vw] p-[1.563vw]"
                >
                  <h3 className="text-[1.042vw] font-semibold mb-[1.042vw]">
                    Confirm Task Creation
                  </h3>
    
                  <div className="space-y-[1.042vw]">
                    <div className="bg-gray-50 rounded-[0.208vw] p-[1.042vw] space-y-[0.833vw]"><div className="grid grid-cols-2 gap-[1.042vw]">
                    <div>
                      <span className="text-[1vw] text-gray-500">Title</span>
                      <p className="text-[1vw] font-medium">{formData.title}</p>
                    </div>
                    <div>
                      <span className="text-[1vw] text-gray-500">Type</span>
                      <p className="text-[1vw] font-medium">{formData.type}</p>
                    </div>
                    <div>
                      <span className="text-[1vw] text-gray-500">Priority</span>
                      <p className="text-[1vw] font-medium">
                        {formData.priority}
                      </p>
                    </div>
                    <div>
                      <span className="text-[1vw] text-gray-500">Workload</span>
                      <p className="text-[1vw] font-medium">
                        {formData.workload}
                      </p>
                    </div>
                    <div>
                      <span className="text-[1vw] text-gray-500">
                        Start Date
                      </span>
                      <p className="text-[1vw] font-medium">
                        {new Date(formData.start_Date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[1vw] text-gray-500">End Date</span>
                      <p className="text-[1vw] font-medium">
                        {new Date(formData.end_Date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[1vw] text-gray-500">Description</span>
                    <p className="text-[1vw] font-medium">
                      {formData.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-[1vw] text-gray-500">Status</span>
                    <p className="text-[1vw] font-medium">{formData.status}</p>
                  </div>

                  <div>
                    <span className="text-[1vw] text-gray-500">Assignees</span>
                    <p className="text-[1vw] font-medium">
                      {getSelectedEmployeesText()}
                    </p>
                  </div>
                </div>

                <p className="text-[1vw] text-gray-600">
                  Are you sure you want to create this task?
                </p>
              </div>

              <div className="flex justify-end gap-[1.042vw] mt-[1.563vw]">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  disabled={loading}
                  className="px-[1.042vw] py-[0.521vw] text-gray-600 hover:text-gray-800 transition-colors text-[1vw] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  disabled={loading}
                  className={cn(
                    "px-[1.042vw] py-[0.521vw] bg-blue-600 text-white rounded-[0.208vw] hover:bg-blue-700 transition-colors text-[1vw] font-medium flex items-center gap-[0.417vw]",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading && <Loader2 className="w-[0.833vw] h-[0.833vw] animate-spin" />}
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
