// app/task/types.ts
export interface Assign {
    task_Id: string;
    employee_Id: string;
    employee: Employee;
  }
  
  export interface Task {
    task_Id: string;
    title: string;
    type: string;
    description?: string;
    status: 'Ongoing' | 'Done' | 'Approved';
    priority: 'High' | 'Medium' | 'Normal';
    workload: number;
    start_Date: string;
    end_Date: string;
    user_Id: string;
    assigns: Assign[];
  }
  
  export interface Employee {
    employee_Id: string;
    name: string;
    image: string;
    phone: string;
    team: string;
    skill: string;
    current_Workload: number;
    start_Date: string;
    users?: { email: string; role: string; }[];
    email?: string;
  }