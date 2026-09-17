const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Verifying database state...');
  const cats = await prisma.category.count();
  const prods = await prisma.product.count();
  const vars = await prisma.productVariant.count();
  const orders = await prisma.order.count();
  const users = await prisma.user.count();
  console.log('Counts:', { categories: cats, products: prods, variants: vars, orders, users });
  const sampleProduct = await prisma.product.findFirst({
    include: { category: true, variants: true }
  });
  console.log('Sample product:', {
    id: sampleProduct.id,
    name: sampleProduct.name,
    categoryName: sampleProduct.category?.name,
    price: sampleProduct.price,
    variants: sampleProduct.variants.length
  });
}

main().catch(console.error).finally(() => prisma['$disconnect']());
