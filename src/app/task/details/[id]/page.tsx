"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Send,
  CheckCheck,
  RefreshCw,
} from "lucide-react"; 
import { Task, Employee } from "@/app/task/types";
import { io } from "socket.io-client";
import LoadingScreen from "@/components/organisms/LoadingScreen";

export interface Comment {
  comment_Id: string;
  content: string;
  created_at: string;
  type: "Started" | "Comment" | "Bug" | "Completed" | "Assigned";
  user_Id: string;
  user?: { email: string; role: string };
}

export interface TimelineActivity {
  id: string;
  type: "Started" | "Comment" | "Bug" | "Completed" | "Assigned";
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
    useState<TimelineActivity["type"]>("Comment");
  const [realTimeActivities, setRealTimeActivities] = useState<
    TimelineActivity[]
  >([]);
  const [hoverCardPosition, setHoverCardPosition] = useState<Record<string, string>>({});
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

    socket.on("comment", async (newComment: Comment) => {
      console.log("Received new comment:", newComment);
      setComments((prev) => [...prev, newComment]);

      const imageUrl = await getEmployeeImage(newComment.user_Id);
      const newTimelineActivity: TimelineActivity = {
        id: newComment.comment_Id,
        type: newComment.type,
        content: newComment.content,
        user: newComment.user?.email || "Unknown User",
        timestamp: newComment.created_at,
        userImage: imageUrl,
      };

      setActivities((prev) => [...prev, newTimelineActivity]);
    });

