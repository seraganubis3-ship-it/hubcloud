import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Attributes & Category Configuration Seeding ---');

  // 1. Create or ensure Attribute Groups
  const groupsData = [
    { id: 'grp-perf', name: 'Performance & Processing', nameAr: 'الأداء والمعالجة', displayOrder: 1 },
    { id: 'grp-mem', name: 'Memory & Storage', nameAr: 'الذاكرة والتخزين', displayOrder: 2 },
    { id: 'grp-disp', name: 'Display & Visuals', nameAr: 'الشاشة والعرض', displayOrder: 3 },
    { id: 'grp-conn', name: 'Networking & Connectivity', nameAr: 'الاتصال والشبكات', displayOrder: 4 },
    { id: 'grp-gen', name: 'General & Physical', nameAr: 'المواصفات العامة', displayOrder: 5 },
  ];

  const groups: Record<string, any> = {};
  for (const g of groupsData) {
    groups[g.id] = await prisma.attributeGroup.upsert({
      where: { id: g.id },
      update: { name: g.name, nameAr: g.nameAr, displayOrder: g.displayOrder },
      create: g,
    });
  }
  console.log(`Created/Verified ${Object.keys(groups).length} Attribute Groups.`);

  // 2. Create standard attributes
  const attributesData = [
    {
      slug: 'processor',
      name: 'Processor (CPU)',
      nameAr: 'المعالج',
      type: 'select',
      unit: null,
      groupId: 'grp-perf',
      options: JSON.stringify([
        'Intel Core i3',
        'Intel Core i5',
        'Intel Core i7',
        'Intel Core i9',
        'Intel Core Ultra 7',
        'Intel Core Ultra 9',
        'Intel Xeon Silver',
        'Intel Xeon Gold',
        'AMD Ryzen 5',
        'AMD Ryzen 7',
        'AMD Ryzen 9',
        'AMD EPYC Enterprise',
        'Apple M2 Pro',
        'Apple M3 Pro',
        'Apple M3 Max',
        'Apple M4',
      ]),
    },
    {
      slug: 'ram',
      name: 'RAM (Memory)',
      nameAr: 'الذاكرة العشوائية',
      type: 'select',
      unit: 'GB',
      groupId: 'grp-mem',
      options: JSON.stringify(['8 GB', '16 GB', '32 GB', '64 GB', '128 GB', '256 GB ECC']),
    },
    {
      slug: 'gpu',
      name: 'Graphics Card (GPU)',
      nameAr: 'كارت الشاشة',
      type: 'select',
      unit: null,
      groupId: 'grp-perf',
      options: JSON.stringify([
        'Integrated Intel UHD / Iris Xe',
        'NVIDIA GeForce RTX 3050',
        'NVIDIA GeForce RTX 4050',
        'NVIDIA GeForce RTX 4060',
        'NVIDIA GeForce RTX 4070',
        'NVIDIA GeForce RTX 4080',
        'NVIDIA GeForce RTX 4090',
        'NVIDIA RTX A2000 12GB',
        'NVIDIA RTX A4000 16GB',
        'NVIDIA RTX A6000 48GB',
        'Apple 16-Core GPU',
        'Apple 30-Core GPU',
        'Apple 40-Core GPU',
      ]),
    },
    {
      slug: 'storage_capacity',
      name: 'Storage Capacity',
      nameAr: 'سعة التخزين',
      type: 'select',
      unit: null,
      groupId: 'grp-mem',
      options: JSON.stringify([
        '256 GB NVMe SSD',
        '512 GB NVMe SSD',
        '1 TB NVMe SSD',
        '2 TB NVMe SSD',
        '4 TB NVMe SSD',
        '4x 4TB Enterprise RAID',
        '8x 8TB Enterprise RAID',
      ]),
    },
    {
      slug: 'storage_type',
      name: 'Storage Technology',
      nameAr: 'نوع وسائط التخزين',
      type: 'select',
      unit: null,
      groupId: 'grp-mem',
      options: JSON.stringify(['PCIe 4.0 NVMe M.2', 'PCIe 5.0 Ultra NVMe', 'Enterprise SAS 12G HDD', 'Enterprise SATA SSD']),
    },
    {
      slug: 'screen_size',
      name: 'Screen Size',
      nameAr: 'حجم الشاشة',
      type: 'select',
      unit: 'inch',
      groupId: 'grp-disp',
      options: JSON.stringify(['13.3"', '14.0"', '14.2"', '15.6"', '16.0"', '16.2"', '17.3"', '24"', '27"', '32"', '34" Curved']),
    },
    {
      slug: 'resolution',
      name: 'Display Resolution',
      nameAr: 'دقة العرض',
      type: 'select',
      unit: null,
      groupId: 'grp-disp',
      options: JSON.stringify([
        'FHD 1920 x 1080',
        '2K QHD 2560 x 1440',
        '3K Liquid Retina (3024 x 1964)',
        '4K UHD 3840 x 2160',
        'UWQHD 3440 x 1440',
      ]),
    },
    {
      slug: 'refresh_rate',
      name: 'Refresh Rate',
      nameAr: 'معدل التحديث',
      type: 'select',
      unit: 'Hz',
      groupId: 'grp-disp',
      options: JSON.stringify(['60 Hz', '100 Hz', '120 Hz ProMotion', '144 Hz', '165 Hz', '240 Hz']),
    },
    {
      slug: 'color',
      name: 'Device Color',
      nameAr: 'اللون',
      type: 'color',
      unit: null,
      groupId: 'grp-gen',
      options: JSON.stringify(['Black', 'Space Gray', 'Silver', 'Dark Shadow Gray', 'Midnight Blue', 'Platinum']),
    },
    {
      slug: 'operating_system',
      name: 'Operating System',
      nameAr: 'نظام التشغيل',
      type: 'select',
      unit: null,
      groupId: 'grp-gen',
      options: JSON.stringify([
        'Windows 11 Pro 64-bit',
        'Windows 11 Home',
        'Windows Server 2022 Standard',
        'macOS Sequoia',
        'Ubuntu Linux Certified',
        'FreeDOS',
      ]),
    },
    {
      slug: 'warranty_period',
      name: 'Official Warranty',
      nameAr: 'مدة الضمان الرسمي',
      type: 'select',
      unit: null,
      groupId: 'grp-gen',
      options: JSON.stringify([
        '1 Year Official Authorized Warranty',
        '2 Years Official Authorized Warranty',
        '3 Years Next-Business-Day Onsite ProSupport',
        '5 Years Enterprise Mission-Critical Support',
      ]),
    },
  ];

  const attributes: Record<string, any> = {};
  for (const a of attributesData) {
    attributes[a.slug] = await prisma.attribute.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        nameAr: a.nameAr,
        type: a.type,
        unit: a.unit,
        options: a.options,
        groupId: a.groupId,
      },
      create: {
        slug: a.slug,
        name: a.name,
        nameAr: a.nameAr,
        type: a.type,
        unit: a.unit,
        options: a.options,
        groupId: a.groupId,
      },
    });
  }
  console.log(`Created/Verified ${Object.keys(attributes).length} Standard Attributes.`);

  // 3. Map Attributes to Existing Categories
  const allCategories = await prisma.category.findMany();
  console.log(`Found ${allCategories.length} categories to configure.`);

  for (const cat of allCategories) {
    const slug = cat.slug.toLowerCase();
    const isComputing = slug.includes('laptop') || slug.includes('desktop') || slug.includes('workstation') || slug.includes('server');
    const isDisplay = slug.includes('monitor') || slug.includes('screen') || slug.includes('tv');

    // Attributes to assign
    const assignments: {
      slug: string;
      isFilterable: boolean;
      isRequired: boolean;
      isVariantOption: boolean;
      displayOrder: number;
    }[] = [];

    if (isComputing) {
      assignments.push(
        { slug: 'processor', isFilterable: true, isRequired: true, isVariantOption: false, displayOrder: 1 },
        { slug: 'ram', isFilterable: true, isRequired: true, isVariantOption: true, displayOrder: 2 },
        { slug: 'gpu', isFilterable: true, isRequired: false, isVariantOption: false, displayOrder: 3 },
        { slug: 'storage_capacity', isFilterable: true, isRequired: true, isVariantOption: true, displayOrder: 4 },
        { slug: 'screen_size', isFilterable: true, isRequired: false, isVariantOption: false, displayOrder: 5 },
        { slug: 'operating_system', isFilterable: true, isRequired: true, isVariantOption: false, displayOrder: 6 },
        { slug: 'color', isFilterable: false, isRequired: false, isVariantOption: true, displayOrder: 7 },
        { slug: 'warranty_period', isFilterable: false, isRequired: true, isVariantOption: false, displayOrder: 8 }
      );
    } else if (isDisplay) {
      assignments.push(
        { slug: 'screen_size', isFilterable: true, isRequired: true, isVariantOption: false, displayOrder: 1 },
        { slug: 'resolution', isFilterable: true, isRequired: true, isVariantOption: false, displayOrder: 2 },
        { slug: 'refresh_rate', isFilterable: true, isRequired: true, isVariantOption: false, displayOrder: 3 },
        { slug: 'warranty_period', isFilterable: false, isRequired: true, isVariantOption: false, displayOrder: 4 }
      );
    } else {
      // General IT / Networking / Security / NAS
      assignments.push(
        { slug: 'ram', isFilterable: true, isRequired: false, isVariantOption: false, displayOrder: 1 },
        { slug: 'storage_capacity', isFilterable: true, isRequired: false, isVariantOption: false, displayOrder: 2 },
        { slug: 'operating_system', isFilterable: true, isRequired: false, isVariantOption: false, displayOrder: 3 },
        { slug: 'warranty_period', isFilterable: false, isRequired: true, isVariantOption: false, displayOrder: 4 }
      );
    }

    for (const a of assignments) {
      const attr = attributes[a.slug];
      if (!attr) continue;

      await prisma.categoryAttribute.upsert({
        where: {
          categoryId_attributeId: {
            categoryId: cat.id,
            attributeId: attr.id,
          },
        },
        update: {
          isRequired: a.isRequired,
          displayOrder: a.displayOrder,
          isFilterable: a.isFilterable,
          isVariantOption: a.isVariantOption,
        },
        create: {
          categoryId: cat.id,
          attributeId: attr.id,
          isRequired: a.isRequired,
          displayOrder: a.displayOrder,
          isFilterable: a.isFilterable,
          isVariantOption: a.isVariantOption,
        },
      });
    }
  }
  console.log('Category Attributes successfully assigned!');

  // 4. Populate ProductAttributeValue for existing products based on their specs JSON
  const products = await prisma.product.findMany();
  console.log(`Populating dynamic attribute values for ${products.length} existing products...`);

  for (const p of products) {
    let specsObj: Record<string, string> = {};
    try {
      specsObj = JSON.parse(p.specs || '{}');
    } catch {}

    // Check RAM
    const ramVal = specsObj['RAM'] || specsObj['Memory'] || specsObj['ذاكرة'];
    if (ramVal && attributes['ram']) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: p.id, attributeId: attributes['ram'].id } },
        update: { textValue: ramVal },
        create: { productId: p.id, attributeId: attributes['ram'].id, textValue: ramVal },
      });
    }

    // Check Processor
    const cpuVal = specsObj['Processor'] || specsObj['CPU'] || specsObj['المعالج'];
    if (cpuVal && attributes['processor']) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: p.id, attributeId: attributes['processor'].id } },
        update: { textValue: cpuVal },
        create: { productId: p.id, attributeId: attributes['processor'].id, textValue: cpuVal },
      });
    }

    // Check GPU
    const gpuVal = specsObj['Graphics'] || specsObj['GPU'] || specsObj['كارت الشاشة'];
    if (gpuVal && attributes['gpu']) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: p.id, attributeId: attributes['gpu'].id } },
        update: { textValue: gpuVal },
        create: { productId: p.id, attributeId: attributes['gpu'].id, textValue: gpuVal },
      });
    }

    // Check Storage
    const storageVal = specsObj['Storage'] || specsObj['SSD'] || specsObj['التخزين'];
    if (storageVal && attributes['storage_capacity']) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: p.id, attributeId: attributes['storage_capacity'].id } },
        update: { textValue: storageVal },
        create: { productId: p.id, attributeId: attributes['storage_capacity'].id, textValue: storageVal },
      });
    }

    // Check Screen Size
    const screenVal = specsObj['Display'] || specsObj['Screen'] || specsObj['الشاشة'];
    if (screenVal && attributes['screen_size']) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: p.id, attributeId: attributes['screen_size'].id } },
        update: { textValue: screenVal },
        create: { productId: p.id, attributeId: attributes['screen_size'].id, textValue: screenVal },
      });
    }
  }

  // 5. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      entityId: 'attr-engine-v1',
      details: JSON.stringify({
        message: 'Enterprise Attribute Engine and Category Mapping initialized successfully.',
        timestamp: new Date().toISOString(),
      }),
    },
  });

  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
