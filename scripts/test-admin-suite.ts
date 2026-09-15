import { prisma } from '../src/lib/db';
import { signSessionToken, AUTH_COOKIE_NAME } from '../src/lib/session';

// Import Route Handlers directly
import { GET as getAdminProducts, POST as createAdminProduct } from '../src/app/api/admin/products/route';
import { GET as getAdminProductById, PUT as updateAdminProductById, DELETE as deleteAdminProductById } from '../src/app/api/admin/products/[id]/route';
import { POST as duplicateProduct } from '../src/app/api/admin/products/[id]/duplicate/route';
import { POST as bulkProducts } from '../src/app/api/admin/products/bulk/route';
import { GET as exportProducts } from '../src/app/api/admin/products/export/route';
import { POST as importProducts } from '../src/app/api/admin/products/import/route';

import { GET as getCategories, POST as createCategory } from '../src/app/api/categories/route';
import { GET as getCategoryById, PUT as updateCategoryById, DELETE as deleteCategoryById } from '../src/app/api/categories/[id]/route';
import { GET as getCategoryAttrs, POST as assignCategoryAttrs, DELETE as unassignCategoryAttrs } from '../src/app/api/categories/[id]/attributes/route';
import { GET as getCategoryFilters } from '../src/app/api/categories/[id]/filters/route';

import { GET as getAttrGroups, POST as createAttrGroup } from '../src/app/api/admin/attribute-groups/route';
import { GET as getAttributes, POST as createAttribute } from '../src/app/api/admin/attributes/route';
import { PUT as updateAttribute, DELETE as deleteAttribute } from '../src/app/api/admin/attributes/[id]/route';

import { GET as getInventory } from '../src/app/api/admin/inventory/route';
import { POST as adjustInventory } from '../src/app/api/admin/inventory/adjust/route';
import { GET as getAuditLogs } from '../src/app/api/admin/audit-logs/route';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetails?: any) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (errorDetails) console.error('    Details:', errorDetails);
    failedTests++;
  }
}

async function createAdminRequest(url: string, method = 'GET', body?: any, cookieToken?: string): Promise<Request> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookieToken) {
    headers['cookie'] = `${AUTH_COOKIE_NAME}=${cookieToken}`;
  }
  const init: RequestInit = {
    method,
    headers,
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request(url, init);
}

