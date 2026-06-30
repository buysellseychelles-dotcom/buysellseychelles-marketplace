'use client';

import { ListingCard } from '@/components/listing-card';
import { AdBanner } from '@/components/ad-banner';
import type { Listing } from '@/lib/types';

interface ListingsGridProps {
  listings: Listing[];
  showAds?: boolean;
}

export function ListingsGrid({ listings, showAds = true }: ListingsGridProps) {
  // Sort listings: premium first, then by date
  const sortedListings = [...listings].sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (sortedListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-12 h-12 text-muted-foreground"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  // Insert inline ads every 8 listings
  const itemsWithAds: (Listing | 'ad')[] = [];
  sortedListings.forEach((listing, index) => {
    itemsWithAds.push(listing);
    if (showAds && (index + 1) % 8 === 0 && index < sortedListings.length - 1) {
      itemsWithAds.push('ad');
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {itemsWithAds.map((item, index) => {
        if (item === 'ad') {
          return (
            <div key={`ad-${index}`} className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <AdBanner position="inline" />
            </div>
          );
        }
        return (
          <ListingCard 
            key={item.id} 
            listing={item}
            priority={index < 4}
          />
        );
      })}
    </div>
  );
}
