export default function ReviewStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  return (
    <span className={`${sizes[size]} tracking-tight`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}
