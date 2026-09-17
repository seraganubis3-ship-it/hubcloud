import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    let rows = body.rows;
    const validateOnly = Boolean(body.validateOnly);

    if (!Array.isArray(rows) && typeof body.csvContent === 'string') {
      const lines = body.csvContent.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, ''));
        rows = lines.slice(1).map((line: string) => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^["']|["']$/g, ''));
          const rowObj: Record<string, any> = {};
          headers.forEach((h: string, idx: number) => {
            rowObj[h] = values[idx];
          });
          return rowObj;
        });
      }
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rows array or csvContent is required for importing.' },
        { status: 400 }
      );
    }

    // Get all valid category slugs
    const categories = await prisma.category.findMany({
      select: { slug: true, id: true },
    });
    const validCategorySlugs = new Set(categories.map((c) => c.slug.toLowerCase()));

    // Get all existing SKUs to prevent duplicates
    const existingProducts = await prisma.product.findMany({
      select: { sku: true },
    });
    const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));

    const seenBatchSkus = new Set<string>();
    const errors: { row: number; field: string; message: string }[] = [];
    const validRows: any[] = [];

    rows.forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      const sku = (row.sku || row.SKU || '').trim().toUpperCase();
      const name = (row.name || row.Name || '').trim();
      const nameAr = (row.nameAr || row.NameAr || name).trim();
      const categorySlug = (row.categorySlug || row.CategorySlug || row.category || row.Category || '').trim().toLowerCase();
      const price = Number(row.price || row.Price);
      const stockCount = Number(row.stockCount || row.StockCount || 0);

      if (!sku) {
        errors.push({ row: rowNum, field: 'SKU', message: 'Missing product SKU' });
      } else if (existingSkus.has(sku)) {
        errors.push({ row: rowNum, field: 'SKU', message: `SKU '${sku}' already exists in database` });
      } else if (seenBatchSkus.has(sku)) {
        errors.push({ row: rowNum, field: 'SKU', message: `Duplicate SKU '${sku}' found within import file` });
      } else {
        seenBatchSkus.add(sku);
      }

      if (!name) {
        errors.push({ row: rowNum, field: 'Name', message: 'Product name is required' });
      }

      if (!categorySlug) {
        errors.push({ row: rowNum, field: 'Category', message: 'Category slug is required' });
      } else if (!validCategorySlugs.has(categorySlug)) {
        errors.push({ row: rowNum, field: 'Category', message: `Unknown category '${categorySlug}'` });
      }

      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, field: 'Price', message: 'Valid positive price is required' });
      }

      validRows.push({
        id: 'prod-' + Date.now() + '-' + idx,
        sku,
        name,
        nameAr,
        brand: (row.brand || row.Brand || 'General').trim(),
        categoryId: categorySlug,
        price,
        oldPrice: row.oldPrice ? Number(row.oldPrice) : null,
        costPrice: row.costPrice ? Number(row.costPrice) : null,
        stockCount: isNaN(stockCount) ? 0 : Math.max(0, stockCount),
        barcode: (row.barcode || row.Barcode || '').trim() || null,
        thumbnail: (row.thumbnail || row.Thumbnail || '/images/products/placeholder.jpg').trim(),
        status: (row.status || row.Status || 'active').trim().toLowerCase(),
      });
    });

    // If validation requested, or if there are errors, return report
    if (validateOnly || errors.length > 0) {
      return NextResponse.json({
        success: errors.length === 0,
        totalRows: rows.length,
        validCount: rows.length - errors.length,
        errorCount: errors.length,
        errors,
        preview: validRows.slice(0, 10),
      });
    }

    // Execute Import
    let importedCount = 0;
    for (const item of validRows) {
      await prisma.product.create({
        data: {
          id: item.id,
          sku: item.sku,
          name: item.name,
          nameAr: item.nameAr,
          brand: item.brand,
          categoryId: item.categoryId,
          price: item.price,
          oldPrice: item.oldPrice,
          costPrice: item.costPrice,
          inStock: item.stockCount > 0,
          stockCount: item.stockCount,
          barcode: item.barcode,
          thumbnail: item.thumbnail,
          status: item.status,
          description: 'Imported IT product record.',
          descriptionAr: 'منتج تقني مستورد.',
          specs: '{}',
          shipsWithin: 'Ships within 24 hours',
          shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
        },
      });

      if (item.stockCount > 0) {
        await prisma.inventoryTransaction.create({
          data: {
            productId: item.id,
            quantityDelta: item.stockCount,
            previousStock: 0,
            newStock: item.stockCount,
            reason: 'restock',
            createdById: auth.user.id,
            createdByName: auth.user.name,
          },
        });
      }

      importedCount++;
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'PRODUCT_IMPORT',
        entityType: 'Product',
        entityId: 'bulk-csv',
        details: { importedCount, totalRows: rows.length },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} products.`,
      importedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
