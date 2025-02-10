import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface TechStack {
  skill_Id: string;
  name: string;
  image: string;
}

interface ProgrammingLanguagesProps {
  techStacks: TechStack[];
  className?: string;
}

export default function ProgrammingLanguages({
  techStacks,
  className,
}: ProgrammingLanguagesProps) {
  if (!techStacks || techStacks.length === 0) {
    return (
      <Card className="bg-white shadow-sm rounded-[0.3vw] h-[19vw]">
        <CardHeader className="border-b border-gray-200 pb-3">
          <CardTitle className="text-gray-800 text-sm font-medium">
            Programming Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            -
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white shadow-sm ${className} rounded-[0.3vw] h-[19vw]`}>
      <CardHeader className="border-b border-gray-200 pb-3">
        <CardTitle className="text-gray-800 text-[0.95vw] font-medium">
          Tech Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[15vw] overflow-y-auto scrollbar-hide scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="py-[1vw]">
          <div className="grid grid-cols-2 gap-3">
            {techStacks.map((tech) => (
              <div
                key={tech.skill_Id}
                className="flex items-center justify-center bg-gray-50 rounded-[0.3vw] border border-gray-200 hover:bg-gray-100 transition-colors duration-200 py-2.5 px-3"
              >
                <div className="flex justify-start items-center gap-2 w-full">
                  <Image
                    src={tech.image}
                    alt={tech.name}
                    width={200}
                    height={200}
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {tech.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}