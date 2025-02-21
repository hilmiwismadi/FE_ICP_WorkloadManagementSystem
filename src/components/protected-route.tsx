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

  const fetchTaskIds = async (employeeId: string, role: string): Promise<string[]> => {
    if (role !== "PIC" && role !== "Employee") {
      return [];
    }
  
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/emp/read/${employeeId}`
      );
  
      if (response.status === 404) {
        return [];
      }
  
      const responseData = await response.json();
  
      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data.map((task: any) => task.task_Id);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch task data:", error);
      return [];
    }
  };
  

  const checkRoleAccess = (
    userData: UserData,
    path: string,
    taskIds: string[]
  ): boolean => {
    const { role, employee_Id } = userData;

    if (path === "/roadmap") {
      return role === "Manager";
    }

    if (role === "Manager") {
      const isTaskListPath = path.startsWith("/task-lists/");
      const isEditProfilePath = path.startsWith("/edit-profile/");
      if (isTaskListPath || isEditProfilePath) {
        const pathId = path.split("/").pop();
        return pathId === employee_Id;
      }
      return true;
    }

    if (role === "PIC") {
      const isTaskListPath = path.startsWith("/task-lists/");
      const isEditProfilePath = path.startsWith("/edit-profile/");
      if (isTaskListPath || isEditProfilePath) {
        const pathId = path.split("/").pop();
        return pathId === employee_Id;
      }
      return !path.startsWith("/pic-dashboard");
    }

    if (role === "Employee") {
      const isTaskListPath = path.startsWith("/task-lists/");
      const isEditProfilePath = path.startsWith("/edit-profile/");
      const isTaskDetailsPath = path.startsWith("/task/details/");

      if (isTaskListPath || isEditProfilePath) {
        const pathId = path.split("/").pop();
        return pathId === employee_Id;
      }

      if (isTaskDetailsPath) {
        const taskIdFromPath = path.split("/").pop();
        return taskIdFromPath !== undefined && taskIds.includes(taskIdFromPath);
      }

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

      const timeout = setTimeout(() => {
        setIsLoading(false);
        router.push("/");
      }, 10000);

      try {
        const decoded = jwtDecode<UserData>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp <= currentTime) {
          Cookies.remove("auth_token");
          router.push("/");
          return;
        }
        const fetchedTaskIds = await fetchTaskIds(decoded.employee_Id, decoded.role);
        setTaskIds(fetchedTaskIds);

        const hasAccess = checkRoleAccess(decoded, pathname, fetchedTaskIds);
        if (!hasAccess) {
          switch (decoded.role) {
            case "Employee":
              router.push(`/task-lists/${decoded.employee_Id}`);
              break;
            case "PIC":
              router.push("/dashboard");
              break;
            case "Manager":
              router.push("/dashboard");
              break;
            default:
              router.push("/");
          }
          return;
        }

        setIsLoading(false);
      } catch (error) {
        Cookies.remove("auth_token");
        router.push("/");
      } finally {
        clearTimeout(timeout);
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
