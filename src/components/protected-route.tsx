import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import LoadingScreen from "@/components/organisms/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

interface UserData {
  user_Id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  iat: number;
  exp: number;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const checkRoleAccess = (userData: UserData, path: string): boolean => {
    const { role, user_Id } = userData;

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

      if (isTaskListPath || isEditProfilePath) {
        // Check if the ID in the URL matches the user's ID
        const pathId = path.split("/").pop();
        return pathId === user_Id;
      }
      return false;
    }

    return false;
  };

  useEffect(() => {
    const checkAuthentication = () => {
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

        // Check role-based access
        if (!checkRoleAccess(decoded, pathname)) {
          // If access is denied, redirect to a suitable page based on role
          switch (decoded.role) {
            case "Employee":
              router.push(`/task-lists/${decoded.user_Id}`);
              break;
            case "PIC":
              router.push("/dashboard"); // Or any default PIC page
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