// types/tasks.tsx
export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  workload: string;
  urgency: string;
  description: string;
  priority: string;
  status: 'ongoing' | 'done' | 'approved';
}