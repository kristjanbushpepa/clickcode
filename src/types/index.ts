
export interface Restaurant {
  id: string;
  name: string;
  name_sq?: string;
  name_it?: string;
  name_de?: string;
  name_fr?: string;
  name_zh?: string;
  description?: string;
  description_sq?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_zh?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_path?: string;
  banner_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
