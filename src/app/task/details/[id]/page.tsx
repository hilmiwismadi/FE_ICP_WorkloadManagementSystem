"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import ProtectedRoute from "@/components/protected-route";
import CommentInputDialog from "@/components/organisms/CommentInputDialog";
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
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import { Task, Employee } from "@/app/task/types";
import { io } from "socket.io-client";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { JwtPayload } from "jwt-decode";

export interface Comment {
  comment_Id: string;
  content: string;
  created_at: string;
  type: "Started" | "Comment" | "Bug" | "Approved" | "Assigned" | "Rejected";
  user_Id: string;
  user?: {
    email: string;
    employee?: {
      image: string;
    };
    role: string;
  };
}

export interface TimelineActivity {
  id: string;
  type: "Started" | "Comment" | "Bug" | "Approved" | "Assigned" | "Rejected";
  content: string;
  user: string;
  employee?: {
    image: string;
  };
  timestamp: string;
  userImage?: string;
}

export type Priority = "High" | "Medium" | "Normal";
export type Status = "Ongoing" | "Done" | "Approved";

interface TaskAssign {
  employee: Employee;
}

// Update socket initialization to include credentials and transports
const socket = io("https://be-icpworkloadmanagementsystem.up.railway.app", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
});

interface CustomJwtPayload extends JwtPayload {
  role?: string;
  employee_Id?: string;
}

