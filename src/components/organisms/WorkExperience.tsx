import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

type Experience = {
  joinDate: string;
  role: string;
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
    <Card className="bg-white shadow-sm rounded-[0.3vw]">
      <CardHeader className="pb-3 border-b border-gray-200">
        <CardTitle className="text-[0.95vw] font-medium text-gray-900">Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800 text-base">{experience.role}</h3>
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-gray-600 text-[0.8vw] px-2 py-0.5 rounded-[0.3rem]"
            >
              {experience.batch}
            </Badge>
          </div>
          <div className="space-y-[0.4vw]">
            <div className="flex items-center text-gray-600 text-[0.8vw]">
              <Calendar className="w-[0.8vw] h-[0.8vw] mr-[0.4vw]" />
              <span>Joined: {new Date(experience.joinDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600 text-[0.8vw]">
              <Clock className="w-[0.8vw] h-[0.8vw] mr-[0.4vw]" />
              <span>
                Duration: {years} Year{years !== 1 ? 's' : ''}, {months} Month{months !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkExperience;