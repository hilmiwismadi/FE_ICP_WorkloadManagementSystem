"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import ProtectedRoute from "@/components/protected-route";
import {
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  BugIcon,
  UserPlus,
} from "lucide-react";
import { Task, Employee } from "@/app/task/types";
import { io } from "socket.io-client";
import LoadingScreen from "@/components/organisms/LoadingScreen";

export interface Comment {
  comment_Id: string;
  content: string;
  created_at: string;
  user?: { email: string; role: string };
}

export interface TimelineActivity {
  id: string;
  type: "started" | "comment" | "bug" | "completed" | "assigned";
  content: string;
  user: string;
  timestamp: string;
  userImage?: string;
}

export type Priority = "High" | "Medium" | "Normal";
export type Status = "Ongoing" | "Done" | "Approved";

// Update socket initialization to include credentials and transports
const socket = io("https://be-icpworkloadmanagementsystem.up.railway.app", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
});

const TaskDetailPage = () => {
  const { id: taskId } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [activityType, setActivityType] =
    useState<TimelineActivity["type"]>("comment");
  const [realTimeActivities, setRealTimeActivities] = useState<
    TimelineActivity[]
  >([]);

  useEffect(() => {
    const authStorage = Cookies.get("auth_token");
    if (authStorage) {
      try {
        const userData = jwtDecode(authStorage);
        setUser(userData);
      } catch (error) {
        console.error("Error decoding auth token:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Socket.IO event listeners
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      // Join task-specific room
      socket.emit("join-task", taskId);
    });

    socket.on("comment", (newComment: Comment) => {
      console.log("Received new comment:", newComment);
      // Update both comments and activities
      setComments((prev) => [...prev, newComment]);

      const newTimelineActivity: TimelineActivity = {
        id: newComment.comment_Id,
        type: "comment",
        content: newComment.content,
        user: newComment.user?.email || "Unknown User",
        timestamp: newComment.created_at,
        userImage: getEmployeeImage(newComment.user?.email),
      };

      setActivities((prev) => [...prev, newTimelineActivity]);
    });

    return () => {
      socket.off("connect");
      socket.off("comment");
      socket.emit("leave-task", taskId);
    };
  }, [taskId]);

  useEffect(() => {
    const fetchTaskAndComments = async () => {
      try {
        setLoading(true);

        const [taskResponse, commentsResponse] = await Promise.all([
          fetch(
            `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read/${taskId}`
          ),
          fetch(
            `https://be-icpworkloadmanagementsystem.up.railway.app/api/comment/read/${taskId}`
          ),
        ]);

        const [taskData, commentsData] = await Promise.all([
          taskResponse.json(),
          commentsResponse.json(),
        ]);

        setTask(taskData.data);
        setComments(commentsData.data || []);

        const timelineActivities = (commentsData.data || []).map(
          (comment: Comment) => ({
            id: comment.comment_Id,
            type: "comment" as const,
            content: comment.content,
            user: comment.user?.email || "Unknown User",
            timestamp: comment.created_at,
            userImage: getEmployeeImage(comment.user?.email),
          })
        );

        setActivities(timelineActivities);
      } catch (error) {
        console.error("Error fetching task details or comments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskAndComments();
    }
  }, [taskId]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          'https://be-icpworkloadmanagementsystem.up.railway.app/api/employee/read'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data.data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const getEmployeeImage = (email?: string) => {
    const employee = employees.find((emp) =>
      emp.users?.some((user) => user.email === email)
    );
    return (
      employee?.image ||
      "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ"
    );
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;

    try {
      setLoading(true);

      if (
        activityType === "comment" ||
        activityType === "started" ||
        activityType === "bug" ||
        activityType === "completed" ||
        activityType === "assigned"
      ) {
        // Send comment to API
        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/comment/add/${taskId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: newActivity,
              user_Id: user?.user_Id,
              task_Id: taskId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save comment to database");
        }

        const data = await response.json();

        // Emit the new comment through socket
        socket.emit("comment", {
          ...data.data,
          task_Id: taskId,
          user: {
            email: user?.email,
            role: user?.role,
          },
        });
      } else {
        // Handle other activity types as before
        const newTimelineActivity: TimelineActivity = {
          id: Date.now().toString(),
          type: activityType,
          content: newActivity,
          user: user?.email || "Unknown User",
          timestamp: new Date().toISOString(),
          userImage: getEmployeeImage(user?.email),
        };

        socket.emit("activity", {
          taskId,
          activity: newTimelineActivity,
        });

        setActivities((prev) => [...prev, newTimelineActivity]);
      }

      // Clear input
      setNewActivity("");
    } catch (error) {
      console.error("Error handling activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: TimelineActivity["type"]) => {
    switch (type) {
      case "started":
        return <Activity className="w-5 h-5 text-blue-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
      case "bug":
        return <BugIcon className="w-5 h-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "assigned":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
    }
  };

  const TimelineComponent = ({
    activities,
  }: {
    activities: TimelineActivity[];
  }) => (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex gap-4"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            {index !== activities.length - 1 && (
              <div className="absolute top-10 left-1/2 bottom-0 w-0.5 bg-gray-200 -ml-[1px]" />
            )}
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={activity.userImage}
                alt={activity.user}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-gray-900">{activity.user}</span>
              <span className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600">{activity.content}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Use realTimeActivities if available, otherwise fall back to activities
  const displayActivities =
    realTimeActivities.length > 0 ? realTimeActivities : activities;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow overflow-hidden">
          <div className="h-screen py-4 px-8 ml-2 w-[80vw] overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {/* Task Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {task?.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {task?.start_Date && task?.end_Date
                            ? `${new Date(
                                task.start_Date
                              ).toLocaleDateString()} - ${new Date(
                                task.end_Date
                              ).toLocaleDateString()}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">
                          {task?.workload} workload units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task?.priority && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "Medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                    {task?.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          task.status === "Ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "Done"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    )}
                  </div>
                </div>

                {task?.description && (
                  <p className="text-gray-600 mb-6">{task.description}</p>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Assignees</h3>
                  <div className="flex gap-3">
                    {task?.assigns?.map((assign) => {
                      const employee = employees.find(
                        (emp) => emp.employee_Id === assign.employee_Id
                      );
                      return (
                        <div
                          key={assign.employee_Id}
                          className="flex items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={
                                employee?.image ||
                                "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ"
                              }
                              alt={employee?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {employee?.skill}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Activity Input */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex gap-4 mb-4">
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(
                        e.target.value as TimelineActivity["type"]
                      )
                    }
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="comment">Comment</option>
                    <option value="bug">Bug</option>
                    <option value="started">Started</option>
                    <option value="completed">Completed</option>
                    <option value="assigned">Assigned</option>
                  </select>
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="Add an activity..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddActivity}
                    disabled={!newActivity.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Activity Timeline
                </h2>
                <TimelineComponent activities={displayActivities} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TaskDetailPage;
