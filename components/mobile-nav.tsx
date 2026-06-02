'use client'

import Link from 'next/link'
import { Home, Plus, User } from 'lucide-react'

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 md:hidden">

      <Link href="/" className="flex flex-col items-center text-xs">
        <Home className="w-5 h-5" />
        Accueil
      </Link>

      <Link href="/create" className="flex flex-col items-center text-xs">
        <Plus className="w-6 h-6 text-green-600" />
        Publier
      </Link>

      <Link href="/my-listings" className="flex flex-col items-center text-xs">
        <User className="w-5 h-5" />
        Moi
      </Link>

    </div>
  )
}