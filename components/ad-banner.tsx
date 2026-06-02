'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface AdBannerProps {
  position: 'header' | 'sidebar' | 'inline';
  className?: string;
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed && position !== 'inline') return null;

  const positionStyles = {
    header: 'w-full py-3 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10',
    sidebar: 'w-full p-4 bg-card border border-border rounded-xl',
    inline: 'w-full p-4 bg-secondary/50 border border-border rounded-xl my-4',
  };

  return (
    <div className={`relative ${positionStyles[position]} ${className}`}>
      {position !== 'inline' && (
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
          aria-label="Dismiss ad"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
      
      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Advertisement
        </span>
        
        {position === 'header' && (
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">Ad</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                Advertise Your Business Here
              </p>
              <p className="text-xs text-muted-foreground">
                Reach thousands of buyers in Seychelles
              </p>
            </div>
          </div>
        )}

        {position === 'sidebar' && (
          <div className="space-y-3">
            <div className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">300x300</span>
                <p className="text-xs text-muted-foreground mt-1">Ad Space</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Contact us to advertise here
            </p>
          </div>
        )}

        {position === 'inline' && (
          <div className="flex items-center gap-4 w-full">
            <div className="w-24 h-20 bg-secondary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">Ad</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                Promote Your Listing
              </p>
              <p className="text-xs text-muted-foreground">
                Get 5x more views with Featured Ads
              </p>
              <button className="text-xs text-primary font-medium hover:underline mt-1">
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
