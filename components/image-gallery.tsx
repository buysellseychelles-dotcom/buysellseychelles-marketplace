'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <div 
          className="relative aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden bg-secondary cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-foreground/80 text-background text-sm font-medium rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Click to Expand Hint */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-foreground/80 text-background text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Click to expand
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all ${
                  currentIndex === index
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 p-2 bg-card rounded-full shadow-lg hover:bg-secondary transition-colors z-10"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6 text-foreground" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-card rounded-full text-foreground font-medium z-10">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-card rounded-full shadow-lg hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-8 w-8 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-card rounded-full shadow-lg hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-8 w-8 text-foreground" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full px-4 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all ${
                  currentIndex === index
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-foreground'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
