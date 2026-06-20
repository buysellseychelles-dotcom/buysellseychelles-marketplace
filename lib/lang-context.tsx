'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from './i18n'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('bss_lang') as Lang | null
    if (stored === 'kr' || stored === 'en') {
      setLangState(stored)
      document.cookie = `bss_lang=${stored};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('bss_lang', l)
    document.cookie = `bss_lang=${l};path=/;max-age=31536000;SameSite=Lax`
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
