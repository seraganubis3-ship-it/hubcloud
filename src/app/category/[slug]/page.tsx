import React from 'react';
import type { Metadata } from 'next';
import { getCategoryFiltersData } from '@/lib/category-filters';
import { SITE_CONFIG } from '@/lib/seo';
import CategoryClientView from './CategoryClientView';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCategoryFiltersData(params.slug);
  const cat = data?.category;

  if (!cat) {
    return {
      title: `Category | ${SITE_CONFIG.name}`,
      alternates: {
        canonical: `${SITE_CONFIG.url}/category/${params.slug}`,
      },
    };
  }

  const title = `${cat.nameAr || cat.name} - ${cat.name} | ${SITE_CONFIG.name}`;
  const description =
    cat.descriptionAr ||
    cat.description ||
    `Browse ${cat.name} with official warranty and fast shipping across Egypt at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_CONFIG.url}/category/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/category/${cat.slug}`,
      images: cat.banner || cat.image ? [{ url: cat.banner || cat.image || SITE_CONFIG.ogImage }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const initialData = await getCategoryFiltersData(params.slug);
  return <CategoryClientView slug={params.slug} initialData={initialData} />;
}

