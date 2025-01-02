import { Card, CardContent } from "@/components/ui/card";
// import EditEmployeeModal from "./EditEmployeeModal";

interface ProfileHeaderProps {
  employee: any;
  showEditButton?: boolean; 
}

export default function ProfileHeader({ employee, showEditButton = true }: ProfileHeaderProps) {
  const handleUpdateEmployee = (updatedData: any) => {
    console.log("Updated employee data:", updatedData);
  };

  if (!employee) {
    return (
      <Card className="bg-[#0A1D56]">
        <CardContent className="p-6">
          <div className="text-white">Select an employee to view details.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A1D56] w-full h-[20vh]">
      <CardContent className="p-[1.25vw]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-[0.833vw]">
            <div className="h-[3.333vw] w-[3.333vw] rounded-full bg-slate-100 overflow-hidden">
              {/* Add avatar image here */}
              <img
                src={employee.avatar || "/placeholder-avatar.png"}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-[0.208vw]">
              <h2 className="text-[1.5vw] font-bold text-white">{employee.name}</h2>
              <p className="text-slate-300 text-[1vw]">ID-{employee.id}</p>
              <div className="text-slate-300 mt-[0.833vw] text-[1vw]">
                <div className="grid grid-cols-[4vw_1fr]">
                  <span>Team</span>
                  <span>: {employee.team}</span>
                </div>
                <div className="grid grid-cols-[4vw_1fr]">
                  <span>Role</span>
                  <span>: {employee.role}</span>
                </div>
              </div>
            </div>
          </div>
          {/* {showEditButton && (
            <EditEmployeeModal employee={employee} onUpdate={handleUpdateEmployee} />
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