    return () => {
      socket.off("connect");
      socket.off("comment");
      socket.emit("leave-task", taskId);
    };
  }, [taskId]);

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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read");
        const result = await response.json();

        let formattedEmployees;
        if (Array.isArray(result)) {
          formattedEmployees = result.map((emp: any) => ({
            ...emp,
            image: getImageUrl(emp.image),
          }));
        } else if (result.data && Array.isArray(result.data)) {
          formattedEmployees = result.data.map((emp: any) => ({
            ...emp,
            image: getImageUrl(emp.image),
          }));
        } else {
          formattedEmployees = [];
        }
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

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

        console.log("Task Data:", taskData);
        console.log("Comments Data:", commentsData);

        setTask(taskData.data);
        
        const updatedComments = (commentsData.data || []).map((comment: any) => ({
          comment_Id: comment.comment_Id,
          content: comment.content,
          created_at: comment.created_at,
          type: comment.type,
          user_Id: comment.user_Id,
          user: {
            email: comment.user?.email || "Unknown User",
          },
        }));

        setComments(updatedComments);

        const timelineActivities = await Promise.all(updatedComments.map(async (comment: any) => ({
          id: comment.comment_Id,
          type: comment.type,
          content: comment.content,
          user: comment.user?.email || "Unknown User",
          timestamp: comment.created_at,
          userImage: await getEmployeeImage(comment.user_Id),
        })));

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

  const getEmployeeImage = useCallback(async (email?: string) => {
    const employee = employees.find((emp) =>
      emp.users?.some((user) => user.email === email)
    );
    return getImageUrl(employee?.image);
  }, [employees]);

  useEffect(() => {
    getEmployeeImage();
  }, [getEmployeeImage]);

  const handleAddActivity = async () => {
    if (!newActivity.trim() || isSending) return;

    try {
      setIsSending(true);
      
      const normalizedType = activityType.charAt(0).toUpperCase() + activityType.slice(1).toLowerCase();
      
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
            type: normalizedType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save comment to database");
      }

      const data = await response.json();

      socket.emit("comment", {
        ...data.data,
        task_Id: taskId,
        type: normalizedType,
        user: {
          email: user?.email,
          role: user?.role,
        },
      });

      setNewActivity("");
      setIsMessageSent(true);
      setTimeout(() => setIsMessageSent(false), 3000);
    } catch (error) {
      console.error("Error handling activity:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getActivityIcon = (type: TimelineActivity["type"]) => {
    switch (type) {
      case "Started":
        return <Activity className="w-5 h-5 text-blue-500" />;
      case "Comment":
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
      case "Bug":
        return <BugIcon className="w-5 h-5 text-red-500" />;
      case "Completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Assigned":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      default:
        return null; 
    }
  };

  const TimelineComponent = React.memo(function TimelineComponent({
    activities,
  }: {
    activities: TimelineActivity[];
  }) {
    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
                >
                  {getActivityIcon(activity.type)}
                </motion.div>
                {index !== activities.length - 1 && (
                  <div className="absolute top-10 left-1/2 bottom-0 w-0.5 bg-gray-200 -ml-[1px]" />
                )}
              </div>
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="flex-1 bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center gap-[0.6vw] mb-[1vw]">
                  <img
                    src={activity.userImage}
                    alt={activity.user}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-[0.9vw] text-gray-900">{activity.user}</span>
                  <span className="text-sm text-gray-500 text-[0.9vw]">
                    <Clock className="w-4 h-4 inline mr-[0.4vw]" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 text-[0.9vw]">{activity.content}</p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  });

  const calculateWorkloadPercentage = (workload: number): number => {
    const normalize = workload / 15;
    return normalize * 100;
  };

  const getWorkloadColor = (percentage: number): string => {
    if (percentage < 40) {
      return "text-green-600"; 
    } else if (percentage < 80) {
      return "text-yellow-600"; 
    } else {
      return "text-red-600"; 
    }
  };

  const displayActivities =
    realTimeActivities.length > 0 ? realTimeActivities : activities;

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((emp) => emp.employee_Id === employeeId);
  };

  const renderAssigneeImages = (assigns: any[]) => {
    return assigns.map((assign, index) => {
      const employeeDetails = getEmployeeDetails(assign.employee_Id);
      const image = employeeDetails?.image || "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ"; // fallback image

      return (
        <div key={index} className="relative group" onMouseEnter={(event) => {
          const card = event.currentTarget.querySelector('.hover-card');
          if (card) {
            const rect = card.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            const employeeId = employeeDetails?.employee_Id as string; 
            if (spaceBelow < rect.height && spaceAbove > rect.height) {
              setHoverCardPosition(prev => ({ ...prev, [employeeId]: 'above' } as any)); 
            } else {
              setHoverCardPosition(prev => ({ ...prev, [employeeId]: 'below' } as any)); 
            }
          }
        }}>
          <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-gray-200 border-[0.08vw] border-white flex items-center justify-center overflow-hidden">
            <img
              src={image}
              alt={`Employee ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Hover Card */}
          {employeeDetails && (
            <motion.div
              className={`absolute left-0 transform -translate-x-full ${hoverCardPosition[employeeDetails.employee_Id] === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'} w-[12vw] bg-white rounded-lg shadow-lg p-[0.625vw] hidden group-hover:block z-50 border border-gray-200 hover-card`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-start gap-[0.625vw]">
                <img
                  src={employeeDetails.image}
                  alt={employeeDetails.name}
                  className="w-[2.5vw] h-[2.5vw] rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-[0.9vw]">{employeeDetails.name}</h4>
                  <p className="text-[0.6vw] text-gray-500">
                    {employeeDetails.users?.[0]?.email}
                  </p>
                </div>
              </div>
              <div className="mt-[0.5vw] space-y-[0.25vw] text-[0.6vw]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Team:</span>
                  <span className="text-gray-900">{employeeDetails.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900">{employeeDetails.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Workload:</span>
                  <span className={`${getWorkloadColor(employeeDetails.current_Workload)}`}>
                    {calculateWorkloadPercentage(employeeDetails.current_Workload).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{employeeDetails.phone}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen py-[0.5vw] px-[1vw] ml-[0.2vw] w-[70vw] space-y-[0.8vw] transition-all duration-300 ease-in-out">
            <div className="mx-auto">
              {/* Task Header */}
              <div className="bg-white rounded-lg shadow-sm px-[1.5vw] py-[1.5vw] mb-[0.5vw]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h1 className="text-[1.2vw] font-bold text-gray-900 mb-1">
                      {task?.title}
                    </h1>
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {task?.start_Date && task?.end_Date
                            ? `${new Date(task.start_Date).toLocaleDateString()} - ${new Date(task.end_Date).toLocaleDateString()}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span className="text-xs">
                          {task?.workload} workload units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {task?.priority && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
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
                        className={`px-2 py-0.5 rounded-full text-xs ${
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
                  <p className="text-gray-600 mb-2 text-xs">{task.description}</p>
                )}

                <div className="border-t pt-2">
                  <h3 className="font-semibold text-gray-600 mb-[0.5vw] text-xs">Assignees</h3>
                  <div className="flex gap-[0.5vw]">
                    {task?.assigns && renderAssigneeImages(task.assigns)}
                  </div>
                </div>
              </div>

              {/* Activity Input */}
              <div className="bg-white rounded-lg shadow-sm px-[1vw] py-[1.5vw] mb-[0.5vw]">
                <div className="flex gap-2 relative">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as TimelineActivity["type"])}
                    className="px-[0.5vw] py-[0.3vw] text-[0.8vw] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-[0.5vw] py-[0.3vw] text-[0.8vw] border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddActivity();
                      }
                    }}
                  />
                  <motion.button
                    onClick={handleAddActivity}
                    disabled={!newActivity.trim() || isSending}
                    className="px-1 py-0.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  {/* Success Message */}
                  <AnimatePresence>
                    {isMessageSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-6 right-0 flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span className="text-xs">Message sent successfully!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-md font-bold text-gray-900 mb-2">
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
