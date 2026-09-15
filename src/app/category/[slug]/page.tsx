import React from 'react';
import { getCategoryFiltersData } from '@/lib/category-filters';
import CategoryClientView from './CategoryClientView';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const initialData = await getCategoryFiltersData(params.slug);
  return <CategoryClientView slug={params.slug} initialData={initialData} />;
}
