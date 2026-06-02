'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatWhatsAppLink } from '@/lib/format';

interface WhatsAppButtonProps {
  phone: string;
  listingTitle?: string;
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
}

export function WhatsAppButton({ phone, listingTitle, size = 'default', fullWidth = false }: WhatsAppButtonProps) {
  const message = listingTitle 
    ? `Hi! I'm interested in your listing: "${listingTitle}" on BuySellSeychelles.`
    : 'Hi! I found you on BuySellSeychelles.';
  
  const whatsappUrl = formatWhatsAppLink(phone, message);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={fullWidth ? 'w-full block' : 'inline-block'}
    >
      <Button 
        className={`bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`}
      >
        <MessageCircle className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        WhatsApp
      </Button>
    </a>
  );
}
