"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { useNotification } from "@/components/context/notification-context";
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';

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

const decodeJWT = (token: string): UserData => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error("Invalid token format");
  }
};

const LoadingScreen = dynamic(() => import('@/components/organisms/LoadingScreen'), {
  ssr: false
});

const Login = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      const { email, password } = JSON.parse(rememberedUser);
      setFormData((prev) => ({
        ...prev,
        email,
        password,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rememberedUser = localStorage.getItem("rememberedUser");
        if (rememberedUser) {
          const parsedUser = JSON.parse(rememberedUser);
          if (parsedUser && parsedUser.email && parsedUser.password) {
            setFormData((prev) => ({
              ...prev,
              email: parsedUser.email,
              password: parsedUser.password,
              rememberMe: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error reading remembered user:', error);
        localStorage.removeItem("rememberedUser");
      }
    }
  }, []);

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
  
      if (!data?.succes?.accesToken) {
        throw new Error("Token not found in response");
      }
  
      const token = data.succes.accesToken;
  
      try {
        const userData = decodeJWT(token);
        setIsAuthenticating(true);
  
        // Wrap in try-catch and add type checking
        try {
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              try {
                // Set cookie with more restrictive options
                Cookies.set('auth_token', token, { 
                  expires: 1/24,
                  secure: true,
                  sameSite: 'strict'
                });
  
                if (formData.rememberMe) {
                  const userDataToStore = {
                    email: formData.email,
                    password: formData.password,
                  };
                  localStorage.setItem(
                    "rememberedUser",
                    JSON.stringify(userDataToStore)
                  );
                } else {
                  localStorage.removeItem("rememberedUser");
                }
  
                if (userData?.role) {
                  setAlertMessage({
                    message: "Successfully signed in!",
                    type: "success",
                  });
                  router.push("/dashboard");
                } else {
                  throw new Error("User role not found");
                }
              } catch (storageError) {
                console.error('Storage error:', storageError);
                setAlertMessage({ 
                  message: "Error saving authentication data", 
                  type: "error" 
                });
                setIsAuthenticating(false);
                setIsLoading(false);
              }
            }, 2000);
          }
        } catch (cookieError) {
          console.error('Cookie error:', cookieError);
          throw new Error("Error setting authentication cookie");
        }
      } catch (decodeError) {
        console.error('Decode error:', decodeError);
        throw new Error("Error decoding authentication token");
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlertMessage({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        type: "error",
      });
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  if (!mounted) {
    return null;
  }
  if (isAuthenticating) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center p-6">
      {/* Rest of your JSX remains exactly the same */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 p-12 items-center justify-center">
          <div className="absolute h-[28vw] w-[28vw] bg-blue-100 rounded-full"></div>
          <div className="relative w-[60vw] max-w-md transform transition-transform duration-500 hover:scale-105">
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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600 mb-8">Please sign in to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {alertMessage && (
                <div
                  className={`mb-4 rounded-lg text-red-500 text-[1vw] ${
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
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-[0.875vw] text-gray-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-6 pb-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-navy hover:bg-blue-800 text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-lg">Sign In</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative py-4">
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
