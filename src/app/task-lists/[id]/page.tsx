import Link from "next/link";
import Sidebar from "@/components/sidebar";
import TaskTimeline from "@/components/organisms/tasks-list-calendar";
import TaskListTimeline from "@/components/organisms/TasklistTimeline";

export default function TaskLists() {
  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="w-[65vw] flex-1  h-screen ml-[0.417vw] py-[1vw]  space-y-[1.25vw]">
            <TaskTimeline/>
          </div>
          <div className="w-[15vw]  h-full ml-[0.417vw] py-[1vw] space-y-[1.25vw]">
            <TaskListTimeline/>
          </div>
        </div>
    </div>
  );
}