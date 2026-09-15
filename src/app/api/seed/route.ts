import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const SEED_CATEGORIES = [
  {
    id: 'laptops',
    name: 'Laptops',
    nameAr: 'أجهزة اللابتوب',
    slug: 'laptops',
    itemCount: 48,
    image: '/images/category_laptops.jpg',
  },
  {
    id: 'desktops',
    name: 'Desktops',
    nameAr: 'أجهزة الكمبيوتر المكتبية',
    slug: 'desktops',
    itemCount: 32,
    image: '/images/category_desktops.jpg',
  },
  {
    id: 'network-device',
    name: 'Network Device',
    nameAr: 'أجهزة ومعدات الشبكات',
    slug: 'network-device',
    itemCount: 26,
    image: '/images/category_network.jpg',
  },
  {
    id: 'scanner',
    name: 'Scanner',
    nameAr: 'الماسحات الضوئية وطابعات المستندات',
    slug: 'scanner',
    itemCount: 18,
    image: '/images/category_scanner.jpg',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameAr: 'الإكسسوارات والملحقات',
    slug: 'accessories',
    itemCount: 64,
    image: '/images/category_accessories.jpg',
  },
];

export const SEED_PRODUCTS = [
  // 1. Lenovo Legion Pro 5
  {
    id: 'lenovo-legion-pro-5',
    name: 'Lenovo Legion Pro 5 16IRX8 Gaming Laptop',
    nameAr: 'لابتوب ألعاب لينوفو ليجن برو 5',
    brand: 'Lenovo',
    categoryId: 'laptops',
    subCategory: 'gaming',
    sku: '82WK0083ED',
    price: 68999,
    oldPrice: 74999,
    discountPercentage: 8,
    rating: 4.8,
    reviewCount: 142,
    inStock: true,
    stockCount: 14,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '10 : 15 : 20',
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '13th Gen Intel Core i7-13700HX, NVIDIA GeForce RTX 4070 8GB GDDR6, 16GB DDR5 5200MHz, 1TB PCIe 4.0 SSD, 16" WQXGA 240Hz 500nits IPS Display.',
    descriptionAr: 'معالج إنتل كور i7 الجيل 13، كارت شاشة RTX 4070 8GB، رامات 16GB DDR5، هارد 1TB SSD، شاشة 16 بوصة WQXGA 240Hz بدقة فائقة.',
    specs: JSON.stringify({
      'Processor': 'Intel Core i7-13700HX (16 Cores, 24 Threads, up to 5.00 GHz)',
      'RAM': '16GB DDR5-5200 (2x 8GB SO-DIMM)',
      'Storage': '1TB M.2 2280 PCIe 4.0x4 NVMe SSD',
      'Display': '16" WQXGA (2560x1600) IPS 500nits 240Hz 100% sRGB',
      'Graphics': 'NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)',
      'Warranty': '2 Years Official Local Warranty'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'إنتل كور i7-13700HX (16 نواة حتى 5.00 جيجاهرتز)',
      'الذاكرة العشوائية': '16 جيجابايت DDR5-5200MHz',
      'سعة التخزين': '1 تيرابايت M.2 NVMe SSD فائقة السرعة',
      'الشاشة': '16 بوصة WQXGA تردد 240Hz وسطوع 500 شمعة',
      'كارت الشاشة': 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      'الضمان': 'ضمان محلي معتمد سنتين'
    }),
  },

  // 2. Dell Inspiron 15 3530
  {
    id: 'dell-inspiron-15-3530',
    name: 'Dell Inspiron 15 3530 Business Laptop',
    nameAr: 'لابتوب ديل انسبايرون 15 3530 للأعمال',
    brand: 'Dell',
    categoryId: 'laptops',
    subCategory: 'business',
    sku: 'NB-DELL-3530-I5',
    price: 24999,
    oldPrice: 27999,
    discountPercentage: 11,
    rating: 4.6,
    reviewCount: 96,
    inStock: true,
    stockCount: 22,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '13th Gen Intel Core i5-1335U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6" FHD 120Hz Anti-Glare Display, Intel Iris Xe Graphics, Carbon Black.',
    descriptionAr: 'معالج إنتل كور i5 الجيل 13، رامات 16 جيجابايت، هارد 512GB SSD سريع، شاشة 15.6 بوصة FHD 120Hz مريحة للعين.',
    specs: JSON.stringify({
      'Processor': 'Intel Core i5-1335U (10 Cores, 12 Threads, up to 4.60 GHz)',
      'RAM': '16GB DDR4 2666MHz',
      'Storage': '512GB M.2 PCIe NVMe SSD',
      'Display': '15.6" FHD (1920x1080) 120Hz Anti-glare Narrow Border',
      'Graphics': 'Intel Iris Xe Graphics',
      'Warranty': '1 Year Dell Official Agent Warranty'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'إنتل كور i5-1335U (10 أنوية حتى 4.60 جيجاهرتز)',
      'الذاكرة العشوائية': '16 جيجابايت DDR4',
      'سعة التخزين': '512 جيجابايت PCIe NVMe SSD',
      'الشاشة': '15.6 بوصة FHD تردد 120Hz مضادة للتوهج',
      'كارت الشاشة': 'Intel Iris Xe Graphics',
      'الضمان': 'ضمان سنة معتمد من توكيل ديل'
    }),
  },

  // 3. Apple MacBook Air M2 13.6"
  {
    id: 'apple-macbook-air-m2',
    name: 'Apple MacBook Air 13.6" M2 Chip (Space Gray)',
    nameAr: 'أبل ماك بوك إير 13.6 بوصة شريحة M2',
    brand: 'Apple',
    categoryId: 'laptops',
    subCategory: 'ultrabooks',
    sku: 'MLXW3AB/A',
    price: 54999,
    oldPrice: 58999,
    discountPercentage: 7,
    rating: 4.9,
    reviewCount: 215,
    inStock: true,
    stockCount: 18,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '14 : 30 : 00',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Apple M2 8-Core CPU, 8-Core GPU, 8GB Unified Memory, 256GB SSD Storage, 13.6" Liquid Retina Display with True Tone, 1080p FaceTime HD Camera.',
    descriptionAr: 'شريحة أبل M2 الخارقة، معالج 8 أنوية، ذاكرة موحدة 8 جيجابايت، تخزين 256GB SSD، شاشة ليكويد ريتينا 13.6 بوصة، بطارية حتى 18 ساعة.',
    specs: JSON.stringify({
      'Processor': 'Apple M2 8-Core CPU (4 Performance + 4 Efficiency)',
      'RAM': '8GB Unified Memory',
      'Storage': '256GB High-Speed SSD',
      'Display': '13.6" Liquid Retina Display with True Tone (2560x1664)',
      'Graphics': 'Apple 8-Core GPU & 16-Core Neural Engine',
      'Battery': 'Up to 18 hours battery life with MagSafe 3 charging'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'شريحة Apple M2 (معالج ثماني النواة)',
      'الذاكرة العشوائية': '8 جيجابايت ذاكرة موحدة فائقة السرعة',
      'سعة التخزين': '256 جيجابايت SSD فائق السرعة',
      'الشاشة': '13.6 بوصة Liquid Retina بدقة 2560x1664',
      'كارت الشاشة': 'Apple 8-Core GPU',
      'البطارية': 'حتى 18 ساعة استخدام مع شاحن MagSafe 3'
    }),
  },

  // 4. HP Victus 16 Gaming Laptop
  {
    id: 'hp-victus-16-gaming',
    name: 'HP Victus 16-r0073ne Core i7 RTX 4060',
    nameAr: 'لابتوب اتش بي فيكتوس 16 ألعاب كور i7',
    brand: 'HP',
    categoryId: 'laptops',
    subCategory: 'gaming',
    sku: '8B8G7EA',
    price: 52999,
    oldPrice: 57999,
    discountPercentage: 9,
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    stockCount: 10,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: false,
    isDeal: true,
    dealEndsIn: '06 : 45 : 12',
    thumbnail: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '13th Gen Intel Core i7-13700H, NVIDIA GeForce RTX 4060 8GB, 16GB DDR5 5200MHz, 1TB NVMe SSD, 16.1" FHD 144Hz IPS Display.',
    descriptionAr: 'معالج إنتل كور i7-13700H، كارت شاشة RTX 4060 8GB، رامات 16GB DDR5، هارد 1TB SSD، شاشة 16.1 بوصة 144Hz.',
    specs: JSON.stringify({
      'Processor': 'Intel Core i7-13700H (14 Cores, up to 5.00 GHz)',
      'RAM': '16GB DDR5-5200 MHz',
      'Storage': '1TB PCIe Gen4 NVMe M.2 SSD',
      'Display': '16.1" FHD (1920x1080) 144Hz IPS micro-edge',
      'Graphics': 'NVIDIA GeForce RTX 4060 8GB GDDR6',
      'Audio': 'B&O Audio with Dual Speakers'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'إنتل كور i7-13700H (14 نواة حتى 5.00 جيجاهرتز)',
      'الذاكرة العشوائية': '16 جيجابايت DDR5-5200MHz',
      'سعة التخزين': '1 تيرابايت PCIe Gen4 SSD',
      'الشاشة': '16.1 بوصة FHD تردد 144Hz تقنية IPS',
      'كارت الشاشة': 'NVIDIA GeForce RTX 4060 8GB GDDR6',
      'الصوتيات': 'نظام صوتي احترافي من B&O'
    }),
  },

  // 5. HP ProDesk 400 G9 Microtower
  {
    id: 'hp-prodesk-400-g9',
    name: 'HP ProDesk 400 G9 Microtower Desktop PC',
    nameAr: 'كمبيوتر مكتبي تاور اتش بي بروديسك 400 G9',
    brand: 'HP',
    categoryId: 'desktops',
    subCategory: 'tower-pc',
    sku: '6A7R2EA',
    price: 31999,
    oldPrice: 35000,
    discountPercentage: 9,
    rating: 4.7,
    reviewCount: 45,
    inStock: true,
    stockCount: 15,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '13th Gen Intel Core i7-13700, 16GB DDR4 RAM, 512GB PCIe NVMe SSD, HP USB Keyboard & Mouse Included, FreeDOS / Windows 11 Pro Ready.',
    descriptionAr: 'جهاز كمبيوتر مكتبي احترافي للشركات والمكاتب، معالج إنتل كور i7 الجيل 13، رامات 16 جيجابايت، هارد 512GB SSD سريع.',
    specs: JSON.stringify({
      'Processor': 'Intel Core i7-13700 (16 Cores, 24 Threads, up to 5.20 GHz)',
      'RAM': '16GB DDR4-3200 (Expandable up to 64GB)',
      'Storage': '512GB M.2 2280 PCIe NVMe SSD',
      'Form Factor': 'Microtower (MT)',
      'Power Supply': '260W High-efficiency 80 PLUS Platinum',
      'Included': 'HP USB Wired Keyboard & Mouse'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'إنتل كور i7-13700 (16 نواة حتى 5.20 جيجاهرتز)',
      'الذاكرة العشوائية': '16 جيجابايت DDR4 قابلة للزيادة حتى 64GB',
      'سعة التخزين': '512 جيجابايت M.2 NVMe SSD',
      'الهيكل': 'تاور مكتبي Microtower',
      'مزود الطاقة': '260 وات بكفاءة 80 PLUS Platinum',
      'الملحقات': 'كيبورد وماوس سلكي أصلي من HP'
    }),
  },

  // 6. Dell OptiPlex 7010 Micro
  {
    id: 'dell-optiplex-7010-micro',
    name: 'Dell OptiPlex 7010 Micro Form Factor PC',
    nameAr: 'كمبيوتر مدمج ديل اوبتيبلكس 7010 ميكرو',
    brand: 'Dell',
    categoryId: 'desktops',
    subCategory: 'mini-pc',
    sku: 'DT-DELL-7010-MFF',
    price: 27999,
    oldPrice: 30500,
    discountPercentage: 8,
    rating: 4.8,
    reviewCount: 62,
    inStock: true,
    stockCount: 19,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '18 : 10 : 00',
    thumbnail: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Intel Core i5-13500T 13th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, Ultra Compact Space-Saving Chassis, Intel UHD 770 Graphics.',
    descriptionAr: 'كمبيوتر مدمج فائق الصغر لتوفير المساحة، معالج إنتل كور i5 الجيل 13، رامات 16 جيجابايت، هارد 512GB SSD.',
    specs: JSON.stringify({
      'Processor': 'Intel Core i5-13500T (14 Cores, up to 4.60 GHz)',
      'RAM': '16GB DDR4-3200MHz',
      'Storage': '512GB PCIe NVMe Class 35 SSD',
      'Dimensions': '18.2 x 3.6 x 17.8 cm (Ultra-compact 1L)',
      'Connectivity': 'Wi-Fi 6E + Bluetooth 5.3 + Gigabit LAN'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'إنتل كور i5-13500T (14 نواة حتى 4.60 جيجاهرتز)',
      'الذاكرة العشوائية': '16 جيجابايت DDR4',
      'سعة التخزين': '512 جيجابايت PCIe NVMe SSD',
      'الأبعاد': 'حجم فائق الصغر 1 لتر فقط',
      'الاتصال': 'واي فاي 6E وبلوتوث 5.3 ومنفذ شبكة جيجابت'
    }),
  },

  // 7. Apple iMac 24" 4.5K Retina M3
  {
    id: 'apple-imac-24-m3',
    name: 'Apple iMac 24" 4.5K Retina Display M3 Chip',
    nameAr: 'أبل آي ماك 24 بوصة ريتينا 4.5K شريحة M3',
    brand: 'Apple',
    categoryId: 'desktops',
    subCategory: 'all-in-one',
    sku: 'MQRC3AB/A',
    price: 84999,
    oldPrice: 89999,
    discountPercentage: 6,
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    stockCount: 8,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Apple M3 8-Core CPU, 10-Core GPU, 8GB Unified Memory, 512GB SSD, 24" 4.5K Retina Display, Magic Keyboard & Magic Mouse Included.',
    descriptionAr: 'الكل في واحد فائق النحافة من أبل، شريحة M3 مع شاشة 24 بوصة ريتينا 4.5K بمليار لون، ماجيك كيبورد وماجيك ماوس.',
    specs: JSON.stringify({
      'Processor': 'Apple M3 chip (8-core CPU)',
      'RAM': '8GB Unified Memory',
      'Storage': '512GB SSD Storage',
      'Display': '24" 4.5K Retina (4480x2520), 500 nits brightness, Wide color (P3)',
      'Camera & Audio': '1080p FaceTime HD camera + Six-speaker sound system with Spatial Audio'
    }),
    specsAr: JSON.stringify({
      'المعالج': 'شريحة أبل M3 ثمانية النواة',
      'الذاكرة العشوائية': '8 جيجابايت ذاكرة موحدة',
      'سعة التخزين': '512 جيجابايت SSD فائق السرعة',
      'الشاشة': '24 بوصة 4.5K Retina بدقة 4480x2520 وسطوع 500 شمعة',
      'الصوت والكاميرا': 'كاميرا 1080p ونظام 6 سماعات مع الصوت المكاني Spatial Audio'
    }),
  },

  // 8. TP-Link Archer AX73 Wi-Fi 6 Router
  {
    id: 'tp-link-archer-ax73',
    name: 'TP-Link Archer AX73 AX5400 Dual-Band Gigabit Wi-Fi 6 Router',
    nameAr: 'راوتر تي بي لينك Archer AX73 واي فاي 6 ثنائي النطاق',
    brand: 'TP-Link',
    categoryId: 'network-device',
    subCategory: 'routers',
    sku: 'ARCHER-AX73-V2',
    price: 5499,
    oldPrice: 6200,
    discountPercentage: 11,
    rating: 4.7,
    reviewCount: 84,
    inStock: true,
    stockCount: 35,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '12 : 00 : 00',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Up to 5400 Mbps Wi-Fi 6 speeds (4804 Mbps on 5GHz + 574 Mbps on 2.4GHz), 6 High-Gain Antennas with Beamforming, 1.5GHz Triple-Core CPU, USB 3.0 Port.',
    descriptionAr: 'راوتر واي فاي 6 فائق السرعة حتى 5400 ميجابت/ثانية، معالج ثلاثي النواة، 6 هوائيات لتغطية كاملة للمنازل الكبيرة والشركات.',
    specs: JSON.stringify({
      'Wi-Fi Speed': 'AX5400 (5GHz: 4804 Mbps, 2.4GHz: 574 Mbps)',
      'Antennas': '6x External High-Performance Antennas with Beamforming',
      'Ports': '1x Gigabit WAN, 4x Gigabit LAN, 1x USB 3.0 Sharing Port',
      'Processor': '1.5 GHz Triple-Core CPU',
      'Security': 'HomeShield Security, WPA3 Encryption'
    }),
    specsAr: JSON.stringify({
      'سرعة الواي فاي': '5400 ميجابت/ثانية (4804 على 5GHz و574 على 2.4GHz)',
      'الهوائيات': '6 هوائيات خارجية فائقة القوة مع تقنية Beamforming',
      'المنافذ': 'منفذ WAN جيجابت، 4 منافذ LAN جيجابت، منفذ USB 3.0 للمشاركة',
      'المعالج': 'معالج ثلاثي النواة 1.5 جيجاهرتز',
      'الأمان': 'حماية HomeShield ودعم تشفير WPA3 الأحدث'
    }),
  },

  // 9. Cisco Catalyst Business 250 24-Port Switch
  {
    id: 'cisco-catalyst-cbs250-24t',
    name: 'Cisco CBS250-24T-4G 24-Port Gigabit Smart Managed Switch',
    nameAr: 'سويتش سيسكو احترافي 24 منفذ جيجابت CBS250',
    brand: 'Cisco',
    categoryId: 'network-device',
    subCategory: 'switches',
    sku: 'CBS250-24T-4G-EU',
    price: 18999,
    oldPrice: 21500,
    discountPercentage: 12,
    rating: 4.9,
    reviewCount: 31,
    inStock: true,
    stockCount: 12,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '24x 10/100/1000 Gigabit Ports + 4x Gigabit SFP Uplinks, Layer 2+ Smart Managed Switching, Easy Dashboard Configuration, Energy Efficient.',
    descriptionAr: 'سويتش سيسكو لإدارة شبكات الشركات والمؤسسات، 24 منفذ جيجابت بالإضافة إلى 4 منافذ فايبر SFP، أداء فائق واعتمادية عالية.',
    specs: JSON.stringify({
      'Total Ports': '24x 10/100/1000 Gigabit RJ45 Ports',
      'Uplink Ports': '4x Gigabit SFP slots',
      'Switching Capacity': '56 Gbps forward bandwidth',
      'Management': 'Cisco Business Dashboard / Intuitive Web UI',
      'Warranty': 'Cisco Limited Lifetime Warranty'
    }),
    specsAr: JSON.stringify({
      'المنافذ': '24 منفذ جيجابت 10/100/1000',
      'منافذ الفايبر': '4 منافذ SFP Gigabit',
      'سعة التحويل': '56 جيجابت/ثانية',
      'الإدارة': 'واجهة ويب حديثة ونظام Cisco Business Dashboard',
      'الضمان': 'ضمان مدى الحياة المحدود من سيسكو'
    }),
  },

  // 10. Ubiquiti UniFi 6 Pro Access Point
  {
    id: 'ubiquiti-unifi-6-pro',
    name: 'Ubiquiti UniFi 6 Pro (U6-Pro) Indoor Wi-Fi 6 Access Point',
    nameAr: 'أكسس بوينت يوبيكويتي UniFi 6 Pro احترافي',
    brand: 'Ubiquiti',
    categoryId: 'network-device',
    subCategory: 'access-points',
    sku: 'U6-PRO',
    price: 9499,
    oldPrice: 10500,
    discountPercentage: 10,
    rating: 4.9,
    reviewCount: 57,
    inStock: true,
    stockCount: 20,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'High-performance ceiling-mounted Wi-Fi 6 AP designed for large offices and smart homes. 5.3 Gbps aggregate throughput, 350+ client capacity, PoE powered.',
    descriptionAr: 'نقطة وصول لاسلكية احترافية واي فاي 6 للشركات والفيلات، سرعة إجمالية 5.3 جيجابت/ثانية، تدعم أكثر من 350 مستخدم متصل في نفس الوقت.',
    specs: JSON.stringify({
      'Throughput': 'Up to 5.3 Gbps over the air (4.8 Gbps on 5GHz 4x4 MU-MIMO)',
      'Client Capacity': '350+ Concurrent Connected Clients',
      'Power Source': 'Standard PoE / PoE+ (802.3at)',
      'Management': 'UniFi Network Application (Web & Mobile App)'
    }),
    specsAr: JSON.stringify({
      'السرعة': 'حتى 5.3 جيجابت/ثانية بتقنية 4x4 MU-MIMO',
      'عدد العملاء': 'أكثر من 350 عميل في نفس الوقت بدون بطء',
      'مصدر الطاقة': 'طاقة عبر الإيثرنت PoE / PoE+',
      'التحكم': 'تطبيق UniFi Network للموبايل والكمبيوتر'
    }),
  },

  // 11. HP LaserJet Pro MFP M428fdw
  {
    id: 'hp-laserjet-pro-m428fdw',
    name: 'HP LaserJet Pro MFP M428fdw Wireless All-in-One Printer',
    nameAr: 'طابعة ليزر متعددة الوظائف اتش بي ليزرجيت M428fdw',
    brand: 'HP',
    categoryId: 'scanner',
    subCategory: 'multifunction',
    sku: 'W1A30A',
    price: 24999,
    oldPrice: 27500,
    discountPercentage: 9,
    rating: 4.8,
    reviewCount: 110,
    inStock: true,
    stockCount: 16,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '09 : 15 : 40',
    thumbnail: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Print, copy, scan, fax with dual-band Wi-Fi, Ethernet, automatic 2-sided printing, 50-sheet ADF, 40 ppm print speed, HP Wolf Pro Security.',
    descriptionAr: 'طابعة ليزر احترافية للشركات: طباعة، مسح ضوئي، تصوير، وفاكس. طباعة على الوجهين أوتوماتيكياً، سرعة 40 صفحة في الدقيقة، واي فاي وشبكة.',
    specs: JSON.stringify({
      'Print Speed': 'Up to 40 ppm (Black, A4)',
      'Functions': 'Print, Copy, Scan, Fax, Wireless',
      'Duplex Printing': 'Automatic (Standard) Double-sided',
      'ADF Capacity': '50 Sheets 2-sided automatic document feeder',
      'Cartridge': 'HP 59A / 59X High-Yield Black LaserJet Toner'
    }),
    specsAr: JSON.stringify({
      'سرعة الطباعة': 'حتى 40 صفحة في الدقيقة (أبيض وأسود)',
      'الوظائف': 'طباعة، تصوير، سكانر، فاكس، اتصال لاسلكي',
      'الطباعة على الوجهين': 'أوتوماتيكية بدون تدخل يدوي',
      'سعة وحدة التغذية (ADF)': '50 ورقة للمسح الضوئي التلقائي للوجهين',
      'الحبارة': 'حبارة HP 59A / 59X عالية الإنتاجية'
    }),
  },

  // 12. Canon imageFORMULA DR-C225 II High-Speed Document Scanner
  {
    id: 'canon-imageformula-dr-c225',
    name: 'Canon imageFORMULA DR-C225 II High-Speed Document Scanner',
    nameAr: 'سكانر مستندات فائق السرعة كانون DR-C225 II',
    brand: 'Canon',
    categoryId: 'scanner',
    subCategory: 'doc-scanners',
    sku: '3258C003AA',
    price: 18500,
    oldPrice: 20500,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 43,
    inStock: true,
    stockCount: 11,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Compact vertical design, 25 ppm / 50 ipm duplex color scanning, 30-sheet ADF, ultrasonic double-feed detection, direct PDF / OCR scanning.',
    descriptionAr: 'ماسح ضوئي عمودي موفر للمساحة، مسح ضوئي فائق السرعة للوجهين 50 صورة في الدقيقة، تحويل المستندات إلى PDF قابل للبحث (OCR).',
    specs: JSON.stringify({
      'Scan Speed': '25 ppm / 50 ipm (Color & Grayscale, 300 dpi)',
      'Feeder Capacity': '30 Sheets automatic document feeder',
      'Design': 'Vertical J-Path compact footprint saving desktop space',
      'Optical Resolution': '600 dpi',
      'Compatibility': 'Windows 10/11 & macOS'
    }),
    specsAr: JSON.stringify({
      'سرعة المسح': '25 صفحة / 50 صورة في الدقيقة ملون وأسود',
      'سعة الدرج': '30 ورقة في وحدة التغذية التلقائية',
      'التصميم': 'تصميم عمودي مبتكر يوفر 50% من مساحة المكتب',
      'الدقة': '600 نقطة في البوصة مع استشعار التغذية المزدوجة',
      'التوافق': 'يعمل مع ويندوز وماك'
    }),
  },

  // 13. Logitech MX Master 3S Wireless Mouse
  {
    id: 'logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Performance Wireless Mouse',
    nameAr: 'ماوس لاسلكي احترافي لوجيتك MX Master 3S',
    brand: 'Logitech',
    categoryId: 'accessories',
    subCategory: 'mice',
    sku: '910-006561',
    price: 5499,
    oldPrice: 6200,
    discountPercentage: 11,
    rating: 4.9,
    reviewCount: 310,
    inStock: true,
    stockCount: 45,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '16 : 40 : 00',
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Quiet Clicks, 8000 DPI any-surface optical sensor, MagSpeed electromagnetic scrolling, USB-C quick recharge, Bluetooth & Logi Bolt, connects up to 3 devices.',
    descriptionAr: 'الماوس الأفضل للمبرمجين والمصممين، نقرات صامتة فائقة الهدوء، حساس 8000 DPI يعمل على الزجاج، عجلة تمرير كهرومغناطيسية MagSpeed.',
    specs: JSON.stringify({
      'Sensor': 'Darkfield high precision (8000 DPI adjustable in 50 DPI steps)',
      'Scroll Wheel': 'MagSpeed with SmartShift (1000 lines per second)',
      'Battery': 'Rechargeable Li-Po (500 mAh), up to 70 days on full charge',
      'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB Receiver',
      'Multi-Device': 'Pair up to 3 devices and switch with Easy-Switch button'
    }),
    specsAr: JSON.stringify({
      'الحساس': 'حساس Darkfield فائق الدقة 8000 DPI يعمل على أي سطح حتى الزجاج',
      'عجلة التمرير': 'تقنية MagSpeed للتمرير فائق السرعة حتى 1000 سطر في الثانية',
      'البطارية': 'بطارية قابلة للشحن تدوم حتى 70 يوماً وتدعم الشحن السريع USB-C',
      'الاتصال': 'بلوتوث + مستقبل Logi Bolt USB',
      'تعدد الأجهزة': 'الاقتران بـ 3 أجهزة والتنقل بينهم بضغطة زر'
    }),
  },

  // 14. Keychron K2 Wireless Mechanical Keyboard
  {
    id: 'keychron-k2-wireless-keyboard',
    name: 'Keychron K2 V2 Wireless RGB Mechanical Keyboard',
    nameAr: 'كيبورد ميكانيكي لاسلكي كيتشرون K2 V2 بإضاءة RGB',
    brand: 'Keychron',
    categoryId: 'accessories',
    subCategory: 'keyboards',
    sku: 'K2-B1-V2',
    price: 4999,
    oldPrice: 5600,
    discountPercentage: 11,
    rating: 4.8,
    reviewCount: 92,
    inStock: true,
    stockCount: 25,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ]),
    description: '75% compact layout (84 keys), Gateron G Pro Brown Switches, Bluetooth 5.1 & Type-C wired mode, Mac and Windows keycaps, 4000 mAh battery.',
    descriptionAr: 'كيبورد ميكانيكي مدمج 75% بمفاتيح Gateron Brown المريحة، يعمل سلكي ولاسلكي بلوتوث، بطارية ضخمة 4000 مللي أمبير، متوافق مع ماك وويندوز.',
    specs: JSON.stringify({
      'Layout': '75% (84 Keys)',
      'Switches': 'Gateron G Pro Mechanical (Brown - Tactile & Silent)',
      'Backlight': '18 Types of RGB Backlight Options',
      'Battery': '4000 mAh rechargeable battery (up to 240 hours)',
      'Compatibility': 'macOS, Windows, iOS, and Android'
    }),
    specsAr: JSON.stringify({
      'التصميم': 'حجم 75% مدمج (84 زر)',
      'نوع المفاتيح': 'Gateron G Pro Brown ميكانيكية مريحة للكتابة والبرمجة',
      'الإضاءة': 'إضاءة خلفية RGB بـ 18 نمط مختلف',
      'البطارية': '4000 مللي أمبير تدوم حتى 240 ساعة',
      'التوافق': 'دعم أصلي لنظامي Mac وWindows'
    }),
  },

  // 15. Samsung T7 Portable SSD 1TB
  {
    id: 'samsung-t7-portable-ssd-1tb',
    name: 'Samsung T7 1TB USB 3.2 Gen 2 Portable External SSD',
    nameAr: 'هارد خارجي سامسونج T7 محمول 1 تيرابايت SSD',
    brand: 'Samsung',
    categoryId: 'accessories',
    subCategory: 'storage',
    sku: 'MU-PC1T0T/WW',
    price: 4699,
    oldPrice: 5200,
    discountPercentage: 10,
    rating: 4.9,
    reviewCount: 165,
    inStock: true,
    stockCount: 30,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    dealEndsIn: '05 : 20 : 00',
    thumbnail: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Read speeds up to 1,050 MB/s and write speeds up to 1,000 MB/s on USB 3.2 Gen 2, solid aluminum unibody, password protection with AES 256-bit encryption.',
    descriptionAr: 'هارد SSD خارجي فائق السرعة يصل إلى 1050 ميجابايت في الثانية، هيكل ألومنيوم مقاوم للصدمات، حماية برقم سري وتشفير أجهزة عالي الأمان.',
    specs: JSON.stringify({
      'Capacity': '1TB NVMe Flash',
      'Transfer Speed': 'Up to 1,050 MB/s Read / 1,000 MB/s Write',
      'Interface': 'USB 3.2 Gen 2 (10Gbps) Type-C',
      'Security': 'AES 256-bit hardware encryption',
      'Durability': 'Shock-resistant up to 2-meter drop'
    }),
    specsAr: JSON.stringify({
      'السعة': '1 تيرابايت NVMe فائق السرعة',
      'سرعة النقل': 'قراءة حتى 1050 ميجابايت/ث وكتابة حتى 1000 ميجابايت/ث',
      'المنفذ': 'USB 3.2 Gen 2 Type-C سريع',
      'الحماية': 'تشفير هاردوير AES 256-bit بكلمة مرور',
      'المتانة': 'مقاوم للصدمات والسقوط حتى ارتفاع 2 متر'
    }),
  },

  // 16. HyperX Cloud III Wireless Gaming Headset
  {
    id: 'hyperx-cloud-iii-wireless',
    name: 'HyperX Cloud III Wireless Gaming Headset',
    nameAr: 'سماعة ألعاب هايبر إكس كلاود 3 وايرلس احترافية',
    brand: 'HyperX',
    categoryId: 'accessories',
    subCategory: 'headsets',
    sku: '77Z45AA',
    price: 6999,
    oldPrice: 7800,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 88,
    inStock: true,
    stockCount: 16,
    shipsWithin: 'Ships within 24 hours',
    shipsWithinAr: 'يتم الشحن خلال 24 ساعة',
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    dealEndsIn: null,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Up to 120-hour battery life, 53mm angled drivers, DTS Headphone:X Spatial Audio, ultra-clear 10mm microphone with LED mute indicator, durable aluminum frame.',
    descriptionAr: 'سماعة رأس ألعاب لاسلكية تدوم حتى 120 ساعة بشحنة واحدة، صوت محيطي DTS Spatial Audio، مايكروفون نقي جداً، وسائد أذن ميموري فوم مريحة.',
    specs: JSON.stringify({
      'Battery Life': 'Up to 120 hours of continuous wireless gaming',
      'Drivers': '53mm angled dynamic drivers with neodymium magnets',
      'Audio Technology': 'DTS Headphone:X Spatial Audio',
      'Microphone': '10mm noise-cancelling with internal mesh filter and LED mute',
      'Wireless Connection': 'Fast 2.4GHz wireless via USB-C dongle'
    }),
    specsAr: JSON.stringify({
      'عمر البطارية': 'حتى 120 ساعة استخدام متواصل بدون شحن',
      'السماعات الداخلية': 'مشغلات 53 مم زاوية مع مغناطيس نيوديميوم لصوت نقي وعميق',
      'تقنية الصوت': 'صوت مكاني DTS Headphone:X Spatial Audio ثلاثي الأبعاد',
      'المايكروفون': 'مايكروفون 10 مم عازل للضوضاء مع مؤشر LED لكتم الصوت',
      'الاتصال اللاسلكي': 'اتصال 2.4GHz فائق السرعة بدون أي تأخير في الصوت'
    }),
  },
];

