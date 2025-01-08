import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Experience = {
  joinDate: string; // Assuming joinDate is a string (ISO date string)
  role: string;     // Add role property
  batch: string; 
};

const calculateExperience = (joinDate: string) => {
  const start = new Date(joinDate);
  const today = new Date();
  
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months };
};

const WorkExperience = ({ experience }: { experience: Experience }) => {
  const { years, months } = calculateExperience(experience.joinDate);
  
  return (
    <Card className="bg-[#0A1D56] h-[12.666vw]">
      <CardHeader className="space-y-[0.417vw]">
        <CardTitle className="text-[1.25vw] font-semibold text-white">Work Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-[1.25vw]">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-white text-[1.1vw]">{experience.role}</h3>
            <Badge variant="secondary" className="text-gray-600 text-[0.9vw] bg-white rounded-full px-[0.833vw]">
              {experience.batch}
            </Badge>
          </div>
          <div className="space-y-[0.417vw]">
            <p className="text-[0.9vw] text-gray-200">
              Join Date: {new Date(experience.joinDate).toLocaleDateString()}
            </p>
            <p className="text-[0.9vw] text-gray-200">
              Duration: {years} Year{years !== 1 ? 's' : ''}, {months} Month{months !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkExperience;