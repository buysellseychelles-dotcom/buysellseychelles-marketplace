// Skeleton de la page d'accueil. Next.js l'affiche INSTANTANÉMENT au clic sur
// « Home » pendant que le rendu serveur (données Supabase) se prépare, ce qui
// supprime l'impression de page figée / temps de réaction trop long.
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-4 md:pb-0 animate-pulse">
      {/* Barre de recherche mobile */}
      <div className="bg-white border-b border-gray-100 px-3 py-3 lg:hidden">
        <div className="max-w-6xl mx-auto h-14 rounded-2xl bg-gray-100" />
      </div>

      {/* Catégories */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex w-full items-start gap-2 px-2 py-3 lg:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-gray-100" />
              <div className="h-3 w-10 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-2 px-6 py-3 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Bannière */}
      <div className="pt-3 lg:max-w-7xl lg:mx-auto lg:px-8 px-3">
        <div className="h-36 lg:h-48 rounded-2xl bg-gray-100" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="mb-5 mt-5 lg:max-w-7xl lg:mx-auto lg:px-8">
          <div className="flex items-center justify-between px-4 lg:px-0 mb-3">
            <div className="h-5 w-40 rounded bg-gray-100" />
            <div className="h-4 w-14 rounded bg-gray-100" />
          </div>
          <div className="flex gap-3 px-4 lg:px-0 overflow-hidden lg:grid lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, c) => (
              <div key={c} className="shrink-0 w-40 lg:w-auto bg-white rounded-xl overflow-hidden border border-gray-100">
                <div className="w-40 lg:w-full aspect-[4/3] bg-gray-100" />
                <div className="p-2 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
