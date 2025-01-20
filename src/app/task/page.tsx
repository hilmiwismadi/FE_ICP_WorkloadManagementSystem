"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import Searchbar from "@/components/organisms/SearchBarTask";
import { Task } from "@/app/task/types";
import { taskService } from "./api";
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import BulkTaskModal from "./BulkTaskModal";
import { jwtDecode } from "jwt-decode";
import ProtectedRoute from "@/components/protected-route";

interface AuthUser {
  user_Id: string;
  email: string;
  role: string;
  employee_Id: string;
}

const TaskPage = () => {
  const [viewType, setViewType] = useState<"board" | "list">("board");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const authStorage = Cookies.get("auth_token");
    if (authStorage) {
      try {
        const userData: AuthUser = jwtDecode(authStorage);
        setUser(userData);
      } catch (error) {
        console.error("Error decoding auth token:", error);
      }
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (dateSort) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.end_Date).getTime();
        const dateB = new Date(b.end_Date).getTime();
        return dateSort === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [searchQuery, tasks, priorityFilter, statusFilter, dateSort]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getAllTasks();
      if (fetchedTasks?.data && Array.isArray(fetchedTasks.data)) {
        setTasks(fetchedTasks.data);
        setFilteredTasks(fetchedTasks.data);
      } else {
        setTasks([]);
        setFilteredTasks([]);
      }
    } catch (error) {
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = {
    Ongoing: filteredTasks.filter((task) => task.status === "Ongoing"),
    Done: filteredTasks.filter((task) => task.status === "Done"),
    Approved: filteredTasks.filter((task) => task.status === "Approved"),
  };

  const statusColors = {
    Ongoing: "bg-blue-100 text-blue-800",
    Done: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-orange-100 text-orange-800",
    Normal: "bg-gray-100 text-gray-800",
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const renderTaskCard = (task: Task) => (
    <motion.div
      key={task.task_Id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-[0.833vw] bg-gray-50 rounded-[0.5vw]"
    >
      <div className="flex justify-between items-start mb-[0.417vw]">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <span className={`px-[0.833vw] py-[0.208vw] rounded-full text-[0.833vw] ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-[1vw] text-gray-500 mb-[0.625vw]">{task.description}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex -space-x-[0.417vw]">
          {task.assigns?.map((assign) => (
            <div
              key={assign.employee_Id}
              className="w-[1.667vw] h-[1.667vw] rounded-full bg-gray-200 border-[0.104vw] border-white flex items-center justify-center overflow-hidden"
            >
              {assign.employee?.image ? (
                <img
                  src={assign.employee.image}
                  alt={assign.employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[0.833vw] text-gray-500">
                  {assign.employee?.name?.charAt(0) || "?"}
                </span>
              )}
            </div>
          ))}
        </div>
        <span className="text-[0.833vw] text-gray-500">
          Due {new Date(task.end_Date).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );

  const renderTaskRow = (task: Task) => (
    <motion.tr
      key={task.task_Id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <td className="px-[1.25vw] py-[0.833vw]">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{task.title}</span>
          {task.description && (
            <span className="text-[0.833vw] text-gray-500">{task.description}</span>
          )}
        </div>
      </td>
      <td className="px-[1.25vw] py-[0.833vw]">
        <span className={`px-[0.417vw] py-[0.208vw] rounded-full text-[0.833vw] ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </td>
      <td className="px-[1.25vw] py-[0.833vw]">
        <span className={`px-[0.417vw] py-[0.208vw] rounded-full text-[0.833vw] ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </td>
      <td className="px-[1.25vw] py-[0.833vw] text-[1vw] text-gray-500">
        {new Date(task.end_Date).toLocaleDateString()}
      </td>
      <td className="px-[1.25vw] py-[0.833vw]">
        <div className="flex -space-x-2">
          {task.assigns?.map((assign) => (
            <div
              key={assign.employee_Id}
              className="w-[1.667vw] h-[1.667vw] rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              {assign.employee?.image ? (
                <img
                  src={assign.employee.image}
                  alt={assign.employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[0.833vw] text-gray-500">
                  {assign.employee?.name?.charAt(0) || "?"}
                </span>
              )}
            </div>
          ))}
        </div>
      </td>
    </motion.tr>
  );

  const renderFiltersAndPagination = () => (
    <div className="flex items-center justify-between mb-[0.833vw] bg-gray-50 p-[0.833vw] rounded-[0.5vw]">
      <div className="flex gap-[0.833vw]">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-[0.625vw] py-[0.417vw] border rounded-[0.5vw]"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Normal">Normal</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-[0.625vw] py-[0.417vw] border rounded-[0.5vw]"
        >
          <option value="">All Statuses</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Done">Done</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div className="flex items-center gap-[0.833vw]">
        <button
          onClick={() => setDateSort(dateSort === "asc" ? "desc" : "asc")}
          className="flex items-center gap-[0.208vw] px-[0.625vw] py-[0.417vw] border rounded-[0.5vw]"
        >
          Sort by Date {dateSort === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex items-center gap-[0.417vw]">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-[0.417vw] border rounded-[0.5vw] disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-[0.417vw] border rounded-[0.5vw] disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow overflow-hidden flex items-start justify-center">
          <div className={`flex-1 h-screen py-[1vw] px-[1.667vw] ml-[0.417vw] w-[80vw] transition-all duration-300 ease-in-out`}>
            <div className="flex flex-col h-full">
              <div className="sticky top-0 bg-stale-50 z-10">
                <Searchbar />
              </div>

              <div className="sticky top-[calc(3vw)] bg-stale-50 z-10 pt-[0.833vw]">
                <div className="flex justify-between items-center ml-[0.833vw] mb-[0.833vw]">
                  <div>
                    <h1 className="text-[1.667vw] font-bold text-gray-900">Tasks</h1>
                    <p className="text-[1vw] text-gray-500">{filteredTasks.length} tasks total</p>
                  </div>

                  <div className="flex gap-[0.833vw]">
                    <div className="flex bg-gray-100 rounded-[0.5vw] p-[0.208vw]">
                      <button
                        onClick={() => setViewType("board")}
                        className={`px-[0.833vw] py-[0.208vw] rounded-md transition-all ${
                          viewType === "board" ? "bg-white shadow text-gray-900" : "text-gray-500"
                        }`}
                      >
                        Board
                      </button>
                      <button
                        onClick={() => setViewType("list")}
                        className={`px-[0.833vw] py-[0.208vw] rounded-md transition-all ${
                          viewType === "list" ? "bg-white shadow text-gray-900" : "text-gray-500"
                        }`}
                      >
                        List
                      </button>
                    </div>

                    {(user?.role === "Manager" || user?.role === "PIC") && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-[0.417vw] px-[0.833vw] py-[0.417vw] bg-blue-600 text-white rounded-[0.5vw] hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={20} />
                        Create Task
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto scrollbar-hidden">
                {loading ? (
                  <div className="flex justify-center items-center h-[13.333vw]">
                    <div className="animate-spin rounded-full h-[2.5vw] w-[2.5vw] border-b-[0.104vw] border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {viewType === "board" ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.25vw] pb-[0.833vw]">
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                          <motion.div
                            key={status}
                            layout
                            className="bg-white rounded-[0.5vw] shadow-sm flex flex-col"
                          >
                            <div className="p-[0.833vw] border-b-[0.052vw] sticky top-0 bg-white z-10">
                            <h2 className="font-semibold text-gray-900">{status}</h2>
                            <span className="text-[1vw] text-gray-500">
                              {statusTasks.length} tasks
                            </span>
                          </div>

                          <div className="flex-1 overflow-auto p-[0.833vw] space-y-[0.833vw]">
                            <AnimatePresence>
                              {statusTasks.map((task) => renderTaskCard(task))}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[0.5vw] shadow">
                      {renderFiltersAndPagination()}
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-[1.25vw] py-[0.625vw] text-left text-[0.833vw] font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-[1.25vw] py-[0.625vw] text-left text-[0.833vw] font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th className="px-[1.25vw] py-[0.625vw] text-left text-[0.833vw] font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-[1.25vw] py-[0.625vw] text-left text-[0.833vw] font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th className="px-[1.25vw] py-[0.625vw] text-left text-[0.833vw] font-medium text-gray-500 uppercase tracking-wider">
                              Assignees
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentTasks.map((task) => renderTaskRow(task))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BulkTaskModal
            userId={user?.user_Id || ""}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchTasks();
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  </ProtectedRoute>
);
};

export default TaskPage;