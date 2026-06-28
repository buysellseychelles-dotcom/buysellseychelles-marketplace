'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMarketplaceStore } from '@/lib/store-old';
import { Search, Plus, User, Menu, X, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth-modal';
import BrandLogo from '@/components/brand-logo';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  const { currentUser, logout } = useMarketplaceStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(localSearch);
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <BrandLogo className="w-10 h-10 rounded-lg" />
              <span className="hidden sm:block font-bold text-lg text-foreground">
                BuySellSeychelles
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">

  <Link href="/trending">
    <Button variant="ghost">
      🔥 Trending
    </Button>
  </Link>

  <Link href="/create">
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
      <Plus className="h-4 w-4" />
      Sell
    </Button>
  </Link>
              
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link href="/my-listings">
                    <Button variant="ghost" size="icon" title="My Listings">
                      <Package className="h-5 w-5" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{currentUser.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={openLogin}>
                    Login
                  </Button>
                  <Button variant="outline" onClick={openRegister}>
                    Register
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-4 space-y-3">

  <Link
    href="/trending"
    onClick={() => setIsMobileMenuOpen(false)}
  >
    <Button variant="outline" className="w-full">
      🔥 Trending
    </Button>
  </Link>

  <Link href="/create" onClick={() => setIsMobileMenuOpen(false)}>
    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
      <Plus className="h-4 w-4" />
      Sell Something
    </Button>
  </Link>
              
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </div>
                  <Link href="/my-listings" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <Package className="h-4 w-4" />
                      My Listings
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={openLogin}>
                    Login
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={openRegister}>
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
