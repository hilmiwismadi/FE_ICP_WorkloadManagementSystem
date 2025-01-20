// types/tasks.tsx
export interface Task {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  workload: string;
  urgency: string;
  description: string;
  priority: string;
  status: 'ongoing' | 'done' | 'approved';
}