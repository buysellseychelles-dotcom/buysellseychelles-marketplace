/**
 * BuySellSeychelles brand mark.
 * Source of truth: /brand/logo.svg (also served at /brand/logo.svg).
 * Pass sizing/rounding through `className` (e.g. "w-9 h-9 rounded-xl").
 */
export default function BrandLogo({
  className = '',
  alt = 'BuySellSeychelles',
}: {
  className?: string
  alt?: string
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/logo.svg" alt={alt} className={className} />
}
