"use client";
import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, ClipboardList, LogOut } from 'lucide-react';

const sidebarItems = [
  {
    title: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Employee Activity",
    link: "/activity",
    icon: Users
  },
  {
    title: "Task Management",
    link: "/task",
    icon: ClipboardList
  }
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`relative min-h-screen bg-navy transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-white rounded-full p-1 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4 text-navy" />
        ) : (
          <ChevronRight className="h-4 w-4 text-navy" />
        )}
      </button>

      {/* Logo */}
      <div className="flex justify-center py-6">
        <Image
          src="/img/sidebar/Logo_IconPlus.png"
          alt="logo"
          width={isExpanded ? 120 : 40}
          height={isExpanded ? 120 : 40}
          className="transition-all duration-300"
        />
      </div>

      {/* User Profile */}
      <div className="mx-4 mb-8">
        <div className="bg-[#243F80] rounded-lg p-4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Image
              src="/img/sidebar/UserProfile.png"
              alt="profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            {isExpanded && (
              <div className="flex flex-col text-white">
                <span className="font-semibold text-sm">PIC APKT</span>
                <span className="text-xs">ID-10009</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;
          
          return (
            <Link
              key={item.link}
              href={item.link}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-900 text-white' 
                  : 'text-gray-400 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <div className="w-[1.719vw] aspect-square flex justify-center items-center">
                {component.jsx}
              </div>
              <h1 className="ml-[1vw] flex justify-center items-center">{component.title}</h1>
            </div>
          </Link>
        ))}

        <div
          className="justify-start items-center aspect-[376/33] w-[14.583vw] flex text-[1.146vw] font-semibold cursor-pointer hover:text-red-600 active:text-red-600 transition-colors duration-300 text-red-900 absolute bottom-[5vw]"
          onClick={() => router.push("/")} 
        >
          <Icon icon="streamline:logout-1-solid" style={{ width: "1.719vw", height: "1.719vw" }} />
          <h1 className="ml-[1vw]">Log Out</h1>
        </div>
              <Icon className="h-5 w-5" />
              {isExpanded && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-8 w-full px-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 p-3 w-full text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {isExpanded && (
            <span className="font-medium text-sm">Log Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;