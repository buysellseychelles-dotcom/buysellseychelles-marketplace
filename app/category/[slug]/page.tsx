import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { SUBCATEGORIES, CATEGORY_META } from '@/lib/subcategories'
import CategoryPageContent from '@/components/category-page-content'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = CATEGORY_META[slug]
  if (!meta) return {}

  const title = `${meta.label_en} in the Seychelles | ${SITE_NAME}`
  const description = `Browse ${meta.label_en.toLowerCase()} for sale in the Seychelles — Mahé, Praslin and La Digue. Buy and sell easily on ${SITE_NAME}.`
  const url = `${SITE_URL}/category/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: 'en_SC', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = CATEGORY_META[slug]
  const subs = SUBCATEGORIES[slug]

  if (!meta || !subs) notFound()

  // Données structurées : fil d'Ariane (rich result Google).
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: meta.label_en, item: `${SITE_URL}/category/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CategoryPageContent meta={meta} subs={subs} slug={slug} />
    </>
  )
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map(slug => ({ slug }))
}
