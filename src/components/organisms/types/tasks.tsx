// types/tasks.tsx
export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  workload: string;
  description: string;
  priority: string;
  status: 'Ongoing' | 'Done' | 'Approved';
  team: string;
}