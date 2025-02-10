import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ActivityDetailsButtonProps {
  employeeId: string; // Changed from taskId to employeeId
}

const ActivityDetailsButton: React.FC<ActivityDetailsButtonProps> = ({ employeeId }) => {
  return (
    <Link
      href={`/activity/${employeeId}`}
      className="w-full bg-[#0052CC] hover:bg-[#003D99] text-white py-[0.8vw] px-[0.6vw] rounded-[0.3vw] flex items-center justify-between shadow-md transition-all duration-300"
    >
      <span className="text-[0.8vw] font-medium">See Task Details</span>
      <ChevronRight className="w-[0.6vw] h-[0.6vw]" />
    </Link>
  );
};

export default ActivityDetailsButton;
