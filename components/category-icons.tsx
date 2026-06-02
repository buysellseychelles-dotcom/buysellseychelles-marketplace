'use client';

import { 
  Car, 
  Home, 
  Briefcase, 
  Smartphone, 
  Ship, 
  Wrench, 
  Palmtree, 
  Shirt,
  type LucideIcon
} from 'lucide-react';
import type { Category } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  Car,
  Home,
  Briefcase,
  Smartphone,
  Ship,
  Wrench,
  Palmtree,
  Shirt,
};

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className = 'h-6 w-6' }: CategoryIconProps) {
  const Icon = iconMap[iconName] || Car;
  return <Icon className={className} />;
}

export function getCategoryIcon(category: Category): LucideIcon {
  const categoryIconMap: Record<Category, LucideIcon> = {
    'cars': Car,
    'real-estate': Home,
    'jobs': Briefcase,
    'electronics': Smartphone,
    'boats': Ship,
    'services': Wrench,
    'tourism': Palmtree,
    'fashion': Shirt,
  };
  
  return categoryIconMap[category];
}
