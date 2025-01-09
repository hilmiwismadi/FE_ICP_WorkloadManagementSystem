"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ArrowLeft , LayoutDashboard, Users, ClipboardList, LogOut } from 'lucide-react';

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
  const [userData, setUserData] = useState<any>(null); 
  const pathname = usePathname();
  const router = useRouter();

  // Fetch user data from localStorage when the component mounts
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <div
      className={`relative min-h-screen bg-navy transition-all duration-300 ease-in-out cursor-pointer ${
        isExpanded ? 'w-[16vw]' : 'w-[5vw]'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Back Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.back();
        }}
        className="absolute -right-[0.625vw] top-[1.667vw] bg-white rounded-full py-[0.5vw] px-[0.75vw] border border-gray-200 hover:bg-gray-100 hover:scale-125 transition-transform duration-200"
      >
        <ArrowLeft  className="h-[1vw] w-[1vw] text-navy font-bold" />
      </button>

      {/* Logo */}
      <div 
        className="flex justify-center py-[2.5vw]"
      >
        <Image
          src="/img/sidebar/Logo_IconPlus.png"
          alt="logo"
          width={isExpanded ? 120 : 40}
          height={isExpanded ? 120 : 40}
          className={`transition-all duration-300 ${isExpanded ? 'w-[8vw] h-[3vw]' : 'w-[3vw] h-[1.25vw]'}`}
        />
      </div>

      {/* User Profile */}
      <div 
        className="mx-[1vw] mb-[1.667vw]"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="bg-[#243F80] rounded-[1vw] p-[1vw] transition-all duration-300">
          <div className="flex items-center gap-[0.625vw]">
            <Image
              src="/img/sidebar/UserProfile.png"
              alt="profile"
              width={40}
              height={40}
              className={`rounded-full transition-all duration-300 ${isExpanded ? 'w-[3vw] h-[3vw]' : 'w-[1vw] h-[1vw]'}`}
            />
            {isExpanded && userData && (
              <div className="flex flex-col text-white">
                <span className="font-semibold text-[1.25vw]">{userData.name}</span>
                <span className="text-[1vw]">{userData.user_Id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav 
        className="px-[1vw] space-y-[1vw]"
        onClick={(e) => e.stopPropagation()} 
      >
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;
          
          return (
            <Link
              key={item.link}
              href={item.link}
              className={`flex items-center gap-[1vw] p-[1vw] rounded-[1vw] transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-900 text-white' 
                  : 'text-gray-400 hover:bg-blue-900/50 hover:text-white'
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

      {/* Logout Button */}
      <div 
        className="absolute bottom-[1.667vw] w-full px-[0.833vw]"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-[1vw] p-[1vw] w-full text-red-500 hover:bg-red-500/10 rounded-[1vw] transition-all duration-200"
        >
          <LogOut className="h-[1.042vw] w-[1.042vw]" />
          {isExpanded && (
            <span className="font-medium text-[0.9vw]">Log Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;