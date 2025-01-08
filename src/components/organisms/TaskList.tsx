import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../../styles/task-list.css";

function getPriorityColor(priority: string) {
  const value = parseFloat(priority);
  if (value >= 7) return "bg-red-500";
  if (value >= 4) return "bg-yellow-500";
  return "bg-green-500";
}

export default function TaskList({ tasks }: any) {
  return (
    <Card className="bg-[#0A1D56]">
      <CardHeader>
        <CardTitle className="text-white text-[1.25vw]">Ongoing Task Summary</CardTitle>
      </CardHeader>
      <CardContent className="h-[35.5vw] mr-[0.5vw] overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-[#0A1D56]">
        {/* Scrollable content */}
        <div className="space-y-[0.833vw]">
          {tasks.map((task: any) => (
            <Card key={task.id} className="bg-white">
              <CardContent className="p-[0.833vw]">
                <div className="flex justify-between items-start">
                  <div className="space-y-[0.217vw]">
                    <h3 className="font-medium text-[1.25vw]">{task.type}</h3>
                    <p className="font-medium text-gray-500">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                  </div>
                  <div className="flex items-end">
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
