"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import Searchbar from "@/components/organisms/SearchBarTask";
import { Task } from "@/app/task/types";
import { taskService } from "./api";
import { Plus } from "lucide-react";
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
    if (searchQuery.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getAllTasks();
      if (fetchedTasks?.data && Array.isArray(fetchedTasks.data)) {
        setTasks(fetchedTasks.data);
        setFilteredTasks(fetchedTasks.data);
      } else {
        console.error(
          "Fetched tasks are not in expected format:",
          fetchedTasks
        );
        setTasks([]);
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = {
    Todo: filteredTasks.filter((task) => task.status === "Todo"),
    Ongoing: filteredTasks.filter((task) => task.status === "Ongoing"),
    Complete: filteredTasks.filter((task) => task.status === "Complete"),
  };

  const statusColors = {
    Todo: "bg-blue-100 text-blue-800",
    Ongoing: "bg-yellow-100 text-yellow-800",
    Complete: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-orange-100 text-orange-800",
    Normal: "bg-gray-100 text-gray-800",
  };

  const renderTaskCard = (task: Task) => (
    <motion.div
      key={task.task_Id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 bg-gray-50 rounded-lg"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {task.assigns?.map((assign) => (
            <div
              key={assign.employee_Id}
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              {assign.employee?.image ? (
                <img
                  src={assign.employee.image}
                  alt={assign.employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">
                  {assign.employee?.name?.charAt(0) || "?"}
                </span>
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-500">
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
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{task.title}</span>
          {task.description && (
            <span className="text-sm text-gray-500">{task.description}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            statusColors[task.status]
          }`}
        >
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(task.end_Date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex -space-x-2">
          {task.assigns?.map((assign) => (
            <div
              key={assign.employee_Id}
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              {assign.employee?.image ? (
                <img
                  src={assign.employee.image}
                  alt={assign.employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">
                  {assign.employee?.name?.charAt(0) || "?"}
                </span>
              )}
            </div>
          ))}
        </div>
      </td>
    </motion.tr>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div
            className={`flex-1 max-h-screen py-[1vw] px-[1.667vw] ml-[0.417vw] w-[80vw] space-y-[1.25vw] transition-all duration-300 ease-in-out`}
          >
            <div className="flex-1 flex flex-col overflow-hidden">
              <Searchbar />

              <main className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Tasks
                      </h1>
                      <p className="text-sm text-gray-500">
                        {filteredTasks.length} tasks total
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewType("board")}
                          className={`px-4 py-2 rounded-md transition-all ${
                            viewType === "board"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          Board
                        </button>
                        <button
                          onClick={() => setViewType("list")}
                          className={`px-4 py-2 rounded-md transition-all ${
                            viewType === "list"
                              ? "bg-white shadow text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          List
                        </button>
                      </div>

                      {(user?.role === "Manager" || user?.role === "PIC") && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus size={20} />
                          Create Task
                        </button>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      {viewType === "board" ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {Object.entries(groupedTasks).map(
                            ([status, statusTasks]) => (
                              <motion.div
                                key={status}
                                layout
                                className="bg-white rounded-lg shadow-sm"
                              >
                                <div className="p-4 border-b">
                                  <h2 className="font-semibold text-gray-900">
                                    {status}
                                  </h2>
                                  <span className="text-sm text-gray-500">
                                    {statusTasks.length} tasks
                                  </span>
                                </div>
                                <div className="p-4 space-y-4">
                                  <AnimatePresence>
                                    {statusTasks.map((task) =>
                                      renderTaskCard(task)
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Due Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Assignees
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredTasks.map((task) => renderTaskRow(task))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </main>
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
