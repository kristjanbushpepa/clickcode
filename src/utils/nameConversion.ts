
/**
 * Utility functions for converting between restaurant names and URL-friendly formats
 */

export const convertUrlToRestaurantName = (urlName: string): string => {
  if (!urlName) return '';
  
  // Convert hyphens to spaces and capitalize each word
  return urlName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const convertRestaurantNameToUrl = (restaurantName: string): string => {
  if (!restaurantName) return '';
  
  // Convert restaurant name to URL-friendly format
  return restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export const generatePossibleNames = (urlName: string): string[] => {
  const converted = convertUrlToRestaurantName(urlName);
  const variations = [
    converted,
    urlName,
    urlName.replace(/-/g, ' '),
    converted.toLowerCase(),
    converted.toUpperCase(),
  ];
  
  // Remove duplicates
  return [...new Set(variations)];
};
