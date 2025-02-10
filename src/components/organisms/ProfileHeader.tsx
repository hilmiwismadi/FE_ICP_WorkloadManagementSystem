import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { DeleteConfirmModal } from "@/app/profile/[id]/delete-emp-modal";
import { EditEmployeeModal } from "@/app/profile/[id]/edit-emp-modal";
import { Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";


interface User {
  email: string;
  role: string;
}

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  phone: string;
  team: string;
  skill: string;
  current_Workload: number;
  start_Date: string;
  users: User[];
}

interface ProfileHeaderProps {
  id: string;
  showEditButton?: boolean;
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

export default function ProfileHeader({ id, showEditButton = true }: ProfileHeaderProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);


  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
      );
      const result = await response.json();

      if (result.data) {
        setEmployee({
          ...result.data,
          image: getImageUrl(result.data.image)
        });
      } else {
        setError("Employee data not found");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError("Failed to fetch employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  if (loading) {
    return (
      <Card className="bg-[#0A1D56]">
        <CardContent className="p-4">
          <div className="text-white text-sm">Loading employee details...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !employee) {
    return (
      <Card className="bg-[#0A1D56]">
        <CardContent className="p-4">
          <div className="text-white text-sm">{error || "Select an employee to view details."}</div>
        </CardContent>
      </Card>
    );
  }

  return (
<Card className="bg-[#0A1D56] w-full h-[25vh] rounded-lg shadow-lg overflow-hidden">
  <CardContent className="p-6 h-full">
    <div className="flex items-center h-full gap-8">
      {/* Left side - Image */}
      <div className="flex-shrink-0">
        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#29A6DE] bg-slate-100 shadow-lg">
          <Image
            src={employee.image || "/img/sidebar/UserProfile.png"}
            alt="Avatar"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>

      {/* Right side - Content */}
      <div className="flex-grow grid grid-cols-2 gap-x-8">
        {/* Left column (Name + Modals) */}
        <div className="space-y-2">
          {/* Name and Actions Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              {employee.name}
            </h2>
          </div>

          {/* Employee Details */}
          <div className="space-y-1">
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">ID</span>
              <span className="text-white">{employee.employee_Id}</span>
            </p>
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">Email</span>
              <span className="text-white">{employee.users[0]?.email || "N/A"}</span>
            </p>
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">Phone</span>
              <span className="text-white">{employee.phone}</span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-2 relative">
          {/* Buttons on Top */}
          <div className="absolute top-0 right-0 flex gap-2 pt-2">
          <motion.button
              onClick={() => setIsEditOpen(true)}
              className="p-1 rounded-full hover:bg-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </motion.button>
            {/* Delete Button */}
            <motion.button
              onClick={() => setIsDeleteOpen(true)}
              className="p-1 rounded-full hover:bg-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </motion.button>
          </div>

          {/* Right column content */}
          <div className="space-y-1 pt-8">
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">Team</span>
              <span className="text-white">{employee.team}</span>
            </p>
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">Role</span>
              <span className="text-white">{employee.users[0]?.role || "N/A"}</span>
            </p>
            <p className="text-slate-300 text-sm flex items-center">
              <span className="w-16 text-slate-400">Skill</span>
              <span className="text-white">{employee.skill}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </CardContent>

{/* Delete Confirmation Modal */}
<DeleteConfirmModal
 employeeId={employee.employee_Id}
 employeeName={employee.name}
 open={isDeleteOpen}
 onOpenChange={setIsDeleteOpen}
/>

{/* Edit Modal */}
<EditEmployeeModal
  employee={employee}
  open={isEditOpen}
  onOpenChange={setIsEditOpen}
/>
</Card>
  );
}