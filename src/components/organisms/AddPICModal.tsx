import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface Employee {
  employee_Id: string;
  name: string;
  image: string;
  phone: string;
  team: string;
  skill: string;
  current_Workload: number;
  start_Date: string;
  users: {
    email: string;
    role: string;
  }[];
}

interface PromotePICModalProps {
  onSuccess?: () => void;
}

export function PromotePICModal({ onSuccess }: PromotePICModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [managerData, setManagerData] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

    // Add JWT token decoding effect
    useEffect(() => {
      const authToken = Cookies.get("auth_token");
      if (authToken) {
        try {
          const decodedToken: { role: string, user_Id: string } = jwtDecode(authToken);
          setUserRole(decodedToken.role);
          if (decodedToken.role === "Manager") {
            setManagerData(decodedToken.user_Id);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error("Invalid JSON response from server");
      }

      console.log("1. Parsed API response:", data);

      // Check if data is an array, if not, look for it in a property
      const employeesArray = Array.isArray(data) ? data : data.data || [];
      console.log("2. Employees array:", employeesArray);

      if (!Array.isArray(employeesArray)) {
        throw new Error("Expected array of employees but got: " + typeof employeesArray);
      }

      // Filter for employees (with more detailed logging)
      const regularEmployees = employeesArray.filter((emp: Employee) => {
        console.log("Checking employee:", emp);
        if (!emp.users || !Array.isArray(emp.users)) {
          console.log("No users array for:", emp.name);
          return false;
        }
        const isRegularEmployee = emp.users.some(user => {
          console.log("Checking user role:", user.role);
          return user.role === "Employee";
        });
        console.log("Is regular employee:", isRegularEmployee);
        return isRegularEmployee;
      });

      console.log("3. Filtered regular employees:", regularEmployees);
      
      setEmployees(regularEmployees);
      setFilteredEmployees(regularEmployees);

      console.log("4. State updated with employees:", {
        employees: regularEmployees,
        filteredEmployees: regularEmployees
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Fetch error:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch employees: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to log state changes
  useEffect(() => {
    console.log("Employees state changed:", employees);
  }, [employees]);

  useEffect(() => {
    console.log("Filtered employees state changed:", filteredEmployees);
  }, [filteredEmployees]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    console.log("Search query:", value);
    console.log("Current employees:", employees);
    
    const filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(value.toLowerCase())
    );
    console.log("Filtered results:", filtered);
    
    setFilteredEmployees(filtered);
  };

  const handlePromotePIC = async () => {
    if (!selectedEmployee) return;
    
    console.log("Promoting employee to PIC:", selectedEmployee);
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/user/updateRole/${managerData}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_Id: selectedEmployee.employee_Id,
            role: "PIC"
          }),
        }
      );
      const data = await response.json();
      console.log("Promote to PIC response:", data);
      console.log(
        JSON.stringify({
          employee_Id: selectedEmployee.employee_Id,
          role: "PIC"
        })
      );

      if (!response.ok) throw new Error("Failed to promote employee to PIC");

      setShowConfirmation(false);
      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Employee successfully promoted to PIC",
        duration: 3000,
      });

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
        setSelectedEmployee(null);
        setSearchQuery("");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote employee to PIC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="h-11 bg-blue-500 hover:bg-blue-600 text-white">
            Promote to PIC
          </Button>
        </DialogTrigger>
        <DialogContent className="p-4 overflow-hidden rounded-lg w-[80vw]">
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <p className="text-xl font-semibold text-green-600">
                    Employee successfully promoted to PIC!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogHeader>
            <DialogTitle className="text-xl font-bold pt-5">
              Promote Employee to PIC
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Search employee name..."
                value={searchQuery}
                onValueChange={handleSearch}
              />
              <CommandEmpty>No employees found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredEmployees.map((emp) => (
                  <CommandItem
                    key={emp.employee_Id}
                    onSelect={() => {
                      setSelectedEmployee(emp);
                      setShowConfirmation(true);
                    }}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <img
                      src={emp.image}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-500">
                        {emp.team} - {emp.skill}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
        <AlertDialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-none z-50 bg-white rounded-lg p-6 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold mb-4">
              Confirm PIC Promotion
            </AlertDialogTitle>
            {selectedEmployee && (
              <div className="space-y-4">
                <AlertDialogDescription>
                  Please review the employee details below:
                </AlertDialogDescription>
                <div className="space-y-2 text-sm border rounded-md p-4 bg-gray-50">
                  <div><strong>Name:</strong> {selectedEmployee.name}</div>
                  <div><strong>ID:</strong> {selectedEmployee.employee_Id}</div>
                  <div><strong>Team:</strong> {selectedEmployee.team}</div>
                  <div><strong>Skill:</strong> {selectedEmployee.skill}</div>
                  <div><strong>Email:</strong> {selectedEmployee.users[0].email}</div>
                  <div><strong>Phone:</strong> {selectedEmployee.phone}</div>
                  <div>
                    <strong>Start Date:</strong>{" "}
                    {formatDate(selectedEmployee.start_Date)}
                  </div>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromotePIC}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Promoting..." : "Confirm Promotion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}