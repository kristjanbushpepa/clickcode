
import React from 'react';
import { RestaurantManagement } from './RestaurantManagement';

// This component now just wraps the new RestaurantManagement component
// to maintain backward compatibility
const RestaurantList = () => {
  return <RestaurantManagement />;
};

export default RestaurantList;
