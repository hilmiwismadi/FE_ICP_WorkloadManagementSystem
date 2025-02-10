import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getPriorityColor(priority: string) {
  const value = parseFloat(priority);
  return {
    bg: value >= 7 ? 'bg-red-50' : value >= 4 ? 'bg-yellow-50' : 'bg-green-50',
    text: value >= 7 ? 'text-red-700' : value >= 4 ? 'text-yellow-700' : 'text-green-700',
  };
}

function getStatusColor(status: string) {
  return status === "Ongoing"
    ? "bg-amber-100 text-amber-800"
    : status === "Done"
    ? "bg-green-100 text-green-800"
    : "bg-blue-100 text-blue-800";
}

export default function TaskList({ tasks }: any) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-[0.3vw]">
      <CardHeader className="border-b border-gray-200 p-4">
        <CardTitle className="text-gray-900 text-sm font-medium">Ongoing Task Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-3 h-[35.5vw] overflow-y-auto rounded-[0.3vw] scrollbar-hide">
        <div className="space-y-3">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="relative bg-white border border-gray-200 rounded-[0.3vw] hover:bg-gray-50 transition-all duration-200 ease-in-out shadow-sm"
            >
              <div className="p-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center justify-between">
                      {/* Status Badge */}
                      <span
                        className={`${getStatusColor(task.status)} text-xs font-medium px-2 py-0.5 rounded-[0.3vw]`}
                      >
                        {task.status}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`${getPriorityColor(task.mcda).bg} ${
                          getPriorityColor(task.mcda).text
                        } text-xs font-medium px-2 py-0.5 rounded-full`}
                      >
                        {task.mcda}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {task.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
