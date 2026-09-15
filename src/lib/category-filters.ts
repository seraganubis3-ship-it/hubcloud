import { prisma } from '@/lib/db';
import { categoryFiltersCache } from '@/lib/server-cache';

export interface AttributeFilterOption {
  attributeId: string;
  name: string;
  nameAr: string;
  slug: string;
  type: string;
  unit: string | null;
  groupName: string;
  groupNameAr: string;
  displayOrder: number;
  values: { value: string; count: number }[];
}

export interface CategoryFiltersData {
  success: boolean;
  category: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    image: string | null;
    banner: string | null;
    description: string | null;
    descriptionAr: string | null;
  } | null;
  totalProducts: number;
  priceRange: { min: number; max: number };
  brands: { id: string; name: string; count: number }[];
  attributeFilters: AttributeFilterOption[];
  error?: string;
}

export async function getCategoryFiltersData(idOrSlugRaw: string): Promise<CategoryFiltersData | null> {
  const idOrSlug = idOrSlugRaw.toLowerCase().trim();

  // 1. Check in-memory server cache
  const cached = categoryFiltersCache.get(idOrSlug);
  if (cached) {
    if (cached === '__404__') return null;
    return cached as CategoryFiltersData;
  }

  try {
    const [category, products] = await Promise.all([
      prisma.category.findFirst({
        where: {
          OR: [{ slug: idOrSlug }, { id: idOrSlug }],
          isActive: true,
        },
        include: {
          assignedAttributes: {
            where: { isFilterable: true },
            include: {
              attribute: {
                include: { group: true },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { categoryId: idOrSlug },
            { category: { slug: idOrSlug } },
            { category: { id: idOrSlug } },
          ],
          isArchived: false,
          status: 'active',
        },
        select: {
          id: true,
          brand: true,
          price: true,
          specs: true,
          inStock: true,
          attributeValues: {
            select: {
              attributeId: true,
              textValue: true,
              numberValue: true,
              booleanValue: true,
              jsonValue: true,
            },
          },
        },
      }),
    ]);

    if (!category) {
      categoryFiltersCache.set(idOrSlug, '__404__');
      return null;
    }

    // 1. Calculate Price Range
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    // 2. Aggregate Brand Counts
    const brandCounts: Record<string, { name: string; count: number }> = {};

    // 3. Aggregate Attribute Values strictly from assigned filterable attributes
    const attributeFiltersMap: Record<
      string,
      {
        attributeId: string;
        name: string;
        nameAr: string;
        slug: string;
        type: string;
        unit: string | null;
        groupName: string;
        groupNameAr: string;
        displayOrder: number;
        values: Record<string, number>;
      }
    > = {};

    for (const ca of category.assignedAttributes) {
      const attr = ca.attribute;
      attributeFiltersMap[attr.id] = {
        attributeId: attr.id,
        name: attr.name,
        nameAr: attr.nameAr,
        slug: attr.slug,
        type: attr.type,
        unit: attr.unit,
        groupName: attr.group.name,
        groupNameAr: attr.group.nameAr,
        displayOrder: ca.displayOrder,
        values: {},
      };
    }

    for (const p of products) {
      // Prices
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;

      // Brands
      if (p.brand) {
        const bKey = p.brand.toLowerCase();
        if (!brandCounts[bKey]) {
          brandCounts[bKey] = { name: p.brand, count: 0 };
        }
        brandCounts[bKey].count += 1;
      }

      // Specs fallback
      let specsObj: Record<string, string> = {};
      try {
        specsObj = JSON.parse(p.specs || '{}');
      } catch {}

      // Attribute Values from relation
      const mappedAttrIds = new Set<string>();
      for (const pav of p.attributeValues) {
        const filter = attributeFiltersMap[pav.attributeId];
        if (filter) {
          const val = pav.textValue || (pav.numberValue !== null ? String(pav.numberValue) : null);
          if (val) {
            filter.values[val] = (filter.values[val] || 0) + 1;
            mappedAttrIds.add(pav.attributeId);
          }
        }
      }

      // Fallback: check specs JSON for attributes that don't have explicit EAV row yet
      for (const [attrId, filter] of Object.entries(attributeFiltersMap)) {
        if (!mappedAttrIds.has(attrId)) {
          const val =
            specsObj[filter.name] ||
            specsObj[filter.nameAr] ||
            specsObj[filter.slug.toUpperCase()] ||
            specsObj[filter.slug];
          if (val) {
            filter.values[val] = (filter.values[val] || 0) + 1;
          }
        }
      }
    }

    const formattedAttributeFilters = Object.values(attributeFiltersMap)
      .map((f) => ({
        ...f,
        values: Object.entries(f.values)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count),
      }))
      .filter((f) => f.values.length > 0)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const formattedBrands = Object.entries(brandCounts)
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);

    const responseData: CategoryFiltersData = {
      success: true,
      category: {
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        image: category.image,
        banner: category.banner,
        description: category.description,
        descriptionAr: category.descriptionAr,
      },
      totalProducts: products.length,
      priceRange: {
        min: minPrice === Infinity ? 0 : Math.floor(minPrice),
        max: maxPrice === -Infinity ? 50000 : Math.ceil(maxPrice),
      },
      brands: formattedBrands,
      attributeFilters: formattedAttributeFilters,
    };

    categoryFiltersCache.set(idOrSlug, responseData);
    categoryFiltersCache.set(category.slug.toLowerCase(), responseData);

    return responseData;
  } catch (error: any) {
    console.error('Error fetching category filters data:', error);
    return null;
  }
}
