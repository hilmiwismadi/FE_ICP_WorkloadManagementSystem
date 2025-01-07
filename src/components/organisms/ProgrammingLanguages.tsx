import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function ProgrammingLanguages({ languages }: any) {
  // Take only the first 5 languages
  const displayLanguages = languages.slice(0, 6);

  return (
    <Card className="bg-[#0A1D56] min-h-[19vw]">
      <CardHeader>
        <CardTitle className="text-white text-xl font-semibold">
          Programming Language
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className=" grid grid-cols-2 gap-[1vw]">
          {displayLanguages.map((lang: any) => (
            <div
              key={lang.name}
              className="flex items-center justify-center bg-white rounded-[0.5vw] w-[10vw] h-[3vw]"
            >
              <div className="relative flex justify-center items-center gap-[0.4vw]">
                <Image
                  src={lang.icon}
                  alt={lang.name}
                  width={200}
                  height={200}
                  className="w-[2vw] h-auto"
                />
                <h1 className="text-[1vw] font-medium text-slate-700 whitespace-nowrap">
                  {lang.name}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