const TaskDetailPage = () => {
  const { id: taskId } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [activityType, setActivityType] =
    useState<TimelineActivity["type"]>("Comment");
  const [realTimeActivities, setRealTimeActivities] = useState<
    TimelineActivity[]
  >([]);
  const [hoverCardPosition, setHoverCardPosition] = useState<
    Record<string, string>
  >({});
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [canManageTask, setCanManageTask] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentType, setCommentType] = useState<"Reject" | "Approve">(
    "Reject"
  );
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [approvalContent, setApprovalContent] = useState<string>("");
  const [rejectionContent, setRejectionContent] = useState<string>("");
  const router = useRouter();

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    workload: 0,
    start_Date: "",
    end_Date: "",
  });

  const handleDelete = async () => {
    if (!canEditDelete) return;
    try {
      setIsDeleting(true);
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/delete/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setShowDeleteDialog(false);
      setShowFeedback({
        show: true,
        type: "success",
        message: "Task deleted successfully!",
      });

      // Navigate back to tasks list after short delay
      setTimeout(() => {
        router.push("/task");
      }, 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setShowFeedback({
        show: true,
        type: "error",
        message: "Failed to delete task. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!canEditDelete) return;
    try {
      setIsEditing(true);
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/edit/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      setTask((prev) => ({ ...prev, ...updatedTask.data }));
      setShowEditDialog(false);
      setShowFeedback({
        show: true,
        type: "success",
        message: "Task updated successfully!",
      });

      setTimeout(() => {
        setShowFeedback({ show: false, type: "success", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setShowFeedback({
        show: true,
        type: "error",
        message: "Failed to update task. Please try again.",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Add useEffect to populate edit form when task changes
  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "",
        workload: task.workload || 0,
        start_Date: task.start_Date
          ? new Date(task.start_Date).toISOString().split("T")[0]
          : "",
        end_Date: task.end_Date
          ? new Date(task.end_Date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [task]);

  useEffect(() => {
    const authStorage = Cookies.get("auth_token");
    if (authStorage) {
      try {
        const userData = jwtDecode<CustomJwtPayload>(authStorage);
        setUser(userData);
        setCanManageTask(
          userData?.role === "Manager" || userData?.role === "PIC"
        );
      } catch (error) {
        console.error("Error decoding auth token:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Socket.IO event listeners
    socket.on("connect", () => {
      // Join task-specific room
      socket.emit("join-task", taskId);
    });

    socket.on("comment", async (newComment: Comment) => {
      setComments((prev) => [...prev, newComment]);

      const imageUrl = await getEmployeeImage(newComment.user?.email);
      const newTimelineActivity: TimelineActivity = {
        id: newComment.comment_Id,
        type: newComment.type,
        content: newComment.content,
        user: newComment.user?.email || "Unknown User",
        timestamp: newComment.created_at,
        userImage: getImageUrl(imageUrl),
        employee: {
          image: getImageUrl(newComment.user?.employee?.image),
        },
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

        const updatedComments = (commentsData.data || []).map(
          (comment: any) => ({
            comment_Id: comment.comment_Id,
            content: comment.content,
            created_at: comment.created_at,
            type: comment.type,
            user_Id: comment.user_Id,
            user: {
              email: comment.user?.email || "Unknown User",
              employee: {
                image: getImageUrl(comment.user?.employee?.image),
              },
            },
          })
        );

        setComments(updatedComments);

        const timelineActivities = await Promise.all(
          updatedComments.map(async (comment: any) => ({
            id: comment.comment_Id,
            type: comment.type,
            content: comment.content,
            user: comment.user?.email || "Unknown User",
            timestamp: comment.created_at,
            userImage: await getEmployeeImage(comment.user?.email),
            employee: {
              image: getImageUrl(comment.user?.employee?.image),
            },
          }))
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

  const getEmployeeImage = useCallback(
    async (email?: string) => {
      const employee = task?.assigns?.find((emp) =>
        emp.employee.users?.some((user) => user.email === email)
      );
      return getImageUrl(employee?.employee.image);
    },
    [task]
  );

  useEffect(() => {
    getEmployeeImage();
  }, [getEmployeeImage]);

  const handleAddActivity = async (activity: Comment) => {
    if (!newActivity.trim() || isSending) return;

    try {
      setIsSending(true);

      const normalizedType =
        activity.type.charAt(0).toUpperCase() +
        activity.type.slice(1).toLowerCase();

      // Fetch employee image using the new API
      const employeeImageResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${user?.employee_Id}`
      );
      const employeeImageData = await employeeImageResponse.json();
      const employeeImage = getImageUrl(employeeImageData.data?.image);

      // Add the comment to the database
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/comment/add/${taskId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: activity.content,
            user_Id: activity.user_Id,
            task_Id: taskId,
            type: normalizedType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding comment:", errorData);
        throw new Error(
          errorData.message || "Failed to save comment to database"
        );
      }

      const data = await response.json();

      // Emit the comment through the socket
      socket.emit("comment", {
        ...data.data,
        task_Id: taskId,
        type: normalizedType,
        user: {
          email: activity.user?.email,
          role: activity.user?.role,
          employee: {
            image: employeeImage,
          },
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
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Assigned":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
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
          {activities.map((activity) => (
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
                {activities.indexOf(activity) !== activities.length - 1 && (
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
                    src={getImageUrl(activity.employee?.image)}
                    alt={activity.user}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-[0.9vw] text-gray-900">
                    {activity.user}
                  </span>
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

  const renderAssigneeImages = (assigns: TaskAssign[]) => {
    if (!assigns || assigns.length === 0) {
      return null;
    }

    return assigns.map((assign, index) => {
      const employee = assign.employee; // Directly use employee from assigns
      const image = getImageUrl(employee.image);

      return (
        <div
          key={employee.employee_Id}
          className="relative group"
          onMouseEnter={(event) => {
            const card = event.currentTarget.querySelector(".hover-card");
            if (card) {
              const rect = card.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;

              const employeeId = employee.employee_Id as string;
              if (spaceBelow < rect.height && spaceAbove > rect.height) {
                setHoverCardPosition(
                  (prev) => ({ ...prev, [employeeId]: "above" } as any)
                );
              } else {
                setHoverCardPosition(
                  (prev) => ({ ...prev, [employeeId]: "below" } as any)
                );
              }
            }
          }}
        >
          <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-gray-200 border-[0.08vw] border-white flex items-center justify-center overflow-hidden">
            <img
              src={getImageUrl(employee.image)}
              alt={`Employee ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Hover Card */}
          {employee && (
            <motion.div
              className={`absolute left-0 transform -translate-x-full ${
                hoverCardPosition[employee.employee_Id] === "above"
                  ? "bottom-full mb-2"
                  : "top-full mt-2"
              } w-[12vw] bg-white rounded-lg shadow-lg p-[0.625vw] hidden group-hover:block z-50 border border-gray-200 hover-card`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-start gap-[0.625vw]">
                <img
                  src={getImageUrl(employee.image)}
                  alt={employee.name}
                  className="w-[2.5vw] h-[2.5vw] rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-[0.9vw]">
                    {employee.name}
                  </h4>
                  <p className="text-[0.6vw] text-gray-500">
                    {employee.users?.[0]?.email}
                  </p>
                </div>
              </div>
              <div className="mt-[0.5vw] space-y-[0.25vw] text-[0.6vw]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Team:</span>
                  <span className="text-gray-900">{employee.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900">{employee.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Workload:</span>
                  <span
                    className={`${getWorkloadColor(employee.current_Workload)}`}
                  >
                    {calculateWorkloadPercentage(
                      employee.current_Workload
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{employee.phone}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      );
    });
  };

  const handleRejectClick = () => {
    setCommentType("Reject");
    setShowCommentDialog(true);
  };

  const handleApproveClick = () => {
    setCommentType("Approve");
    setShowCommentDialog(true);
  };

  const handleConfirmApprove = async (content: string) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setShowCommentDialog(false);
    setShowApproveDialog(false);
    try {
      // Fetch current user's employee details
      const employeeImageResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${user?.employee_Id}`
      );
      const employeeImageData = await employeeImageResponse.json();
      const employeeImage = getImageUrl(employeeImageData.data?.image);

      // Fetch task details to get assignees
      const taskResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read/${taskId}`
      );
      const taskData = await taskResponse.json();

      // Format names and collect emails
      const assignedEmployees = taskData.data.assigns;
      const formattedNames = assignedEmployees
        .map((assign: TaskAssign) => assign.employee.name.split(" ")[0])
        .join(", ");

      const emailAddresses = assignedEmployees
        .map((assign: TaskAssign) => assign.employee.users?.[0]?.email ?? "")
        .filter(Boolean);

      // Update task status
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/edit/status/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...task,
            status: "Approved",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();
      setTask((prev) => ({ ...prev, ...updatedTask.data }));

      // Add approval activity
      const approvalActivity: Comment = {
        comment_Id: "",
        content: content,
        created_at: new Date().toISOString(),
        type: "Approved",
        user_Id: user?.user_Id,
        user: {
          email: user?.email,
          role: user?.role,
          employee: {
            image: employeeImage,
          },
        },
      };

      const commentResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/comment/add/${taskId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: approvalActivity.content,
            user_Id: approvalActivity.user_Id,
            task_Id: taskId,
            type: approvalActivity.type,
          }),
        }
      );

      const commentData = await commentResponse.json();

      // Send email notification
      const emailResponse = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/sendMail/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: emailAddresses,
            subject: `Task Approved: ${taskData.data.title}`,
            name: formattedNames,
            title: taskData.data.title,
            content: approvalActivity.content,
            task_Id: taskData.data.task_Id,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("Failed to send email notification");
      }

      // Emit the approval activity through the socket
      socket.emit("comment", {
        ...commentData.data,
        task_Id: taskId,
        type: approvalActivity.type,
        user: {
          email: approvalActivity.user?.email,
          role: approvalActivity.user?.role,
          employee: {
            image: employeeImage,
          },
        },
      });
      setShowFeedback({
        show: true,
        type: "success",
        message: "Task approved successfully!",
      });
    } catch (error) {
      console.error("Error approving task:", error);
      setShowFeedback({
        show: true,
        type: "error",
        message: "Failed to approve task. Please try again.",
      });
    } finally {
      setIsUpdatingStatus(false);

      setTimeout(() => {
        setShowFeedback((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const handleConfirmReject = async (content: string) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setShowCommentDialog(false);
    setShowApproveDialog(false);
    try {
      // Fetch current user's employee details
      const employeeImageResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${user?.employee_Id}`
      );
      const employeeImageData = await employeeImageResponse.json();
      const employeeImage = getImageUrl(employeeImageData.data?.image);

      // Fetch task details
      const taskResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read/${taskId}`
      );
      const taskData = await taskResponse.json();

      // Format names and collect emails
      const assignedEmployees = taskData.data.assigns;
      const formattedNames = assignedEmployees
        .map((assign: TaskAssign) => assign.employee.name.split(" ")[0])
        .join(", ");

      const emailAddresses = assignedEmployees
        .map((assign: TaskAssign) => assign.employee.users?.[0]?.email ?? "")
        .filter(Boolean);

      // Add rejection activity
      const rejectionActivity: Comment = {
        comment_Id: "",
        content: content,
        created_at: new Date().toISOString(),
        type: "Rejected",
        user_Id: user?.user_Id,
        user: {
          email: user?.email,
          role: user?.role,
          employee: {
            image: employeeImage,
          },
        },
      };

      // Add comment
      const commentResponse = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/comment/add/${taskId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: rejectionActivity.content,
            user_Id: rejectionActivity.user_Id,
            task_Id: taskId,
            type: rejectionActivity.type,
          }),
        }
      );

      const commentData = await commentResponse.json();

      // Send email notification with all names formatted
      const emailResponse = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/sendMail/reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: emailAddresses,
            subject: `Task Rejected: ${taskData.data.title}`,
            name: formattedNames,
            title: taskData.data.title,
            task_Id: taskData.data.task_Id,
            content: rejectionActivity.content,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("Failed to send email notification");
      }

      // Emit the comment through the socket
      socket.emit("comment", {
        ...commentData.data,
        task_Id: taskId,
        type: rejectionActivity.type,
        user: {
          email: rejectionActivity.user?.email,
          role: rejectionActivity.user?.role,
          employee: {
            image: employeeImage,
          },
        },
      });

      setShowFeedback({
        show: true,
        type: "success",
        message: "Task rejected successfully!",
      });
    } catch (error) {
      console.error("Error rejecting task:", error);
      setShowFeedback({
        show: true,
        type: "error",
        message: "Failed to reject task. Please try again.",
      });
    } finally {
      setIsUpdatingStatus(false);

      setTimeout(() => {
        setShowFeedback((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const renderActionButtons = () => {
    if (!canManageTask) {
      return null;
    }

    return (
      <div className="flex flex-row items-center justify-center gap-2">
        <motion.button
          onClick={handleApproveClick}
          disabled={task?.status !== "Done" || isUpdatingStatus}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs ${
            task?.status === "Done"
              ? isUpdatingStatus
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUpdatingStatus ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              {/* Circular loader container */}
              <div className="relative w-[5vw] h-[5vw]">
                {/* Light grey circle (base) */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-gray-300/20" />

                {/* Yellow rotating circle */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-t-yellow-300 animate-spin" />

                {/* Blue accent circle */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-l-blue-300 animate-spin-slow" />
              </div>

              <style jsx>{`
                @keyframes spin-slow {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
                .animate-spin-slow {
                  animation: spin-slow 1.2s linear infinite;
                }
              `}</style>
            </div>
          ) : (
            <>
              <ThumbsUp className="w-3 h-3" />
              Approve
            </>
          )}
        </motion.button>
        <motion.button
          onClick={handleRejectClick}
          disabled={task?.status !== "Done" || isUpdatingStatus}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs ${
            task?.status === "Done"
              ? isUpdatingStatus
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUpdatingStatus ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              {/* Circular loader container */}
              <div className="relative w-[5vw] h-[5vw]">
                {/* Light grey circle (base) */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-gray-300/20" />

                {/* Yellow rotating circle */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-t-yellow-300 animate-spin" />

                {/* Blue accent circle */}
                <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-l-blue-300 animate-spin-slow" />
              </div>

              <style jsx>{`
                @keyframes spin-slow {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
                .animate-spin-slow {
                  animation: spin-slow 1.2s linear infinite;
                }
              `}</style>
            </div>
          ) : (
            <>
              <ThumbsDown className="w-3 h-3" />
              Reject
            </>
          )}
        </motion.button>
      </div>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const canEditDelete = user?.role === "Manager" || user?.role === "PIC";

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen py-[0.5vw] px-[1vw] ml-[0.2vw] w-[70vw] space-y-[0.8vw] transition-all duration-300 ease-in-out">
            <div className="mx-auto">
              {/* Task Header */}
              <div className="bg-white rounded-lg shadow-sm px-[1.5vw] py-[1.5vw] mb-[1vw]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h1 className="text-[1.2vw] font-bold text-gray-900 mb-1">
                      {task?.title}
                    </h1>
                    <div className="flex flex-col gap-[0.5vw]">
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">
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
                          <Activity className="w-3 h-3" />
                          <span className="text-xs">
                            {task?.workload} workload units
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
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
                  </div>

                  <div className="flex flex-col justify-between items-end gap-[1.75vw] py-auto">
                    {canEditDelete && (
                      <div className="flex flex-row gap-2">
                        <motion.button
                          onClick={() => setShowEditDialog(true)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button
                          onClick={() => setShowDeleteDialog(true)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    )}
                    {renderActionButtons()}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-[1vw]">
                  {task?.description && (
                    <p className="text-gray-600 text-[0.8vw]">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="border-t pt-2">
                  <h3 className="font-semibold text-gray-600 mb-[0.5vw] text-xs">
                    Assignees
                  </h3>
                  <div className="flex gap-[0.5vw]">
                    {task?.assigns && renderAssigneeImages(task.assigns)}
                  </div>
                </div>
              </div>

              {/* Activity Input */}
              <div className="bg-white rounded-lg shadow-sm px-[1vw] py-[1.5vw] mb-[1vw]">
                <div className="flex gap-2 relative">
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(
                        e.target.value as TimelineActivity["type"]
                      )
                    }
                    className="px-[0.5vw] py-[0.3vw] text-[0.8vw] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="comment">Comment</option>
                    <option value="bug">Bug</option>
                    <option value="started">Started</option>
                    <option value="approved">Approved</option>
                    <option value="assigned">Assigned</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="Add an activity..."
                    className="flex-1 px-[0.5vw] py-[0.3vw] text-[0.8vw] border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddActivity({
                          comment_Id: "",
                          content: newActivity,
                          created_at: "",
                          type: activityType,
                          user_Id: user?.user_Id,
                          user: {
                            email: user?.email,
                            role: user?.role,
                            employee: {
                              image: getImageUrl(user?.employee?.image),
                            },
                          },
                        });
                      }
                    }}
                  />
                  <motion.button
                    onClick={() => {
                      handleAddActivity({
                        comment_Id: "",
                        content: newActivity,
                        created_at: "",
                        type: activityType,
                        user_Id: user?.user_Id,
                        user: {
                          email: user?.email,
                          role: user?.role,
                          employee: {
                            image: getImageUrl(user?.employee?.image),
                          },
                        },
                      });
                    }}
                    disabled={!newActivity.trim() || isSending}
                    className="px-[0.5vw] py-[0.3vw] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
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
                        <span className="text-xs">
                          Message sent successfully!
                        </span>
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

            {/* Approve Dialog */}
            <AlertDialog
              open={showApproveDialog}
              onOpenChange={setShowApproveDialog}
            >
              <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
              <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: "1vw" }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: "1vw" }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
                      {isUpdatingStatus
                        ? "Processing Approval..."
                        : "Confirm Task Approval"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[1vw]">
                      {isUpdatingStatus
                        ? "Please wait while we process your approval..."
                        : "Are you sure you want to approve this task? This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-[1vw]">
                    <AlertDialogCancel
                      disabled={isUpdatingStatus}
                      className="text-[0.8vw]"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleConfirmApprove(approvalContent)}
                      disabled={isUpdatingStatus}
                      className={`${
                        isUpdatingStatus
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      } text-[0.8vw]`}
                    >
                      {isUpdatingStatus ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        "Confirm Approval"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </motion.div>
              </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog
              open={showRejectDialog}
              onOpenChange={setShowRejectDialog}
            >
              <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
              <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: "1vw" }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: "1vw" }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
                      {isUpdatingStatus
                        ? "Processing Rejection..."
                        : "Confirm Task Rejection"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[1vw]">
                      {isUpdatingStatus
                        ? "Please wait while we process your rejection..."
                        : "Are you sure you want to reject this task? The task will be sent back for revision."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-[1vw]">
                    <AlertDialogCancel
                      disabled={isUpdatingStatus}
                      className="text-[0.8vw]"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleConfirmReject(rejectionContent)}
                      disabled={isUpdatingStatus}
                      className={`${
                        isUpdatingStatus
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                      } text-[0.8vw]`}
                    >
                      {isUpdatingStatus ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        "Reject"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </motion.div>
              </AlertDialogContent>
            </AlertDialog>

            {/* Comment Dialog */}
            <CommentInputDialog
              isOpen={showCommentDialog}
              onClose={() => setShowCommentDialog(false)}
              onSubmit={(content) => {
                if (commentType === "Reject") {
                  setShowRejectDialog(true);
                  setRejectionContent(content);
                } else {
                  setShowApproveDialog(true);
                  setApprovalContent(content);
                }
              }}
              title={`${commentType} Task Message`}
              type={commentType}
              defaultContent={
                commentType === "Reject"
                  ? "The task has been rejected. Please make the necessary changes and resubmit."
                  : "The task has been approved. Keep up the Good job!"
              }
            />

            {/* Feedback Alert */}
            <AnimatePresence>
              {showFeedback.show && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-4 right-4 z-50"
                >
                  <Alert
                    className={`w-[20vw] ${
                      showFeedback.type === "success"
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {showFeedback.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <AlertTitle
                        className={`text-[0.9vw] ${
                          showFeedback.type === "success"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {showFeedback.type === "success" ? "Success" : "Error"}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="text-[0.8vw] mt-2">
                      {showFeedback.message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[1vw]">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-[1vw]">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Deleting...
                </div>
              ) : (
                "Delete Task"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[50vw] max-h-[45vw] ">
          <DialogHeader className="pb-3 border-b border-gray-200">
            <DialogTitle className="text-[1vw] font-medium">
              Edit Task
            </DialogTitle>
            <DialogDescription className="text-[0.8vw] text-gray-500">
              Make changes to the task details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-[1vw] py-[0.1vw]">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-[0.8vw] font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full text-[0.8vw]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="min-h-[15vh] text-[0.8vw]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priority" className="text-[0.8vw] font-medium">
                Priority
              </Label>
              <select
                id="priority"
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm({ ...editForm, priority: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[0.8vw] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="workload" className="text-[0.8vw] font-medium">
                Workload (0 - 10)
              </Label>
              <Input
                id="workload"
                type="number"
                min="0"
                max="10"
                value={editForm.workload}
                onChange={(e) => {
                  const value = e.target.value;

                  // Allow empty input for typing
                  if (value === "") {
                    setEditForm({ ...editForm, workload: 0 });
                    return;
                  }

                  // Convert to a number and ensure it's within range
                  const numericValue = Number(value);
                  if (numericValue >= 0 && numericValue <= 10) {
                    setEditForm({ ...editForm, workload: numericValue });
                  }
                }}
                className="text-[0.8vw]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="start_Date" className="text-xs font-medium">
                  Start Date
                </Label>
                <Input
                  id="start_Date"
                  type="date"
                  value={editForm.start_Date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_Date: e.target.value })
                  }
                  className="text-[0.8vw]"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="end_Date" className="text-[0.8vw] font-medium">
                  End Date
                </Label>
                <Input
                  id="end_Date"
                  type="date"
                  value={editForm.end_Date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, end_Date: e.target.value })
                  }
                  className="text-[0.8vw]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setShowEditDialog(false)}
              className="px-3 py-1.5 text-[0.8vw] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={isEditing}
              className="px-3 py-1.5 text-[0.8vw] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default TaskDetailPage;
