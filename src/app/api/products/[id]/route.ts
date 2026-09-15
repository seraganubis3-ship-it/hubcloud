import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

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
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const cat = product.category as any;
    let parsedImages = [];
    let parsedSpecs = {};
    let parsedSpecsAr = undefined;
    let parsedFeatures = undefined;
    let parsedFeaturesAr = undefined;
    let parsedRamOptions = undefined;
    let parsedStorageOptions = undefined;
    let parsedWarrantyOptions = undefined;

    try {
      parsedImages = JSON.parse(product.images || '[]');
      parsedSpecs = JSON.parse(product.specs || '{}');
      if (product.specsAr) parsedSpecsAr = JSON.parse(product.specsAr);
      if (product.features) parsedFeatures = JSON.parse(product.features);
      if (product.featuresAr) parsedFeaturesAr = JSON.parse(product.featuresAr);
      if (product.ramOptions) parsedRamOptions = JSON.parse(product.ramOptions);
      if (product.storageOptions) parsedStorageOptions = JSON.parse(product.storageOptions);
      if (product.warrantyOptions) parsedWarrantyOptions = JSON.parse(product.warrantyOptions);
    } catch {}

    const formattedVariants = product.variants.map((v) => {
      let opt = {};
      try {
        opt = JSON.parse(v.options || '{}');
      } catch {}
      return { ...v, options: opt };
    });

    const parsedProduct = {
      ...product,
      category: cat?.name || product.categoryId,
      categorySlug: cat?.slug || product.categoryId,
      categoryNameAr: cat?.nameAr,
      images: parsedImages,
      specs: parsedSpecs,
      specsAr: parsedSpecsAr,
      features: parsedFeatures,
      featuresAr: parsedFeaturesAr,
      ramOptions: parsedRamOptions,
      storageOptions: parsedStorageOptions,
      warrantyOptions: parsedWarrantyOptions,
      variants: formattedVariants,
      monthlyInstallment: product.monthlyValu
        ? {
            valuPrice: product.monthlyValu,
            amanPrice: product.monthlyAman || product.monthlyValu,
            months: 24,
          }
        : undefined,
    };

    return NextResponse.json({ success: true, product: parsedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    const updated = await prisma.product.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
