import Image from "next/image";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  current_Workload: number;
  start_Date: string;
}

interface UserProfileProps {
  employee: Employee;
}

export default function UserProfile({ employee }: UserProfileProps) {
  return (
    <div className="bg-[#15234A] rounded-[0.8vw] text-white mb-[1vw] py-[1vw] w-full mx-auto">
      <div className="flex items-center mx-[2vw] mb-[1vw]">
        <div className="flex items-center gap-[2vw]">
          <Image
            src={employee.image || "/img/sidebar/UserProfile.png"}
            alt="User Avatar"
            className="rounded-full w-[7vw] h-[7vw]"
          />
          <div>
            <h2 className="text-[2vw] font-semibold">
              {employee.name}
            </h2>
            <p className="text-[1vw] text-gray-300">ID-{employee.employee_Id}</p>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[1vw] text-gray-300">
            {employee.email}
          </p>
          <p className="text-[1vw] text-gray-300">{employee.phone}</p>
        </div>
      </div>

      <div className="flex mx-[2vw] gap-[2vw] text-[1.1vw]">
        <div className="flex justify-center items-center w-[8/12] gap-[0.3vw]">
          <p className="text-gray-400 text-[1vw]">Team :</p>
          <p className="text-[1vw]">
            {employee.team}
          </p>
        </div>
        <div className="flex justify-center items-center w-[4/12] gap-[0.3vw]">
          <p className="text-gray-400 text-[1vw]">Role :</p>
          <p className="text-[1vw]">{employee.role}</p>
        </div>
      </div>
    </div>
  );
}