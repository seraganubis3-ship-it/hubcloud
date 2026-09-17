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
    const updates = await request.json();

    // Prevent passing invalid fields directly into Prisma
    delete updates.id;
    delete updates.subCategory;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updated = await prisma.product.update({
      where: { id },
      data: updates,
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

