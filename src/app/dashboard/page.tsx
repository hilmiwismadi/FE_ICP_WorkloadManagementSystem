import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "@/components/data-table";

async function getData(): Promise<EmployeeData[]> {
  // Fetch data from your API here.
  return [
    {
      employee_id: "728ed52f",
      name: "Attaqi Sarjiman Wismadi",
      team: "Korporat",
      skill: "Backend Engineer",
      current_workload: 7.5,
      email: "ASW@gmail.com",
      phone: "08123456789",
    },
    {
      employee_id: "d99a31f9",
      name: "Dwi Hendra Putra",
      team: "Korporat",
      skill: "Frontend Developer",
      current_workload: 3.0,
      email: "dhp@gmail.com",
      phone: "08123456780",
    },
    {
      employee_id: "bf39c74b",
      name: "Alma Anindya",
      team: "Design",
      skill: "UI/UX Designer",
      current_workload: 6.5,
      email: "alma.a@gmail.com",
      phone: "08123456781",
    },
    {
      employee_id: "e45192a3",
      name: "Ryan Erwin",
      team: "Engineering",
      skill: "Software Engineer",
      current_workload: 2.0,
      email: "ryan.erwin@gmail.com",
      phone: "08123456782",
    },
    {
      employee_id: "73d65a59",
      name: "Tariq Ridwan",
      team: "Operations",
      skill: "DevOps Engineer",
      current_workload: 7.0,
      email: "tariq.ridwan@gmail.com",
      phone: "08123456783",
    },
    {
      employee_id: "a4f129ed",
      name: "Rita Suryani",
      team: "Human Resources",
      skill: "HR Specialist",
      current_workload: 6.0,
      email: "rita.suryani@gmail.com",
      phone: "08123456784",
    },
    {
      employee_id: "ad23b7b4",
      name: "Fahmi Rahmat",
      team: "Engineering",
      skill: "Mobile Developer",
      current_workload: 8.5,
      email: "fahmi.rahmat@gmail.com",
      phone: "08123456785",
    },
    {
      employee_id: "37e10b87",
      name: "Karin Widiastuti",
      team: "Marketing",
      skill: "Digital Marketing Specialist",
      current_workload: 6.0,
      email: "karin.widiastuti@gmail.com",
      phone: "08123456786",
    },
    {
      employee_id: "5d8c4f6d",
      name: "Anton Supriadi",
      team: "Sales",
      skill: "Sales Executive",
      current_workload: 7.0,
      email: "anton.supriadi@gmail.com",
      phone: "08123456787",
    },
    {
      employee_id: "b1f9ab92",
      name: "Lina Marwanto",
      team: "Customer Service",
      skill: "Customer Support Specialist",
      current_workload: 6.5,
      email: "lina.marwanto@gmail.com",
      phone: "08123456788",
    },
    {
      employee_id: "38b1d2e0",
      name: "Raihan Prabowo",
      team: "Korporat",
      skill: "Backend Engineer",
      current_workload: 8.0,
      email: "raihan.prabowo@gmail.com",
      phone: "08123456789",
    },
    {
      employee_id: "b5f492d3",
      name: "Ayu Septiani",
      team: "Finance",
      skill: "Financial Analyst",
      current_workload: 7.5,
      email: "ayu.septiani@gmail.com",
      phone: "08123456790",
    },
    {
      employee_id: "ea43c3a7",
      name: "Riko Setiawan",
      team: "Engineering",
      skill: "Software Engineer",
      current_workload: 9.5,
      email: "riko.setiawan@gmail.com",
      phone: "08123456791",
    },
    {
      employee_id: "a38cd516",
      name: "Dina Safitri",
      team: "Korporat",
      skill: "Frontend Developer",
      current_workload: 7.5,
      email: "dina.safitri@gmail.com",
      phone: "08123456792",
    },
    {
      employee_id: "9c4cfd32",
      name: "Lina Wulandari",
      team: "Design",
      skill: "UI/UX Designer",
      current_workload: 6.5,
      email: "lina.wulandari@gmail.com",
      phone: "08123456793",
    },
    {
      employee_id: "d1e87a63",
      name: "Budi Setyawan",
      team: "Operations",
      skill: "Operations Manager",
      current_workload: 7.0,
      email: "budi.setyawan@gmail.com",
      phone: "08123456794",
    },
    {
      employee_id: "b69bfe94",
      name: "Rina Haryani",
      team: "Human Resources",
      skill: "HR Specialist",
      current_workload: 7.0,
      email: "rina.haryani@gmail.com",
      phone: "08123456795",
    },
    {
      employee_id: "58c7ae84",
      name: "Fitrah Zaini",
      team: "Sales",
      skill: "Sales Manager",
      current_workload: 6.0,
      email: "fitrah.zaini@gmail.com",
      phone: "08123456796",
    },
    {
      employee_id: "b4693d1d",
      name: "Siti Rahmawati",
      team: "Marketing",
      skill: "SEO Specialist",
      current_workload: 6.5,
      email: "siti.rahmawati@gmail.com",
      phone: "08123456797",
    },
    {
      employee_id: "e0bb06fb",
      name: "Vita Chandra",
      team: "Customer Service",
      skill: "Customer Support Specialist",
      current_workload: 7.0,
      email: "vita.chandra@gmail.com",
      phone: "08123456798",
    },
    {
      employee_id: "ab12d6e7",
      name: "Irfan Alfarizi",
      team: "Korporat",
      skill: "Backend Engineer",
      current_workload: 8.0,
      email: "irfan.alfarizi@gmail.com",
      phone: "08123456799",
    },
    // ...
  ];
}

export default async function Dashboard() {
  const data = await getData();

  return (
    <div className="w-full bg-white h-screen text-[10vw] text-black flex justify-center items-center relative">
      <Sidebar />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
