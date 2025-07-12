
export interface Menu {
  id: string;
  restaurant_name: string;
  categories: Category[];
  items: MenuItem[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  order_index: number;
}

export interface Restaurant {
  id: string;
  name: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}
