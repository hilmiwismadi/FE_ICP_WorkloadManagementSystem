import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../../styles/task-list.css";

// Dummy tasks data
const dummyTasks = [
    {
      id: 1,
      title: "API Integration",
      startDate: new Date(2025, 0, 15),
      endDate: new Date(2025, 0, 21),
      workload: "high",
      urgency: "critical",
      description: "Integrate payment gateway API with error handling and security measures",
      priority: "6.5"
    },
    {
      id: 2,
      title: "Database Migration",
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 18),
      workload: "medium",
      urgency: "normal",
      description: "Migrate user data to new schema with zero downtime strategy",
      priority: "2.8"
    },
    {
      id: 3,
      title: "UI Redesign",
      startDate: new Date(2025, 0, 13),
      endDate: new Date(2025, 0, 19),
      workload: "high",
      urgency: "high",
      description: "Implement new design system across all main components",
      priority: "8.1"
    },
    {
      id: 4,
      title: "Performance Optimization",
      startDate: new Date(2025, 0, 14),
      endDate: new Date(2025, 0, 20),
      workload: "medium",
      urgency: "normal",
      description: "Optimize application performance and reduce loading times",
      priority: "5.8"
    },
    {
      id: 5,
      title: "Security Audit",
      startDate: new Date(2025, 0, 16),
      endDate: new Date(2025, 0, 22),
      workload: "high",
      urgency: "critical",
      description: "Conduct comprehensive security audit and implement fixes",
      priority: "9.8"
    },
    {
      id: 6,
      title: "Documentation Update",
      startDate: new Date(2025, 0, 17),
      endDate: new Date(2025, 0, 23),
      workload: "low",
      urgency: "low",
      description: "Update technical documentation and API references",
      priority: "6.9"
    },
    {
      id: 7,
      title: "Testing Automation",
      startDate: new Date(2025, 0, 18),
      endDate: new Date(2025, 0, 24),
      workload: "medium",
      urgency: "high",
      description: "Implement automated testing suite for core functionalities",
      priority: "3.7"
    }
  ];

function getPriorityColor(priority: string) {
  const value = parseFloat(priority);
  if (value >= 7) return "bg-red-500";
  if (value >= 4) return "bg-yellow-500";
  return "bg-green-500";
}

export default function TaskListTimeline() {
  return (
    <Card className="bg-[#0A1D56]">
      <CardHeader>
        <CardTitle className="text-white text-[1.25vw]">Task</CardTitle>
      </CardHeader>
      <CardContent className="h-[80vh] mr-[0.5vw] overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-[#0A1D56]">
        {/* Scrollable content */}
        <div className="space-y-[0.833vw] mt-[0.5vw]">
          {dummyTasks.map((task) => (
            <Card key={task.id} className="bg-white">
              <CardContent className="p-[0.833vw]">
                <div className="flex justify-between items-start relative ">
                  <div className="space-y-[0.217vw]">
                    <h3 className="font-medium text-[0.8vw]">{task.title}</h3>
                    <p className="font-medium text-[0.7vw] text-gray-500">{task.description}</p>
                    {/* <p className=" text-[0.7vw] text-gray-500">{task.description}</p> */}
                    {/* <p className=" text-[0.7vw] text-gray-500">Due: {task.dueDate}</p> */}
                  </div>
                  <div className="flex absolute -top-[1.2vw] -right-[1.5vw]">
                    <span
                      className={`${getPriorityColor(
                        task.priority
                      )} text-white text-[0.9vw] px-[0.417vw] py-[0.208vw] rounded-full bottom-0`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}