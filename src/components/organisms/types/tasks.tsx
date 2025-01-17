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
  
  export const taskData: Task[] = [
    {
      id: 1,
      title: "API Integration",
      startDate: new Date(2025, 0, 15),
      endDate: new Date(2025, 0, 21),
      workload: "high",
      urgency: "critical",
      description: "Integrate payment gateway API with error handling and security measures",
      priority: "6.5",
      status: "ongoing"
    },
    {
      id: 2,
      title: "Database Migration",
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 18),
      workload: "medium",
      urgency: "normal",
      description: "Migrate user data to new schema with zero downtime strategy",
      priority: "2.8",
      status: "done"
    },
    {
      id: 3,
      title: "UI Redesign",
      startDate: new Date(2025, 0, 13),
      endDate: new Date(2025, 0, 19),
      workload: "high",
      urgency: "high",
      description: "Implement new design system across all main components",
      priority: "8.1",
      status: "approved"
    },
    {
      id: 4,
      title: "Performance Optimization",
      startDate: new Date(2025, 0, 14),
      endDate: new Date(2025, 0, 20),
      workload: "medium",
      urgency: "normal",
      description: "Optimize application performance and reduce loading times",
      priority: "5.8",
      status: "ongoing"
    },
    {
      id: 5,
      title: "Security Audit",
      startDate: new Date(2025, 0, 16),
      endDate: new Date(2025, 0, 22),
      workload: "high",
      urgency: "critical",
      description: "Conduct comprehensive security audit and implement fixes",
      priority: "9.8",
      status: "ongoing"
    },
    {
      id: 6,
      title: "Documentation Update",
      startDate: new Date(2025, 0, 17),
      endDate: new Date(2025, 0, 23),
      workload: "low",
      urgency: "low",
      description: "Update technical documentation and API references",
      priority: "6.9",
      status: "done"
    },
    {
      id: 7,
      title: "Testing Automation",
      startDate: new Date(2025, 0, 18),
      endDate: new Date(2025, 0, 24),
      workload: "medium",
      urgency: "high",
      description: "Implement automated testing suite for core functionalities",
      priority: "3.7",
      status: "approved"
    }
  ];