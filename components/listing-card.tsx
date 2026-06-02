'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Eye, Star, Clock, Rocket } from 'lucide-react';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { formatPrice, formatDate, truncateText } from '@/lib/format';
import type { Listing } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
}

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const category = CATEGORIES.find(c => c.id === listing.category);

  // 🚀 BOOST ACTIVE
  const isBoostActive =
    listing.boosted &&
    listing.boosted_at &&
    listing.boost_expires_at &&
    new Date(listing.boost_expires_at) > new Date();

  return (
    <div className={`group bg-card rounded-xl overflow-hidden border transition-all hover:shadow-lg ${
      isBoostActive
        ? 'border-yellow-400 ring-2 ring-yellow-300/30'
        : listing.isPremium
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-border hover:border-primary/30'
    }`}>

      {/* Image Container */}
      <Link href={`/listing/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden">

        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />

        {/* 🚀 BOOST BADGE */}
        {isBoostActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-yellow-400 text-black text-xs font-semibold rounded-full">
            <Rocket className="h-3 w-3" />
            Boost
          </div>
        )}

        {/* Premium Badge */}
        {listing.isPremium && !isBoostActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}

        {/* Image Count */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-foreground/80 text-background text-xs font-medium rounded-md">
            1/{listing.images.length}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 text-foreground text-xs font-medium rounded-full">
          {category?.name}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">

        {/* Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-lg font-bold ${
            isBoostActive ? 'text-yellow-500' : 'text-primary'
          }`}>
            {listing.category === 'jobs'
              ? `${formatPrice(listing.price)}/mo`
              : formatPrice(listing.price)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/listing/${listing.id}`}>
          <h3 className="font-semibold text-foreground leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors">
            {truncateText(listing.title, 60)}
          </h3>
        </Link>

        {/* Location & Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(listing.createdAt)}
          </span>
        </div>

        {/* Views & WhatsApp */}
        <div className="flex items-center justify-between pt-2 border-t border-border">

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {listing.views} views
          </span>

          <WhatsAppButton
            phone={listing.whatsapp}
            listingTitle={listing.title}
            size="sm"
          />
        </div>

      </div>
    </div>
  );
}