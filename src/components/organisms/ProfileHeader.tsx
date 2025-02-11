import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { DeleteConfirmModal } from "@/app/profile/[id]/delete-emp-modal";
import { EditEmployeeModal } from "@/app/profile/[id]/edit-emp-modal";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Users,
  Briefcase,
  Code,
} from "lucide-react";
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
  showDeleteButton?: boolean;
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

export default function ProfileHeader({
  id,
  showEditButton = true,
  showDeleteButton = true,
}: ProfileHeaderProps) {
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
          image: getImageUrl(result.data.image),
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="text-gray-600 text-xs">
            Loading employee details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !employee) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="text-gray-600 text-xs">
            {error || "Select an employee to view details."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-[0.3vw]">
      <CardContent className="p-4">
        {/* Main Content */}
        <div className="flex gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src={employee.image || "/img/sidebar/UserProfile.png"}
                alt="Avatar"
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Employee Information */}
          <div className="flex-grow">
            {/* Name and ID */}
            <div className="flex flex-row items-center mb-[0.625vw]">
              <div className="flex flex-col">
                <h2 className="text-sm font-medium text-gray-900">
                  {employee.name}
                </h2>
                <p className="text-xs text-gray-500">
                  ID: {employee.employee_Id}
                </p>
              </div>
              <div className="flex flex-grow justify-end items-center gap-2">
              {showEditButton && (
                    <motion.button
                      onClick={() => setIsEditOpen(true)}
                      className="p-1 rounded-full hover:bg-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </motion.button>
                  )}

              {showDeleteButton && (
                    <motion.button
                      onClick={() => setIsDeleteOpen(true)}
                      className="p-1 rounded-full hover:bg-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-3" />

            {/* Grid Layout for Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {employee.users[0]?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {employee.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{employee.team}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {employee.users[0]?.role || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {employee.skill}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

       {/* Delete Confirmation Modal */}
       {showDeleteButton && (
        <DeleteConfirmModal
          employeeId={employee.employee_Id}
          employeeName={employee.name}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      )}

      {/* Edit Modal */}
      {showEditButton && (
        <EditEmployeeModal
          employee={employee}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </Card>
  );
}
