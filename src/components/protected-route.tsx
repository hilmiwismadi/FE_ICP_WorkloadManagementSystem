import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = Cookies.get("auth_token");

      if (token) {
        try {
          const decoded = jwtDecode<UserData>(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            setIsLoading(false);
          } else {
            Cookies.remove("auth_token");
            router.push("/");
          }
        } catch (error) {
          Cookies.remove("auth_token");
          router.push("/");
        }
      } else {
        router.push("/");
      }
    };

    checkAuthentication();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
