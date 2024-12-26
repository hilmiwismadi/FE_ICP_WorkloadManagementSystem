import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function ProgrammingLanguages({ languages }: any) {
  return (
    <Card className="bg-[#0A1D56] min-h-[290px]">
      <CardHeader>
        <CardTitle className="text-white">Programming Language</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {languages.map((lang: any) => (
            <div
              key={lang.name}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2"
            >
              <Image
                src={lang.icon}
                alt={lang.name}
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}