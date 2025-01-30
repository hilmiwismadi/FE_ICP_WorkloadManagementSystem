"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { parse } from 'cookie';
import axios from "axios";
import {
  ChevronLeft,
  ArrowLeft,
  LayoutDashboard,
  Users,
  ClipboardList,
  FlagTriangleRight,
  LogOut,
  RefreshCw,
} from "lucide-react";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  users: Array<{
    user_Id: string;
    role: string;
  }>;
}

interface DecodedToken {
  employee_Id: string;
  role: string;
}

interface MenuItem {
  title: string;
  link: string;
  icon: any;
  allowedRoles: string[];
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return 'https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ';
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads')) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["Manager", "PIC"],
  },
  {
    title: "PIC Dashboard",
    link: "/pic-dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["Manager"],
  },
  {
    title: "Employee Activity",
    link: "/activity",
    icon: Users,
    allowedRoles: ["Manager", "PIC"],
  },
  {
    title: "Task Management",
    link: "/task",
    icon: ClipboardList,
    allowedRoles: ["Manager", "PIC"],
  },
  {
    title: "Roadmap",
    link: "/roadmap",
    icon: FlagTriangleRight,
    allowedRoles: ["Manager"],
  },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const initializeSidebar = async () => {
      const cookies = document.cookie;
      const parsedCookies = parse(cookies);
      const token = parsedCookies.auth_token;

      if (token) {
        try {
          const decodedToken = jwtDecode(token) as DecodedToken;
          setUserRole(decodedToken.role);
          setEmployeeId(decodedToken.employee_Id);

          const response = await axios.get(
            `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${decodedToken.employee_Id}`
          );
          
          if (response.data && response.data.data) {
            const employeeWithFormattedImage = {
              ...response.data.data,
              image: getImageUrl(response.data.data.image)
            };
            setEmployeeData(employeeWithFormattedImage);
          }
        } catch (error) {
          console.error("Error initializing sidebar:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeSidebar();
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/");
  };

  const getFilteredMenuItems = () => {
    if (userRole === "Employee") {
      return [{
        title: "My Tasks",
        link: `/task-lists/${employeeId}`,
        icon: ClipboardList,
        allowedRoles: ["Employee"],
      }];
    }
    return menuItems.filter(item => item.allowedRoles.includes(userRole));
  };

  const LoadingProfile = () => (
    <div className="flex items-center gap-[0.625vw]">
      <div className={`rounded-full bg-gray-300 animate-pulse ${
        isExpanded ? "w-[3vw] h-[3vw]" : "w-[1vw] h-[1vw]"
      }`} />
      {isExpanded && (
        <div className="flex items-center gap-[0.625vw] text-white">
          <RefreshCw className="w-[1.25vw] h-[1.25vw] animate-spin" />
          <span className="text-[0.9vw]">Loading . . .</span>
        </div>
      )}
    </div>
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (isLogoutPopupOpen && !target.closest('.logout-popup')) {
      setIsLogoutPopupOpen(false);
    }
  }, [isLogoutPopupOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      className={`relative min-h-screen bg-navy transition-all duration-300 ease-in-out cursor-pointer ${
        isExpanded ? "w-[16vw]" : "w-[5vw]"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.back();
        }}
        className="absolute -right-[0.625vw] top-[1.667vw] bg-white rounded-full py-[0.5vw] px-[0.75vw] border border-gray-200 hover:bg-gray-100 hover:scale-125 transition-transform duration-200"
      >
        <ArrowLeft className="h-[1vw] w-[1vw] text-navy font-bold" />
      </button>

      <div className="flex justify-center py-[2.5vw]">
        <Image
          src="/img/sidebar/Logo_IconPlus.png"
          alt="logo"
          width={isExpanded ? 120 : 40}
          height={isExpanded ? 120 : 40}
          className={`transition-all duration-300 ${
            isExpanded ? "w-[8vw] h-[3vw]" : "w-[3vw] h-[1.25vw]"
          } ${isExpanded ? "mt-[0vw]" : "mt-[2.5vw]"}`}
          priority
        />
      </div>

      <div
        className="mx-[1vw] mb-[1.667vw] border-2 border-[#243F80] rounded-[1vw] p-[1vw] bg-[#243F80] transition-all duration-300 hover:bg-[#1A2F60] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (employeeData) {
            window.location.href = `/edit-profile/${employeeData.employee_Id}`;
          }
        }}
      >
        {isLoading ? (
          <LoadingProfile />
        ) : (
          <div className="flex items-center gap-[0.625vw]">
            <Image
              src={employeeData?.image || "/img/sidebar/UserProfile.png"}
              alt="profile"
              width={40}
              height={40}
              className={`rounded-full transition-all duration-300 ${
                isExpanded ? "w-[3vw] h-[3vw]" : "w-[1vw] h-[1vw]"
              }`}
            />
            {isExpanded && employeeData && (
              <div className="flex flex-col text-white">
                <span className="font-semibold text-[1.25vw]">
                  {employeeData.name.split(' ')[0]}
                </span>
                <span className="text-[1vw]">ID-{employeeData.employee_Id}</span>
                <span className="text-[0.8vw] text-gray-300">
                  {userRole}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <nav
        className="px-[1vw] space-y-[1vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {getFilteredMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;

          return (
            <Link
              key={item.link}
              href={item.link}
              className={`flex items-center gap-[1vw] p-[1vw] rounded-[1vw] transition-all duration-200 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-400 hover:bg-blue-900/50 hover:text-white"
              }`}
            >
              <Icon className="h-[1.042vw] w-[1.042vw]" />
              {isExpanded && (
                <span className="font-medium text-[0.9vw]">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="absolute bottom-[1.667vw] w-full px-[0.833vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsLogoutPopupOpen(true)}
          className="flex items-center gap-[1vw] p-[1vw] w-full text-red-500 hover:bg-red-500/10 rounded-[1vw] transition-all duration-200"
        >
          <LogOut className="h-[1.042vw] w-[1.042vw]" />
          {isExpanded && (
            <span className="font-medium text-[0.9vw]">Log Out</span>
          )}
        </button>
      </div>

      {isLogoutPopupOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 text-[1vw]">
          <div className="bg-white p-[2.5vw] rounded-lg shadow-lg w-[90vw] sm:w-[400px] text-center logout-popup">
            <h2 className="text-[1.5vw] font-semibold mb-[0.833vw]">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-[1.25vw]">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-[0.833vw] text-[0.833vw]">
              <button
                onClick={() => setIsLogoutPopupOpen(false)}
                className="px-[0.833vw] py-[0.417vw] bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-[0.833vw] py-[0.417vw] bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;