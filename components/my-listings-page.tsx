'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMarketplaceStore } from '@/lib/store-old';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { formatPrice, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Package,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

export function MyListingsPage() {
  const { currentUser, listings, deleteListing } = useMarketplaceStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userListings = currentUser 
    ? listings.filter((l) => l.userId === currentUser.id)
    : [];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setDeletingId(id);
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteListing(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              {userListings.length} listing{userListings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Create Listing
            </Button>
          </Link>
        </div>

        {!currentUser ? (
          /* Not Logged In */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to view your listings
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create an account or sign in to manage your listings and track their performance.
            </p>
          </div>
        ) : userListings.length === 0 ? (
          /* No Listings */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No listings yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start selling by creating your first listing. It&apos;s quick and easy!
            </p>
            <Link href="/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          /* Listings List */
          <div className="space-y-4">
            {userListings.map((listing) => (
              <div 
                key={listing.id}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${
                  listing.isPremium 
                    ? 'border-accent ring-1 ring-accent/20' 
                    : 'border-border'
                } ${deletingId === listing.id ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link 
                    href={`/listing/${listing.id}`}
                    className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0"
                  >
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    {listing.isPremium && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/listing/${listing.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                            {listing.title}
                          </h3>
                        </Link>
                        <p className="text-lg font-bold text-primary mt-1">
                          {formatPrice(listing.price)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views} views
                          </span>
                          <span>Posted {formatDate(listing.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/listing/${listing.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="gap-1" disabled>
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
