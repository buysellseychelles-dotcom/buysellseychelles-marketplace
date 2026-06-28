import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import BrandLogo from '@/components/brand-logo';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrandLogo className="w-10 h-10 rounded-lg" />
              <span className="font-bold text-lg text-foreground">
                BuySellSeychelles
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier marketplace for buying and selling in the Seychelles. Connect with local buyers and sellers today.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/?category=${category.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">More Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(4).map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/?category=${category.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/create"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sell Something
                </Link>
              </li>
              <li>
                <Link 
                  href="/my-listings"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  My Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Advertise With Us
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} BuySellSeychelles. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-primary cursor-pointer transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
