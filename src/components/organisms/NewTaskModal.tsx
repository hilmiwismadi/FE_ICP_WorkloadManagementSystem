"use client";

import { useEffect, useState, useCallback } from "react";
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
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface CreateTaskModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
  employeeId?: string; // Add employeeId prop
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
  team: string;
}

interface EmailData {
  to: string;
  subject: string;
  name: string;
  title: string;
  description: string;
  deadline: string;
  task_Id: string;
}

export default function CreateTaskModal({
  userId,
  onClose,
  onSuccess,
  employeeId,
}: CreateTaskModalProps) {
  const [userRole, setUserRole] = useState<string>("");
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
    team: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Add JWT token decoding effect
  useEffect(() => {
    const authToken = Cookies.get("auth_token");
    if (authToken) {
      try {
        const decodedToken: { role: string; team: string } = jwtDecode(authToken);
        setUserRole(decodedToken.role);
        if (decodedToken.role === "PIC") {
          setFormData((prev) => ({
            ...prev,
            team: decodedToken.team
          }));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;
      
      try {
        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${employeeId}`
        );
        const result = await response.json();

        if (result.data) {
          const employee = {
            ...result.data,
            
            employee_Id: result.data.employee_Id,
            image: getImageUrl(result.data.image),
          };
          setEmployees([employee]);
          setFilteredEmployees([employee]);
          // Auto-select the employee
          setFormData(prev => ({
            ...prev,
            employee_Ids: [employee.employee_Id]
          }));
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setEmployees([]);
        setFilteredEmployees([]);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
    }
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/uploads")) {
      return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
    }
    return imageUrl;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.end_Date < formData.start_Date) {
      setErrorMessage("End date cannot be earlier than start date");
      setShowError(true);
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setLoading(true);
    setError("");
    setErrorMessage(null);
    setShowError(false);

    let createdTaskId: string | null = null;

    try {
      const formattedData = {
        ...formData,
        workload: Number(formData.workload),
      };

      if (
        new Date(formattedData.end_Date) < new Date(formattedData.start_Date)
      ) {
        throw new Error("End date cannot be earlier than start date");
      }


      // Try to create the task first
      console.log("Creating task:", formattedData);
      const taskResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/add/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      const taskResult = await taskResponse.json();
      console.log("Task creation response:", taskResult);

      // Check if the response has the expected structure
      if (taskResult.error) {
        throw new Error(taskResult.error);
      }

      if (!taskResult.data?.task_Id) {
        throw new Error("Created task ID not found in response");
      }

      createdTaskId = taskResult.data.task_Id;
      console.log("Created task ID:", createdTaskId);

      // Prepare the complete email data with task_Id
      const emailData: EmailData = {
        to: employees?.[0]?.users?.[0]?.email ?? "",
        subject: `New Task Assignment: ${formData.title}`,
        name: employees[0].name,
        title: formData.title,
        description: formData.description,
        deadline: new Date(formData.end_Date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        task_Id: createdTaskId ?? "",
      };

      // Try to send email notification
      const emailResponse = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/sendMail/assign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (!emailResponse.ok) {
        // If email fails, delete the created task
        if (createdTaskId) {
          const deleteResponse = await fetch(
            `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/delete/${createdTaskId}`,
            {
              method: "DELETE",
            }
          );

          if (!deleteResponse.ok) {
            console.error(
              "Failed to delete task during rollback:",
              await deleteResponse.text()
            );
            throw new Error(
              "Failed to send email notifications and cleanup task. Please contact support."
            );
          }
        }
        throw new Error(
          "Failed to send email notifications. Task creation has been rolled back."
        );
      }

      const emailResult = await emailResponse.json();
      console.log("Task and email notification successful:", {
        taskResult,
        emailResult,
      });

      setShowConfirmation(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error in task creation process:", error);

      // If task was created but we failed at some other point and haven't handled it yet
      if (createdTaskId) {
        try {
          console.log(
            "Rolling back task creation due to error for task ID:",
            createdTaskId
          );
          const deleteResponse = await fetch(
            `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/delete/${createdTaskId}`,
            {
              method: "DELETE",
            }
          );

          if (!deleteResponse.ok) {
            console.error(
              "Failed to delete task during rollback:",
              await deleteResponse.text()
            );
            const rollbackMessage =
              error instanceof Error
                ? `${error.message} Additionally, we couldn't clean up the created task. Please contact support.`
                : "Operation failed and cleanup was unsuccessful. Please contact support.";
            setErrorMessage(rollbackMessage);
            setShowError(true);
            setShowConfirmation(false);
            return;
          }
          console.log("Rollback successful");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
          const rollbackMessage =
            error instanceof Error
              ? `${error.message} Additionally, we couldn't clean up the created task. Please contact support.`
              : "Operation failed and cleanup was unsuccessful. Please contact support.";
          setErrorMessage(rollbackMessage);
          setShowError(true);
          setShowConfirmation(false);
          return;
        }
      }

      const message =
        error instanceof Error
          ? error.message
          : "Failed to complete the operation. Please try again.";
      setErrorMessage(message);
      setShowError(true);
      setShowConfirmation(false);
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

        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div className="bg-white rounded-lg shadow-lg w-full max-w-[40vw] p-6 flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-md font-semibold text-red-600">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setShowError(false)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
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

        <form
          onSubmit={handleSubmit}
          className="p-[1.25vw] space-y-[1.25vw] text-[1vw]"
        >
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
                step="0.1"
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
        <Tag className="w-[0.833vw] h-[0.833vw]" />
        Team to be assigned
      </label>
      <div className="relative">
        {userRole === 'PIC' ? (
          <input
            type="text"
            name="team"
            value={formData.team}
            disabled
            className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] bg-gray-100 cursor-not-allowed"
          />
        ) : (
          <>
            <select
              name="team"
              value={formData.team}
              onChange={handleInputChange}
              required
              className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] appearance-none focus:ring-[0.104vw] focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Select team...</option>
              <option value="Korporat 1">Korporat 1</option>
              <option value="Korporat 2">Korporat 2</option>
              <option value="Pelayanan Pelanggan">Pelayanan Pelanggan</option>
            </select>
            <ChevronDown className="w-[0.833vw] h-[0.833vw] absolute right-[0.833vw] top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </>
        )}
      </div>
    </div>

            <div className="col-span-2 space-y-[0.417vw]">
              <label className="text-[1vw] font-medium text-gray-700 flex items-center gap-[0.417vw]">
                <Users className="w-[0.833vw] h-[0.833vw]" />
                Assignees
              </label>
              <div className="relative">
              <div className="w-full px-[0.833vw] py-[0.521vw] border rounded-[0.208vw] bg-gray-100">
          {employees.length > 0 && (
            <div className="flex items-center">
              <img
                src={employees[0].image || "/api/placeholder/32/32"}
                alt={employees[0].name}
                className="w-[1.667vw] h-[1.667vw] rounded-full object-cover"
              />
              <div className="ml-[0.833vw]">
                <div className="text-[1vw] font-medium">
                  {employees[0].name}
                </div>
                <div className="text-[0.625vw] text-gray-500">
                  {employees[0].team} • {employees[0].skill}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
          </div>

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
              {loading && (
                <Loader2 className="w-[0.833vw] h-[0.833vw] animate-spin" />
              )}
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
                className="bg-white rounded-lg shadow-lg w-full max-w-[40vw] p-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Confirm Task Creation
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <FileText className="mr-1 w-4 h-4" />
                          Title
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {formData.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Tag className="mr-1 w-4 h-4" />
                          Type
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {formData.type}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <AlertCircle className="mr-1 w-4 h-4" />
                          Priority
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {formData.priority}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Loader2 className="mr-1 w-4 h-4" />
                          Workload
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {formData.workload}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="mr-1 w-4 h-4" />
                          Start Date
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {new Date(formData.start_Date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="mr-1 w-4 h-4" />
                          End Date
                        </span>
                        <p className="text-md font-medium text-gray-700">
                          {new Date(formData.end_Date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm text-gray-500 ">
                        Description
                      </span>
                      <p className="text-md font-medium text-gray-700 max-h-[8vw] overflow-y-auto">
                        {formData.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Status</span>
                      <p className="text-md font-medium text-gray-700">
                        {formData.status}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Assignees</span>
                      <p className="text-md font-medium text-gray-700">
                      {employees[0].name}
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
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium border border-gray-300 rounded-md shadow-sm"
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