export async function GET(request: Request) {
  // Prevent unauthorized database re-seeding in production
  const seedSecret = request.headers.get('x-seed-secret');
  const expectedSecret = process.env.SEED_SECRET || 'hubcloud-seed-protect-2026';

  if (process.env.NODE_ENV === 'production' && seedSecret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Database seeding is restricted in production. Valid secret key required.' },
      { status: 403 }
    );
  }

  try {
    // 1. Upsert Categories
    for (const cat of SEED_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          nameAr: cat.nameAr,
          itemCount: cat.itemCount,
          image: cat.image,
        },
        create: {
          id: cat.id,
          name: cat.name,
          nameAr: cat.nameAr,
          slug: cat.slug,
          itemCount: cat.itemCount,
          image: cat.image,
        },
      });
    }

    // 2. Upsert Products
    for (const p of SEED_PRODUCTS) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          categoryId: p.categoryId,
          subCategory: p.subCategory,
          sku: p.sku,
          price: p.price,
          oldPrice: p.oldPrice,
          discountPercentage: p.discountPercentage,
          inStock: p.inStock,
          stockCount: p.stockCount,
          shipsWithin: p.shipsWithin,
          shipsWithinAr: p.shipsWithinAr,
          isNew: p.isNew,
          isBestSeller: p.isBestSeller,
          isDeal: p.isDeal,
          dealEndsIn: p.dealEndsIn,
          thumbnail: p.thumbnail,
          images: p.images,
          description: p.description,
          descriptionAr: p.descriptionAr,
          specs: p.specs,
          specsAr: p.specsAr,
        },
        create: {
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          categoryId: p.categoryId,
          subCategory: p.subCategory,
          sku: p.sku,
          price: p.price,
          oldPrice: p.oldPrice,
          discountPercentage: p.discountPercentage,
          inStock: p.inStock,
          stockCount: p.stockCount,
          shipsWithin: p.shipsWithin,
          shipsWithinAr: p.shipsWithinAr,
          isNew: p.isNew,
          isBestSeller: p.isBestSeller,
          isDeal: p.isDeal,
          dealEndsIn: p.dealEndsIn,
          thumbnail: p.thumbnail,
          images: p.images,
          description: p.description,
          descriptionAr: p.descriptionAr,
          specs: p.specs,
          specsAr: p.specsAr,
        },
      });
    }

    // 3. Upsert Active Coupons
    const coupons = [
      { code: 'HUB2026', discountAmount: 2000, minSpend: 10000 },
      { code: 'SAVE1500', discountAmount: 1500, minSpend: 6000 },
      { code: 'WELCOME10', discountAmount: 1000, minSpend: 4000 },
      { code: 'HUBCLOUD10', discountAmount: 1500, minSpend: 5000 },
      { code: 'SAVE2000', discountAmount: 2000, minSpend: 8000 },
    ];

    for (const c of coupons) {
      await prisma.coupon.upsert({
        where: { code: c.code },
        update: { discountAmount: c.discountAmount, minSpend: c.minSpend, isActive: true },
        create: { code: c.code, discountAmount: c.discountAmount, minSpend: c.minSpend, isActive: true },
      });
    }

    // 4. Default Admin & Customer
    await prisma.user.upsert({
      where: { email: 'admin@hubcloud.eg' },
      update: { role: 'admin' },
      create: {
        name: 'Hub Cloud Admin',
        email: 'admin@hubcloud.eg',
        phone: '01000000000',
        role: 'admin',
      },
    });

    await prisma.user.upsert({
      where: { email: 'ahmed@gmail.com' },
      update: { role: 'customer' },
      create: {
        name: 'Ahmed Mahmoud',
        email: 'ahmed@gmail.com',
        phone: '01012345678',
        role: 'customer',
      },
    });

    const [categoryCount, productCount, couponCount] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with realistic Egyptian market IT hardware!',
      stats: {
        categories: categoryCount,
        products: productCount,
        coupons: couponCount,
      },
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
