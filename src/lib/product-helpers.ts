export function parseJsonField<T>(field: any, fallback: T): T {
  if (field === null || field === undefined) return fallback;
  if (typeof field === 'object') return field as T;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function parseDecimal(val: any, fallback: number | null = null): number | null {
  if (val === null || val === undefined) return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

export function serializeProduct(p: any) {
  if (!p) return null;
  const cat = p.category as any;
  const images = parseJsonField<string[]>(p.images, []);
  const specs = parseJsonField<Record<string, any>>(p.specs, {});
  const specsAr = parseJsonField<Record<string, any> | null>(p.specsAr, null);
  const features = parseJsonField<string[] | null>(p.features, null);
  const featuresAr = parseJsonField<string[] | null>(p.featuresAr, null);

  const formattedVariants = (p.variants || []).map((v: any) => ({
    ...v,
    price: parseDecimal(v.price, 0)!,
    oldPrice: parseDecimal(v.oldPrice),
    costPrice: parseDecimal(v.costPrice),
    options: parseJsonField<Record<string, any>>(v.options, {}),
  }));

  const price = parseDecimal(p.price, 0)!;
  const oldPrice = parseDecimal(p.oldPrice);
  const costPrice = parseDecimal(p.costPrice);
  const compareAtPrice = parseDecimal(p.compareAtPrice);
  const monthlyVal = parseDecimal(p.monthlyValue);
  const monthlyAmanVal = parseDecimal(p.monthlyAman) ?? monthlyVal;

  return {
    ...p,
    price,
    oldPrice,
    costPrice,
    compareAtPrice,
    category: cat?.name || p.categoryId,
    categorySlug: cat?.slug || p.categoryId,
    categoryNameAr: cat?.nameAr,
    images,
    specs,
    specsAr,
    features,
    featuresAr,
    variants: formattedVariants,
    monthlyInstallment: monthlyVal
      ? {
          valuPrice: monthlyVal,
          amanPrice: monthlyAmanVal ?? monthlyVal,
          months: 24,
        }
      : undefined,
  };
}

