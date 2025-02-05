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
      <Card className="bg-[#0A1D56] min-h-[5vw]">
        <CardHeader>
          <CardTitle className="text-white text-[1.25vw] font-semibold">
            Programming Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[12vw] text-white text-[1vw]">
            No programming languages added yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#0A1D56] ${className}`}>
      <CardHeader>
        <CardTitle className="text-white text-[1.25vw] font-semibold">
          Programming Language
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Added fixed height and scrollbar */}
        <div className="max-h-[14vw] overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-[#0A1D56]">
          <div className="grid grid-cols-2 gap-[1vw]">
            {techStacks.map((tech) => (
              <div
                key={tech.skill_Id}
                className="flex items-center justify-center bg-white rounded-[0.5vw] w-full h-[3vw]"
              >
                <div className="relative flex justify-center items-center gap-[0.4vw]">
                  <Image
                    src={tech.image}
                    alt={tech.name}
                    width={200}
                    height={200}
                    className="w-[2vw] h-auto"
                  />
                  <h1 className="text-[0.8vw] font-medium text-slate-700 whitespace-nowrap">
                    {tech.name}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
