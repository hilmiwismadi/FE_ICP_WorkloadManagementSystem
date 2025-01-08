"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import toast from 'react-hot-toast'; // Make sure this import is correct

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

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Create a loading toast that we can dismiss later
    const loadingToastId = toast.loading('Signing in...');

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
      
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        // Show error toast and return early
        toast.error(data.message || 'Invalid username or password');
        setIsLoading(false);
        return;
      }

      const token = data.succes.accesToken;
    
      try {
        const userData = decodeJWT(token);

        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));

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
          setIsAuthenticating(true);
          toast.success('Successfully signed in!');
          router.push("/dashboard");
        } else {
          toast.error('User role not found');
          setIsLoading(false);
        }
      } catch (decodeError) {
        toast.error('Authentication failed');
        setIsLoading(false);
      }
    } catch (error) {
      // Dismiss the loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading screen only during authentication and redirect
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600 mb-8">Please sign in to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your username"
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
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
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