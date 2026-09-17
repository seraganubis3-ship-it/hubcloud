import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { serializeProduct } from '@/lib/product-helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          where: { status: 'active' },
        },
        attributeValues: {
          include: {
            attribute: {
              include: { group: true },
            },
          },
        },
      },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess({ product: serializeProduct(product) });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();

    // Whitelist allowed fields to prevent mass assignment vulnerabilities
    const safeData: any = {};
    if (body.name !== undefined) safeData.name = String(body.name).trim();
    if (body.nameAr !== undefined) safeData.nameAr = String(body.nameAr).trim();
    if (body.brand !== undefined) safeData.brand = String(body.brand).trim();
    if (body.price !== undefined) safeData.price = Number(body.price);
    if (body.oldPrice !== undefined) safeData.oldPrice = body.oldPrice ? Number(body.oldPrice) : null;
    if (body.inStock !== undefined) safeData.inStock = Boolean(body.inStock);
    if (body.stockCount !== undefined) safeData.stockCount = Number(body.stockCount);
    if (body.isBestSeller !== undefined) safeData.isBestSeller = Boolean(body.isBestSeller);
    if (body.isDeal !== undefined) safeData.isDeal = Boolean(body.isDeal);
    if (body.isNew !== undefined) safeData.isNew = Boolean(body.isNew);
    if (body.description !== undefined) safeData.description = String(body.description);
    if (body.descriptionAr !== undefined) safeData.descriptionAr = String(body.descriptionAr);
    if (body.thumbnail !== undefined) safeData.thumbnail = String(body.thumbnail);
    if (body.images !== undefined && Array.isArray(body.images)) safeData.images = body.images;
    if (body.specs !== undefined) safeData.specs = body.specs;

    const updated = await prisma.product.update({
      where: { id },
      data: safeData,
      include: {
        category: true,
        variants: true,
      },
    });

    return apiSuccess({ product: serializeProduct(updated) });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    await prisma.product.delete({
      where: { id },
    });
    return apiSuccess({ message: `Product ${id} deleted successfully` });
  } catch (error: any) {
    return handleApiError(error);
  }
}

