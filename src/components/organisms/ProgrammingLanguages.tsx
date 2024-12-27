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
        <div className="grid grid-cols-2 space-y-1 gap-4">
          {displayLanguages.map((lang: any) => (
            <div
              key={lang.name}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 
                         hover:bg-slate-50 transition-colors duration-200
                         shadow-sm hover:shadow-md"
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={lang.icon}
                  alt={lang.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                {lang.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}