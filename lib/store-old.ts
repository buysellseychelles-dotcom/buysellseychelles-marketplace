'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing, User } from './types';
import { v4 as uuidv4 } from 'uuid';

interface MarketplaceState {
  listings: Listing[];
  users: User[];
  currentUser: User | null;
  
  // Listing actions
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views'>) => string;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  incrementViews: (id: string) => void;
  
  // User actions
  register: (name: string, email: string, phone: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Sample listings for demo
const sampleListings: Listing[] = [
  {
    id: '1',
    title: '2020 Toyota Hilux 4x4 - Excellent Condition',
    description: 'Well maintained Toyota Hilux, single owner, full service history. Perfect for island roads. Includes AC, power steering, and Bluetooth audio.',
    price: 450000,
    currency: 'SCR',
    category: 'cars',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    ],
    location: 'Victoria, Mahe',
    whatsapp: '+248 2 123 456',
    isPremium: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 234,
  },
  {
    id: '2',
    title: 'Beachfront Villa with Private Pool',
    description: 'Stunning 4-bedroom villa with direct beach access and infinity pool overlooking the Indian Ocean. Fully furnished with modern amenities.',
    price: 15000000,
    currency: 'SCR',
    category: 'real-estate',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    location: 'Beau Vallon, Mahe',
    whatsapp: '+248 2 234 567',
    isPremium: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 567,
  },
  {
    id: '3',
    title: 'iPhone 15 Pro Max 256GB - Brand New',
    description: 'Sealed box iPhone 15 Pro Max in Natural Titanium. International warranty included.',
    price: 25000,
    currency: 'SCR',
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    ],
    location: 'Victoria, Mahe',
    whatsapp: '+248 2 345 678',
    isPremium: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 89,
  },
  {
    id: '4',
    title: 'Hotel Restaurant Manager Position',
    description: 'Leading 5-star resort seeking experienced Restaurant Manager. Competitive salary, accommodation provided, and excellent benefits package.',
    price: 35000,
    currency: 'SCR',
    category: 'jobs',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    ],
    location: 'Praslin',
    whatsapp: '+248 2 456 789',
    isPremium: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 312,
  },
  {
    id: '5',
    title: '35ft Fishing Boat with Cabin',
    description: 'Professional fishing boat with twin 200HP outboards, GPS, fish finder, and full cabin. Ideal for deep sea fishing charters.',
    price: 850000,
    currency: 'SCR',
    category: 'boats',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    ],
    location: 'Port Victoria',
    whatsapp: '+248 2 567 890',
    isPremium: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 145,
  },
  {
    id: '6',
    title: 'Island Hopping Tour Package',
    description: 'Experience the best of Seychelles with our 3-island tour. Includes accommodation, transfers, and guided tours. Perfect for couples and families.',
    price: 45000,
    currency: 'SCR',
    category: 'tourism',
    images: [
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800',
      'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
      'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',
    ],
    location: 'Mahe, Praslin, La Digue',
    whatsapp: '+248 2 678 901',
    isPremium: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 423,
  },
  {
    id: '7',
    title: 'Professional Plumbing Services',
    description: 'Licensed plumber with 15 years experience. Available for all plumbing needs - repairs, installations, and emergency services. Island-wide coverage.',
    price: 500,
    currency: 'SCR',
    category: 'services',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    ],
    location: 'All Mahe',
    whatsapp: '+248 2 789 012',
    isPremium: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 78,
  },
  {
    id: '8',
    title: 'Designer Summer Collection - Brand New',
    description: 'Exclusive summer wear collection. Beach dresses, resort wear, and accessories. All sizes available. Perfect for tropical lifestyle.',
    price: 2500,
    currency: 'SCR',
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    location: 'Victoria, Mahe',
    whatsapp: '+248 2 890 123',
    isPremium: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    views: 156,
  },
];

// Passwords stored separately (in real app, use proper hashing)
const userPasswords: Record<string, string> = {};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      listings: sampleListings,
      users: [],
      currentUser: null,

      addListing: (listing) => {
        const id = uuidv4();
        const newListing: Listing = {
          ...listing,
          id,
          createdAt: new Date().toISOString(),
          views: 0,
        };
        set((state) => ({
          listings: [newListing, ...state.listings],
        }));
        return id;
      },

      updateListing: (id, updates) => {
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing.id === id ? { ...listing, ...updates } : listing
          ),
        }));
      },

      deleteListing: (id) => {
        set((state) => ({
          listings: state.listings.filter((listing) => listing.id !== id),
        }));
      },

      incrementViews: (id) => {
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing.id === id ? { ...listing, views: listing.views + 1 } : listing
          ),
        }));
      },

      register: (name, email, phone, password) => {
        const existingUser = get().users.find((u) => u.email === email);
        if (existingUser) return false;

        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          phone,
          createdAt: new Date().toISOString(),
        };
        
        userPasswords[email] = password;
        
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        return true;
      },

      login: (email, password) => {
        const user = get().users.find((u) => u.email === email);
        if (!user || userPasswords[email] !== password) return false;
        
        set({ currentUser: user });
        return true;
      },

      logout: () => {
        set({ currentUser: null });
      },

      updateUser: (updates) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) =>
            u.id === currentUser.id ? updatedUser : u
          ),
        }));
      },
    }),
    {
      name: 'buysellseychelles-storage',
      partialize: (state) => ({
        listings: state.listings,
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
);
