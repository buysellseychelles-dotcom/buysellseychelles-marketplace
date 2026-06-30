'use client';

import { useState, useMemo } from 'react';
import { useMarketplaceStore } from '@/lib/store-old';
import { Header } from '@/components/header';
import { CategoryBar } from '@/components/category-bar';
import { ListingsGrid } from '@/components/listings-grid';
import { AdBanner } from '@/components/ad-banner';
import { Footer } from '@/components/footer';
import type { Category } from '@/lib/types';

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const listings = useMarketplaceStore((state) => state.listings);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch = searchQuery === '' || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || 
        listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  const premiumCount = filteredListings.filter(l => l.isPremium).length;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      {/* Top Ad Banner */}
      <AdBanner position="header" className="border-b border-border" />

      {/* Category Navigation */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto">
          <CategoryBar 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedCategory 
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Listings`
                : searchQuery 
                  ? `Search Results for "${searchQuery}"`
                  : 'All Listings'
              }
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
              {premiumCount > 0 && (
                <span className="ml-2 text-accent">
                  ({premiumCount} featured)
                </span>
              )}
            </p>
          </div>

          {/* Sort/Filter options could go here */}
          <div className="flex items-center gap-2">
            <select className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>Most Recent</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Viewed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Listings Grid */}
          <div className="flex-1">
            <ListingsGrid listings={filteredListings} />
          </div>

          {/* Sidebar Ads - Desktop Only */}
          <aside className="hidden xl:block w-72 shrink-0 space-y-6">
            <AdBanner position="sidebar" />
            <AdBanner position="sidebar" />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
