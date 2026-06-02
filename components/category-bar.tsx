'use client';

import { CATEGORIES, type Category } from '@/lib/types';
import { CategoryIcon } from '@/components/category-icons';

interface CategoryBarProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function CategoryBar({ selectedCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {/* All Categories Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <svg 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          All
        </button>

        {/* Category Buttons */}
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <CategoryIcon iconName={category.icon} className="h-4 w-4" />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