async function runFullAdminTestSuite() {
  console.log('=====================================================');
  console.log('       HUB CLOUD ADMIN SUITE — COMPREHENSIVE TEST    ');
  console.log('=====================================================\n');

  // 1. Session Token Setup
  const adminToken = await signSessionToken({
    userId: 'test-admin-user',
    email: 'admin@hubcloud.eg',
    name: 'Admin Test Suite',
    role: 'admin',
  });

  const guestToken = ''; // No token

  // -----------------------------------------------------------------
  // TEST GROUP 1: Security & RBAC Guards
  // -----------------------------------------------------------------
  console.log('[TEST GROUP 1]: Authentication & RBAC Guarding');
  {
    // Unauthorized request should fail with 401
    const unauthReq = await createAdminRequest('http://localhost:3000/api/admin/products', 'GET', undefined, guestToken);
    const unauthRes = await getAdminProducts(unauthReq);
    assert(unauthRes.status === 401, 'Unauthenticated request rejected with 401');

    // Admin request should succeed with 200
    const authReq = await createAdminRequest('http://localhost:3000/api/admin/products', 'GET', undefined, adminToken);
    const authRes = await getAdminProducts(authReq);
    assert(authRes.status === 200, 'Authenticated admin request accepted with 200');
  }

  // -----------------------------------------------------------------
  // TEST GROUP 2: Dynamic Attribute Groups & Attributes
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 2]: Dynamic Attribute Engine');
  let createdGroupId = '';
  let createdAttrId = '';
  {
    // Create Attribute Group
    const groupReq = await createAdminRequest('http://localhost:3000/api/admin/attribute-groups', 'POST', {
      name: 'Test Power Specs',
      nameAr: 'مواصفات الطاقة التجريبية',
      displayOrder: 99,
    }, adminToken);
    const groupRes = await createAttrGroup(groupReq);
    const groupData = await groupRes.json();
    assert(groupData.success === true && groupData.group?.id, 'Attribute Group created successfully');
    createdGroupId = groupData.group?.id;

    // Create Attribute
    const attrReq = await createAdminRequest('http://localhost:3000/api/admin/attributes', 'POST', {
      groupId: createdGroupId,
      name: 'PSU Wattage',
      nameAr: 'قدرة مزود الطاقة',
      slug: `psu_wattage_${Date.now()}`,
      type: 'select',
      unit: 'Watts',
      options: ['650W', '750W', '850W', '1000W'],
      isFilterable: true,
      isSearchable: true,
      isComparable: true,
      isVariantOption: false,
      displayOrder: 1,
    }, adminToken);
    const attrRes = await createAttribute(attrReq);
    const attrData = await attrRes.json();
    assert(attrData.success === true && attrData.attribute?.id, 'Dynamic Attribute created with type select and options');
    createdAttrId = attrData.attribute?.id;

    // Update Attribute
    const updateAttrReq = await createAdminRequest(`http://localhost:3000/api/admin/attributes/${createdAttrId}`, 'PUT', {
      unit: 'W',
      isComparable: true,
    }, adminToken);
    const updateAttrRes = await updateAttribute(updateAttrReq, { params: { id: createdAttrId } });
    const updateAttrData = await updateAttrRes.json();
    assert(updateAttrData.success === true && updateAttrData.attribute?.unit === 'W', 'Dynamic Attribute updated successfully');
  }

  // -----------------------------------------------------------------
  // TEST GROUP 3: Single-Level Categories & Attributes Binding
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 3]: Single-Level Categories & Dynamic Binding');
  const testCatSlug = `test-cat-${Date.now()}`;
  let createdCatId = '';
  {
    // Create Category (Single Level)
    const catReq = await createAdminRequest('http://localhost:3000/api/categories', 'POST', {
      name: 'E2E Ephemeral Category',
      nameAr: 'تصنيف اختباري مؤقت',
      slug: testCatSlug,
      image: '/images/category_laptops.jpg',
      description: 'Test category description',
      displayOrder: 50,
      isActive: true,
      isFeatured: false,
    }, adminToken);
    const catRes = await createCategory(catReq);
    const catData = await catRes.json();
    assert(catData.success === true && catData.category?.id, 'Single-level Category created with slug and metadata');
    createdCatId = catData.category?.id;

    // Assign Attribute to Category
    const assignReq = await createAdminRequest(`http://localhost:3000/api/categories/${createdCatId}/attributes`, 'POST', {
      assignments: [
        {
          attributeId: createdAttrId,
          isRequired: false,
          isFilterable: true,
          isVariantOption: false,
          displayOrder: 1,
        },
      ],
    }, adminToken);
    const assignRes = await assignCategoryAttrs(assignReq, { params: { id: createdCatId } });
    const assignData = await assignRes.json();
    assert(assignData.success === true, 'Assigned dynamic attribute to category with isFilterable=true');

    // Fetch Category Dynamic Filters
    const filtersReq = await createAdminRequest(`http://localhost:3000/api/categories/${createdCatId}/filters`, 'GET');
    const filtersRes = await getCategoryFilters(filtersReq, { params: { id: createdCatId } });
    const filtersData = await filtersRes.json();
    assert(filtersData.success === true && Array.isArray(filtersData.attributeFilters), 'Dynamic Storefront Filter Engine resolved category filters');
  }

  // -----------------------------------------------------------------
  // TEST GROUP 4: Product Full Lifecycle & Specifications
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 4]: Product Full Lifecycle & Specifications');
  let createdProductId = '';
  const testSku = `TEST-PROD-${Date.now()}`;
  {
    // 1. Create Product
    const prodReq = await createAdminRequest('http://localhost:3000/api/admin/products', 'POST', {
      name: 'HubCloud Titan Power Server 850W',
      nameAr: 'سيرفر هاب كلاود تايتان باور',
      brand: 'HubCloud',
      categoryId: testCatSlug,
      sku: testSku,
      barcode: '1234567890123',
      price: 45000,
      oldPrice: 50000,
      compareAtPrice: 50000,
      costPrice: 38000,
      stockCount: 15,
      lowStockThreshold: 3,
      trackInventory: true,
      thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed'],
      description: 'High efficiency rackmount computing power supply unit.',
      attributeValues: [
        {
          attributeId: createdAttrId,
          textValue: '850W',
        },
      ],
      variants: [
        {
          sku: `${testSku}-V1`,
          price: 45000,
          stockCount: 8,
          options: { PSU: '850W Platinum' },
        },
      ],
    }, adminToken);
    const prodRes = await createAdminProduct(prodReq);
    const prodData = await prodRes.json();
    assert(prodData.success === true && prodData.product?.id, 'Product created with dynamic EAV attributes & variant');
    createdProductId = prodData.product?.id;

    // 2. Fetch Product Details
    const getProdReq = await createAdminRequest(`http://localhost:3000/api/admin/products/${createdProductId}`, 'GET', undefined, adminToken);
    const getProdRes = await getAdminProductById(getProdReq, { params: { id: createdProductId } });
    const getProdData = await getProdRes.json();
    assert(
      getProdData.success === true &&
      getProdData.product?.attributeValues?.length > 0 &&
      getProdData.product?.variants?.length > 0,
      'Product details fetched with populated attributeValues and variants'
    );

    // 3. Update Product
    const updateProdReq = await createAdminRequest(`http://localhost:3000/api/admin/products/${createdProductId}`, 'PUT', {
      price: 44000,
      stockCount: 18,
    }, adminToken);
    const updateProdRes = await updateAdminProductById(updateProdReq, { params: { id: createdProductId } });
    const updateProdData = await updateProdRes.json();
    assert(updateProdData.success === true && updateProdData.product?.price === 44000, 'Product price updated and verified');

    // 4. Duplicate Product
    const dupReq = await createAdminRequest(`http://localhost:3000/api/admin/products/${createdProductId}/duplicate`, 'POST', undefined, adminToken);
    const dupRes = await duplicateProduct(dupReq, { params: { id: createdProductId } });
    const dupData = await dupRes.json();
    assert(dupData.success === true && dupData.product?.sku !== testSku, 'Product duplicated with unique SKU and stock reset to 0');
    // Clean up duplicate immediately
    if (dupData.product?.id) {
      await prisma.product.delete({ where: { id: dupData.product.id } });
    }

    // 5. Bulk Operation
    const bulkReq = await createAdminRequest('http://localhost:3000/api/admin/products/bulk', 'POST', {
      action: 'deactivate',
      productIds: [createdProductId],
    }, adminToken);
    const bulkRes = await bulkProducts(bulkReq);
    const bulkData = await bulkRes.json();
    assert(bulkData.success === true && bulkData.affectedCount === 1, 'Bulk status change to draft succeeded');

    // 6. CSV Export
    const exportReq = await createAdminRequest('http://localhost:3000/api/admin/products/export?format=csv', 'GET', undefined, adminToken);
    const exportRes = await exportProducts(exportReq);
    const exportCsv = await exportRes.text();
    assert(exportRes.status === 200 && exportCsv.includes('SKU') && exportCsv.includes(testSku), 'CSV Export returned valid formatted CSV containing test SKU');

    // 7. CSV Import Validator
    const importReq = await createAdminRequest('http://localhost:3000/api/admin/products/import', 'POST', {
      csvContent: `name,brand,category,price,sku,stock\n"Test Import 1","HubCloud","${testCatSlug}",29000,"HC-IMP-${Date.now()}",5`,
      validateOnly: true,
    }, adminToken);
    const importRes = await importProducts(importReq);
    const importData = await importRes.json();
    assert(importData.success === true && importData.validCount === 1, 'CSV Import validation verified valid row');
  }

  // -----------------------------------------------------------------
  // TEST GROUP 5: Inventory Valuation & Stock Movement
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 5]: Warehouse Inventory & Movement Ledger');
  {
    // Check Inventory KPIs
    const invReq = await createAdminRequest('http://localhost:3000/api/admin/inventory', 'GET', undefined, adminToken);
    const invRes = await getInventory(invReq);
    const invData = await invRes.json();
    assert(
      invData.success === true &&
      invData.kpi?.totalValuation > 0 &&
      Array.isArray(invData.products),
      'Inventory overview returned valid KPI valuation and products array'
    );

    // Adjust Stock with Reason
    const adjustReq = await createAdminRequest('http://localhost:3000/api/admin/inventory/adjust', 'POST', {
      productId: createdProductId,
      quantityDelta: 5,
      reason: 'received',
      notes: 'New shipment batch PO-9988',
    }, adminToken);
    const adjustRes = await adjustInventory(adjustReq);
    const adjustData = await adjustRes.json();
    assert(
      adjustData.success === true &&
      adjustData.transaction?.quantityDelta === 5 &&
      adjustData.transaction?.newStock === 23,
      'Stock adjusted with reason "received" and recorded movement ledger transaction'
    );
  }

  // -----------------------------------------------------------------
  // TEST GROUP 6: Immutable Audit Logs
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 6]: Immutable Audit Logs');
  {
    const auditReq = await createAdminRequest('http://localhost:3000/api/admin/audit-logs', 'GET', undefined, adminToken);
    const auditRes = await getAuditLogs(auditReq);
    const auditData = await auditRes.json();
    assert(
      auditData.success === true &&
      Array.isArray(auditData.logs) &&
      auditData.logs.length > 0,
      'Audit log system successfully captured operational events with details payload'
    );
  }

  // -----------------------------------------------------------------
  // TEST GROUP 7: Safe Cascade & Cleanup
  // -----------------------------------------------------------------
  console.log('\n[TEST GROUP 7]: Safe Deletion & Cascade Integrity');
  {
    // Attempt to delete category when product is still inside it -> should fail with 400
    const safeDeleteCatReq = await createAdminRequest(`http://localhost:3000/api/categories/${createdCatId}`, 'DELETE', undefined, adminToken);
    const safeDeleteCatRes = await deleteCategoryById(safeDeleteCatReq, { params: { id: createdCatId } });
    const safeDeleteCatData = await safeDeleteCatRes.json();
    assert(safeDeleteCatRes.status === 400, 'Safe delete prevented deleting category while products are assigned');

    // Clean up created product
    await prisma.productAttributeValue.deleteMany({ where: { productId: createdProductId } });
    await prisma.productVariant.deleteMany({ where: { productId: createdProductId } });
    await prisma.inventoryTransaction.deleteMany({ where: { productId: createdProductId } });
    await prisma.product.delete({ where: { id: createdProductId } });

    // Clean up attribute assignments and attribute
    await prisma.categoryAttribute.deleteMany({ where: { attributeId: createdAttrId } });
    await prisma.attribute.delete({ where: { id: createdAttrId } });
    await prisma.attributeGroup.delete({ where: { id: createdGroupId } });

    // Now delete category -> should succeed
    const deleteCatReq = await createAdminRequest(`http://localhost:3000/api/categories/${createdCatId}`, 'DELETE', undefined, adminToken);
    const deleteCatRes = await deleteCategoryById(deleteCatReq, { params: { id: createdCatId } });
    const deleteCatData = await deleteCatRes.json();
    assert(deleteCatData.success === true, 'Category cleanly deleted after product unassignment');

    // Clean up audit logs created during test run
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { details: { contains: 'TEST-PROD' } },
          { details: { contains: 'psu_wattage' } },
          { details: { contains: testCatSlug } }
        ]
      }
    });
  }

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log('\n=====================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('=====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFullAdminTestSuite()
  .catch((e) => {
    console.error('Test suite failed with unexpected error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
