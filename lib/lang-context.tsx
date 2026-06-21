'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Lang } from './i18n'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('bss_lang') as Lang | null
    if (stored === 'kr' || stored === 'en') {
      setLangState(stored)
      // Si le serveur a rendu dans une autre langue que celle stockée (cookie
      // pas encore lu au 1er rendu), on resynchronise le contenu SSR.
      const cookieLang = document.cookie.match(/(?:^|;\s*)bss_lang=(en|kr)/)?.[1]
      document.cookie = `bss_lang=${stored};path=/;max-age=31536000;SameSite=Lax`
      if (cookieLang !== stored) router.refresh()
    }
  }, [router])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('bss_lang', l)
    document.cookie = `bss_lang=${l};path=/;max-age=31536000;SameSite=Lax`
    // Re-render des composants serveur (détails d'annonce, specs, labels…) pour
    // que le texte rendu côté serveur change aussi de langue. Sans ça, seuls
    // les composants client se mettent à jour et certains mots restent figés
    // dans la langue active au chargement de la page.
    router.refresh()
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
