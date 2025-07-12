
import React from 'react';
import { Restaurant } from '@/types';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant }) => {
  return (
    <header className="bg-primary text-primary-foreground py-8">
      <div className="container">
        <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 text-sm opacity-90">
          {restaurant.address && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>
                {restaurant.address}
                {restaurant.city && `, ${restaurant.city}`}
                {restaurant.country && `, ${restaurant.country}`}
              </span>
            </div>
          )}
          
          {restaurant.owner_phone && (
            <div className="flex items-center gap-1">
              <span>📞</span>
              <span>{restaurant.owner_phone}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
