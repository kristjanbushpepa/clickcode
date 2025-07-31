
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface RestaurantProfile {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  working_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  social_media_links: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  logo_url?: string;
  banner_url?: string;
  google_reviews_embed?: string;
}

interface WorkingHoursProps {
  register: UseFormRegister<RestaurantProfile>;
}

export function WorkingHours({ register }: WorkingHoursProps) {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Working Hours
        </CardTitle>
        <CardDescription>
          Set your opening hours for each day of the week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="space-y-2">
              <Label htmlFor={day} className="capitalize">{day}</Label>
              <Input
                id={day}
                {...register(`working_hours.${day}` as keyof RestaurantProfile)}
                placeholder="e.g., 9:00 AM - 10:00 PM"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
