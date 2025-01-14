"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import { useNotification } from "@/components/context/notification-context";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
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

const Login = () => {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = Cookies.get("auth_token");
      if (token) {
        try {
          const decoded = jwtDecode<UserData>(token);
          const currentTime = Date.now() / 1000;
  
          if (decoded.exp > currentTime) {
            // Token is valid, navigate to dashboard
            router.push("/dashboard");
          } else {
            // Expired token, remove it
            Cookies.remove("auth_token");
          }
        } catch (error) {
          // Invalid token, clear it
          Cookies.remove("auth_token");
        }
      }
    };
  
    checkAuthentication();
  }, [router]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAlertMessage({
          message: data.message || "Invalid username or password",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      const token = data.succes.accesToken;

      try {
        const userData = jwtDecode<UserData>(token);
        setIsAuthenticating(true);

        setTimeout(() => {
          Cookies.set("auth_token", token, {
            expires: 1 / 24,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          if (formData.rememberMe) {
            localStorage.setItem(
              "rememberedUser",
              JSON.stringify({
                email: formData.email,
                password: formData.password,
              })
            );
          } else {
            localStorage.removeItem("rememberedUser");
          }

          if (userData.role) {
            setAlertMessage({
              message: "Successfully signed in!",
              type: "success",
            });
            router.push("/dashboard");
          } else {
            setAlertMessage({ message: "User role not found", type: "error" });
            setIsAuthenticating(false);
            setIsLoading(false);
          }
        }, 2000);
      } catch (decodeError) {
        setAlertMessage({ message: "Authentication failed", type: "error" });
        setIsLoading(false);
        setIsAuthenticating(false);
      }
    } catch (error) {
      setAlertMessage({
        message: "Network error. Please try again.",
        type: "error",
      });
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticating || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center p-[3vw]">
      <div className="w-full max-w-[80vw] bg-white rounded-[1vw] shadow-2xl flex overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 p-[3vw] items-center justify-center">
          <div className="absolute h-[28vw] w-[28vw] bg-blue-100 rounded-full"></div>
          <div className="relative w-[30vw] max-w-[40vw] transform transition-transform duration-500 hover:scale-105">
            <Image
              src="/img/assets/loginAssets.png"
              alt="Login"
              width={500}
              height={500}
              className="relative z-10 w-full h-auto"
              priority
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-[2vw] md:p-[3vw]">
          <div className="max-w-[30vw] mx-auto">
            <h2 className="text-[2vw] font-bold text-gray-900 mb-[1vw]">
              Welcome back
            </h2>
            <p className="text-[1vw] text-gray-600 mb-[2vw]">
              Please sign in to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-[1.25vw]">
              {/* Email Input */}
              <div className="relative">
                <label className="text-[1vw] font-medium text-gray-700 mb-[0.208vw] block">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-[0.625vw] top-1/2 -translate-y-1/2 h-[1.042vw] w-[1.042vw] text-gray-400" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-[2.083vw] pr-[2.5vw] py-[0.521vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="text-[1vw] font-medium text-gray-700 mb-[0.208vw] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-[0.625vw] top-1/2 -translate-y-1/2 h-[1.042vw] w-[1.042vw] text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-[2.083vw] pr-[2.5vw] py-[0.521vw] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[0.625vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[1.042vw] w-[1.042vw]" />
                    ) : (
                      <Eye className="h-[1.042vw] w-[1.042vw]" />
                    )}
                  </button>
                </div>
              </div>

              {alertMessage && (
                <div
                  className={`mb-[0.833vw] rounded-lg text-red-500 text-[1vw] ${
                    alertMessage.type === "error"
                      ? "bg-white"
                      : alertMessage.type === "success"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                >
                  {alertMessage.message}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-[0.417vw] cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-[0.833vw] h-[0.833vw] rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-[0.875vw] text-gray-600">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-[1.25vw] pb-[0.417vw]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-navy hover:bg-blue-800 text-white font-medium py-[0.729vw] px-[0.833vw] rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="h-[1.042vw] w-[1.042vw] border-[0.104vw] border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-[1vw]">Sign In</span>
                      <ArrowRight className="h-[1.042vw] w-[1.042vw] ml-[0.417vw]" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative py-[0.833vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
