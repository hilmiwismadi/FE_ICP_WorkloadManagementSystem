import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import LoadingScreen from "@/components/organisms/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

interface UserData {
  employee_Id: string;
  user_Id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  iat: number;
  exp: number;
}

interface Task {
  taskId: string; 
  description: string;
  endDate: string;
  priority: string;
  startDate: string;
  status: string;
  title: string;
  type: string;
  userId: string;
  workload: number;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [taskIds, setTaskIds] = useState<string[]>([]);

  const fetchTaskIds = async (employeeId: string) => {
    try {
      const response = await fetch(`https://be-icpworkloadmanagementsystem.up.railway.app/api/task/emp/read/${employeeId}`);
      const responseData = await response.json();
      
      if (responseData.data && Array.isArray(responseData.data)) {
        const extractedTaskIds = responseData.data.map((task: any) => task.task_Id);
        console.log('Extracted Task IDs:', extractedTaskIds); // Debug log
        setTaskIds(extractedTaskIds);
      } else {
        console.error('Unexpected data structure:', responseData);
        setTaskIds([]);
      }
    } catch (error) {
      console.error("Failed to fetch task IDs:", error);
      setTaskIds([]);
    }
  };
  
  // Add a useEffect to monitor taskIds changes
  useEffect(() => {
    console.log('Updated taskIds:', taskIds);
  }, [taskIds]);

  const checkRoleAccess = (userData: UserData, path: string): boolean => {
    const { role, user_Id, employee_Id } = userData;

    // Manager has access to all routes
    if (role === "Manager") {
      return true;
    }

    // PIC has access to all routes except /pic-dashboard
    if (role === "PIC") {
      return !path.startsWith("/pic-dashboard");
    }

    // Employee can only access their own task list and profile
    if (role === "Employee") {
      const isTaskListPath = path.startsWith("/task-lists/");
      const isEditProfilePath = path.startsWith("/edit-profile/");
      const isTaskDetailsPath = path.startsWith("/task/details/");

      if (isTaskListPath || isEditProfilePath) {
        // Check if the ID in the URL matches the employee's ID
        const pathId = path.split("/").pop();
        return pathId === employee_Id;
      }
<<<<<<< HEAD

      if (isTaskDetailsPath) {
        // Check if the task ID in the URL matches any of the employee's task IDs
        const taskIdFromPath = path.split("/").pop();
        return taskIdFromPath !== undefined && taskIds.includes(taskIdFromPath);
      }

=======
      
      // For task details, we'll allow access to any task details
      // You might want to add additional checks here to ensure they can only view their own tasks
      if (isTaskDetailsPath) {
        return true;
      }
      
>>>>>>> 9dfa4201c3f7e81f1bcf7767121a32b5050c909a
      return false;
    }

    return false;
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = Cookies.get("auth_token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const decoded = jwtDecode<UserData>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp <= currentTime) {
          Cookies.remove("auth_token");
          router.push("/");
          return;
        }

        // Fetch task IDs before checking access
        await fetchTaskIds(decoded.employee_Id);

        // Check role-based access
        if (!checkRoleAccess(decoded, pathname)) {
          switch (decoded.role) {
            case "Employee":
              router.push(`/task-lists/${decoded.employee_Id}`);
              break;
            case "PIC":
              router.push("/dashboard");
              break;
            default:
              router.push("/");
          }
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        Cookies.remove("auth_token");
        router.push("/");
      }
    };

    checkAuthentication();
  }, [router, pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;