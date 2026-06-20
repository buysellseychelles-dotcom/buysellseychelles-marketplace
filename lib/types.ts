export type Category = 
  | 'cars'
  | 'real-estate'
  | 'jobs'
  | 'electronics'
  | 'boats'
  | 'services'
  | 'tourism'
  | 'fashion';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'cars', name: 'Cars', icon: 'Car', description: 'Vehicles and automobiles' },
  { id: 'real-estate', name: 'Real Estate', icon: 'Home', description: 'Houses, apartments, and land' },
  { id: 'jobs', name: 'Jobs', icon: 'Briefcase', description: 'Employment opportunities' },
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone', description: 'Phones, computers, and gadgets' },
  { id: 'boats', name: 'Boats', icon: 'Ship', description: 'Boats and marine equipment' },
  { id: 'services', name: 'Services', icon: 'Wrench', description: 'Professional services' },
  { id: 'tourism', name: 'Tourism', icon: 'Palmtree', description: 'Tours, activities, and experiences' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', description: 'Clothing and accessories' },
];

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: Category;
  images: string[];
  location: string;
  whatsapp: string;
  isPremium: boolean;
  createdAt: string;
  userId: string;
  views: number;
  boosted?: boolean;
  boosted_at?: string;
  boost_expires_at?: string;
  boost_type?: string;
  boost_score?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'header' | 'sidebar' | 'inline';
}
