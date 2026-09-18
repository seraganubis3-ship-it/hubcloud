'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { CatalogNavTabs } from '@/components/admin/CatalogNavTabs';
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  X,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Boxes,
  Tag,
  Check,
  ChevronDown,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Archive,
  Eye,
  DollarSign,
  Sparkles,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  Wand2,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Flame
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  nameAr?: string;
}

interface ProductItem {
  id: string;
  name: string;
  nameAr?: string | null;
  brand: string;
  category?: string;
  categorySlug?: string;
  categoryId: string;
  sku: string;
  barcode?: string | null;
  price: number;
  oldPrice?: number | null;
  costPrice?: number | null;
  compareAtPrice?: number | null;
  stockCount: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  inStock: boolean;
  status: string;
  isArchived: boolean;
  isDeal?: boolean;
  thumbnail: string;
  images?: string[];
  description?: string | null;
  descriptionAr?: string | null;
  specs?: Record<string, string>;
  attributeValues?: any[];
  variants?: any[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

export default function AdminProductsPage() {
  const { formatPrice, showToast, isRtl } = useStore();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock' | 'archived'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dealFilter, setDealFilter] = useState<'all' | 'deals'>('all');

  // Selected Products for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');

  // Modals
  type ProductModalTab = 'details' | 'specs' | 'description' | 'advanced';
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [modalTab, setModalTab] = useState<ProductModalTab>('details');
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [isCatAttrsLoading, setIsCatAttrsLoading] = useState(false);

  // Quick Hardware Specs state
  const [quickSpecs, setQuickSpecs] = useState({
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    display: '',
  });

  // Custom Specs state (Key-Value pairs on the fly)
  const [customSpecs, setCustomSpecs] = useState<{ key: string; value: string }[]>([]);

  // Generate unique SKU
  const generateRandomSku = () => 'HC-' + Math.floor(10000 + Math.random() * 90000);

  // Auto-Sync System: Matches quickSpec fields with category attributes seamlessly
  const SPEC_FIELD_MATCHERS: Record<'cpu' | 'ram' | 'storage' | 'gpu' | 'display', string[]> = {
    cpu: ['processor', 'cpu', 'معالج', 'المعالج'],
    ram: ['ram', 'memory', 'ذاكرة', 'الذاكرة', 'الذاكرة العشوائية'],
    storage: ['storage', 'ssd', 'hdd', 'hard drive', 'تخزين', 'سعة التخزين', 'التخزين'],
    gpu: ['gpu', 'graphics', 'كارت الشاشة', 'بطاقة الرسوميات', 'الرسومات', 'كارت'],
    display: ['screen', 'display', 'شاشة', 'الشاشة', 'حجم الشاشة', 'الشاشة والعرض'],
  };

  // Find matching category attribute for a quick spec field
  const findMatchingCategoryAttribute = (field: 'cpu' | 'ram' | 'storage' | 'gpu' | 'display') => {
    const matchers = SPEC_FIELD_MATCHERS[field];
    return categoryAttributes.find((ca) => {
      const slug = (ca.attribute?.slug || '').toLowerCase();
      const name = (ca.attribute?.name || '').toLowerCase();
      const nameAr = (ca.attribute?.nameAr || '').toLowerCase();
      return matchers.some((m) => slug.includes(m) || name.includes(m) || nameAr.includes(m));
    });
  };

  // Check if a category attribute is linked to any quick spec field
  const getLinkedQuickSpecField = (attrSlug: string, attrName: string): 'cpu' | 'ram' | 'storage' | 'gpu' | 'display' | null => {
    const lowerKey = `${attrSlug} ${attrName}`.toLowerCase();
    for (const [field, matchers] of Object.entries(SPEC_FIELD_MATCHERS) as ['cpu' | 'ram' | 'storage' | 'gpu' | 'display', string[]][]) {
      if (matchers.some((m) => lowerKey.includes(m))) {
        return field;
      }
    }
    return null;
  };

  // 2-Way Auto-Sync: From Quick Specs to Category Attributes
  const handleUpdateQuickSpec = (field: 'cpu' | 'ram' | 'storage' | 'gpu' | 'display', value: string) => {
    setQuickSpecs((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-sync into matching category attribute in real-time
    const match = findMatchingCategoryAttribute(field);
    if (match) {
      setProductForm((prev) => ({
        ...prev,
        attributeValues: {
          ...prev.attributeValues,
          [match.attribute.id]: value,
        },
      }));
    }
  };

  // Helper to set or toggle quick spec preset
  const handleSetQuickSpec = (field: 'cpu' | 'ram' | 'storage' | 'gpu' | 'display', value: string) => {
    const nextVal = quickSpecs[field] === value ? '' : value;
    handleUpdateQuickSpec(field, nextVal);
  };

  // 2-Way Auto-Sync: From Category Attributes to Quick Specs
  const handleUpdateCategoryAttribute = (attrId: string, attrSlug: string, attrName: string, value: string) => {
    setProductForm((prev) => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [attrId]: value,
      },
    }));

    // If this attribute corresponds to a Quick Spec field, sync it upwards
    const linkedField = getLinkedQuickSpecField(attrSlug, attrName);
    if (linkedField) {
      setQuickSpecs((prev) => ({
        ...prev,
        [linkedField]: value,
      }));
    }
  };

  // Helper to add custom spec row
  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateCustomSpec = (index: number, field: 'key' | 'value', val: string) => {
    setCustomSpecs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveCustomSpec = (index: number) => {
    setCustomSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 1-Click Auto-Generate Description from Specs
  const handleAutoGenerateDescription = () => {
    const brand = productForm.brand || 'High-End';
    const nameEn = productForm.name || `${brand} Hardware Solution`;
    const nameAr = productForm.nameAr || nameEn;

    // Collect all specs into an array
    const specsList: { labelEn: string; labelAr: string; val: string }[] = [];

    if (quickSpecs.cpu) specsList.push({ labelEn: 'Processor (CPU)', labelAr: 'المعالج', val: quickSpecs.cpu });
    if (quickSpecs.ram) specsList.push({ labelEn: 'Memory (RAM)', labelAr: 'الذاكرة العشوائية', val: quickSpecs.ram });
    if (quickSpecs.storage) specsList.push({ labelEn: 'Storage (SSD)', labelAr: 'سعة التخزين', val: quickSpecs.storage });
    if (quickSpecs.gpu) specsList.push({ labelEn: 'Graphics (GPU)', labelAr: 'كارت الشاشة', val: quickSpecs.gpu });
    if (quickSpecs.display) specsList.push({ labelEn: 'Display', labelAr: 'الشاشة والعرض', val: quickSpecs.display });

    // Category Attributes (deduplicated against quickSpecs)
    categoryAttributes.forEach((ca) => {
      const val = productForm.attributeValues[ca.attributeId];
      const linkedField = getLinkedQuickSpecField(ca.attribute.slug, ca.attribute.name);
      // Only add if not already covered by quickSpecs above
      const alreadyInQuickSpecs = linkedField && quickSpecs[linkedField];

      if (val && !alreadyInQuickSpecs) {
        specsList.push({
          labelEn: ca.attribute.name,
          labelAr: ca.attribute.nameAr || ca.attribute.name,
          val: `${val}${ca.attribute.unit ? ' ' + ca.attribute.unit : ''}`,
        });
      }
    });

    // Custom Specs
    customSpecs.forEach((cs) => {
      if (cs.key.trim() && cs.value.trim()) {
        specsList.push({ labelEn: cs.key.trim(), labelAr: cs.key.trim(), val: cs.value.trim() });
      }
    });

    const arabicBullets = specsList.map((s) => `• ${s.labelAr}: ${s.val}`).join('\n');
    const englishBullets = specsList.map((s) => `• ${s.labelEn}: ${s.val}`).join('\n');

    const descAr = `${nameAr} من ${brand} - صُمم لتقديم أعلى مستويات الأداء والاستقرار الفائق لتلبية متطلبات بيئات العمل الاحترافية والمستخدمين الأكثر تطلباً.\n\nأبرز المواصفات الفنية:\n${arabicBullets || '• مواصفات معتمدة ومختبرة بأحدث المقاييس العالمية'}\n\n• الضمان والدعم: ضمان محلي معتمد مع دعم فني متخصص.\n• الحالة: أصلي 100% بحالة المصنع الجديدة وتغليف محكم.`;

    const descEn = `${nameEn} by ${brand} delivers superior performance, high reliability, and industry-leading efficiency built for heavy workloads and professional computing.\n\nKey Specifications:\n${englishBullets || '• Factory tested enterprise-grade specifications'}\n\n• Warranty: Official warranty coverage with dedicated technical support.\n• Condition: 100% Brand New in original factory sealed packaging.`;

    setProductForm((prev) => ({
      ...prev,
      description: descEn,
      descriptionAr: descAr,
    }));

    showToast(isRtl ? 'تم توليد الوصف والمواصفات باللغتين بنجاح!' : 'Description auto-generated from specifications!', 'success');
  };

  // Quick Description Templates
  const applyDescriptionTemplate = (type: 'gaming' | 'workstation' | 'office' | 'network') => {
    let arAdd = '';
    let enAdd = '';

    if (type === 'gaming') {
      arAdd = '\n• تجربة ألعاب استثنائية: شاشة سريعة وتردد عالي مع نظام تبريد متطور لمنع ارتفاع درجات الحرارة أثناء جلسات اللعب المكثفة.';
      enAdd = '\n• Ultimate Gaming Experience: High-refresh rate visuals and advanced thermal cooling system for peak frame-rates without throttling.';
    } else if (type === 'workstation') {
      arAdd = '\n• محطة عمل للمحترفين: معتمد ومخصص لبرامج المونتاج والهندسة والتصميم ثلاثي الأبعاد (CAD / 3D Modeling / Video Editing).';
      enAdd = '\n• Pro Workstation Certified: Optimized for CAD, 3D architecture, video rendering, and heavy multitasking workloads.';
    } else if (type === 'office') {
      arAdd = '\n• مثالي للأعمال والشركات: استهلاك طاقة اقتصادي وموثوقية عالية لإنجاز المهام المكتبية اليومية بأعلى كفاءة.';
      enAdd = '\n• Enterprise Business Grade: Low energy consumption, enterprise data security, and seamless day-to-day productivity.';
    } else if (type === 'network') {
      arAdd = '\n• استقرار تام على مدار الساعة (24/7): مصمم للعمل المتواصل تحت أقصى ضغوط الشبكات مع منافذ عالية السرعة وتوافق شامل.';
      enAdd = '\n• 24/7 Mission-Critical Reliability: Engineered for continuous operation with redundant throughput and high enterprise security.';
    }

    setProductForm((prev) => ({
      ...prev,
      description: (prev.description || '') + enAdd,
      descriptionAr: (prev.descriptionAr || '') + arAdd,
    }));

    showToast(isRtl ? 'تمت إضافة ميزات القالب إلى الوصف' : 'Template highlights added to description', 'info');
  };

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    nameAr: '',
    brand: 'Dell',
    categoryId: 'laptops',
    sku: '',
    barcode: '',
    price: 25000,
    compareAtPrice: 28000,
    costPrice: 20000,
    stockCount: 20,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorders: false,
    status: 'active',
    isDeal: false,
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    additionalImages: '',
    description: '',
    descriptionAr: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    attributeValues: {} as Record<string, string>,
    variants: [] as { sku: string; price: number; stockCount: number; options: Record<string, string> }[],
  });

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success && prodData.products) {
        setProducts(prodData.products);
      }
      if (catData.success && catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !productForm.categoryId) {
          setProductForm((prev) => ({ ...prev, categoryId: catData.categories[0].slug }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch products from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // Fetch Category Attributes when categoryId in form changes
  const loadCategoryAttributes = async (catSlugOrId: string) => {
    setIsCatAttrsLoading(true);
    try {
      const res = await fetch(`/api/categories/${catSlugOrId}/attributes`);
      const data = await res.json();
      if (data.success && data.assignedAttributes) {
        setCategoryAttributes(data.assignedAttributes);

        // Auto-populate matching category attributes from current quickSpecs
        setProductForm((prev) => {
          const updatedAttrVals = { ...prev.attributeValues };
          let changed = false;

          data.assignedAttributes.forEach((ca: any) => {
            if (!updatedAttrVals[ca.attributeId]) {
              const slug = (ca.attribute?.slug || '').toLowerCase();
              const name = (ca.attribute?.name || '').toLowerCase();
              const nameAr = (ca.attribute?.nameAr || '').toLowerCase();
              const combined = `${slug} ${name} ${nameAr}`;

              for (const [field, matchers] of Object.entries(SPEC_FIELD_MATCHERS) as ['cpu' | 'ram' | 'storage' | 'gpu' | 'display', string[]][]) {
                if (quickSpecs[field] && matchers.some((m) => combined.includes(m))) {
                  updatedAttrVals[ca.attributeId] = quickSpecs[field];
                  changed = true;
                  break;
                }
              }
            }
          });

          return changed ? { ...prev, attributeValues: updatedAttrVals } : prev;
        });
      } else {
        setCategoryAttributes([]);
      }
    } catch (err) {
      console.warn('Could not load category attributes:', err);
      setCategoryAttributes([]);
    } finally {
      setIsCatAttrsLoading(false);
    }
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    const initialSku = generateRandomSku();
    const defaultCat = categories[0]?.slug || 'laptops';
    setProductForm({
      name: '',
      nameAr: '',
      brand: 'Dell',
      categoryId: defaultCat,
      sku: initialSku,
      barcode: '',
      price: 25000,
      compareAtPrice: 28000,
      costPrice: 20000,
      stockCount: 20,
      lowStockThreshold: 5,
      trackInventory: true,
      allowBackorders: false,
      status: 'active',
      isDeal: false,
      thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      additionalImages: '',
      description: '',
      descriptionAr: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      attributeValues: {},
      variants: [],
    });
    setQuickSpecs({
      cpu: '',
      ram: '',
      storage: '',
      gpu: '',
      display: '',
    });
    setCustomSpecs([]);
    setModalTab('details');
    loadCategoryAttributes(defaultCat);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = async (prod: ProductItem) => {
    setEditingProduct(prod);
    setModalTab('details');
    await loadCategoryAttributes(prod.categoryId || (prod as any).categorySlug || 'laptops');

    // Build attribute values dictionary from existing attributeValues or specs
    const initialAttrVals: Record<string, string> = {};
    if (prod.attributeValues && Array.isArray(prod.attributeValues)) {
      prod.attributeValues.forEach((av: any) => {
        initialAttrVals[av.attributeId] =
          av.textValue ||
          (av.numberValue !== null ? String(av.numberValue) : '') ||
          (av.booleanValue !== null ? String(av.booleanValue) : '');
      });
    }

    // Extract quick specs from prod.specs
    const knownKeys = [
      'Brand', 'brand',
      'Processor', 'CPU', 'المعالج', 'processor', 'cpu',
      'RAM', 'Memory', 'الذاكرة', 'الذاكرة العشوائية', 'ram', 'memory',
      'Storage', 'SSD', 'Hard Drive', 'التخزين', 'سعة التخزين', 'storage', 'ssd',
      'Graphics', 'GPU', 'كارت الشاشة', 'graphics', 'gpu',
      'Display', 'Screen', 'الشاشة', 'display', 'screen'
    ];

    const cpuVal = prod.specs?.['Processor'] || prod.specs?.['CPU'] || prod.specs?.['المعالج'] || '';
    const ramVal = prod.specs?.['RAM'] || prod.specs?.['Memory'] || prod.specs?.['الذاكرة العشوائية'] || prod.specs?.['الذاكرة'] || '';
    const storageVal = prod.specs?.['Storage'] || prod.specs?.['SSD'] || prod.specs?.['سعة التخزين'] || prod.specs?.['التخزين'] || '';
    const gpuVal = prod.specs?.['Graphics'] || prod.specs?.['GPU'] || prod.specs?.['كارت الشاشة'] || '';
    const displayVal = prod.specs?.['Display'] || prod.specs?.['Screen'] || prod.specs?.['الشاشة'] || '';

    setQuickSpecs({
      cpu: cpuVal,
      ram: ramVal,
      storage: storageVal,
      gpu: gpuVal,
      display: displayVal,
    });

    const loadedCustom: { key: string; value: string }[] = [];
    if (prod.specs && typeof prod.specs === 'object') {
      Object.entries(prod.specs).forEach(([k, v]) => {
        if (!knownKeys.includes(k) && typeof v === 'string' && v) {
          loadedCustom.push({ key: k, value: v });
        }
      });
    }
    setCustomSpecs(loadedCustom);

    setProductForm({
      name: prod.name,
      nameAr: prod.nameAr || '',
      brand: prod.brand,
      categoryId: prod.categoryId || (prod as any).categorySlug || 'laptops',
      sku: prod.sku,
      barcode: prod.barcode || '',
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || prod.oldPrice || 0,
      costPrice: prod.costPrice || 0,
      stockCount: prod.stockCount,
      lowStockThreshold: prod.lowStockThreshold || 5,
      trackInventory: prod.trackInventory ?? true,
      allowBackorders: false,
      status: prod.status || (prod.isArchived ? 'archived' : 'active'),
      thumbnail: prod.thumbnail,
      additionalImages: prod.images && Array.isArray(prod.images) ? prod.images.slice(1).join(', ') : '',
      description: prod.description || '',
      descriptionAr: prod.descriptionAr || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
      seoKeywords: prod.seoKeywords || '',
      attributeValues: initialAttrVals,
      variants: prod.variants || [],
      isDeal: Boolean(prod.isDeal),
    });

    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku || !productForm.price) {
      showToast(isRtl ? 'يرجى إدخال اسم المنتج والكود (SKU) والسعر' : 'Name, SKU and Price are required', 'error');
      return;
    }

    const imagesArray = [
      productForm.thumbnail,
      ...productForm.additionalImages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ];

    // Build specs dictionary for storefront compatibility
    const specsMap: Record<string, string> = {
      Brand: productForm.brand,
    };
    if (quickSpecs.cpu) specsMap['Processor'] = quickSpecs.cpu;
    if (quickSpecs.ram) specsMap['RAM'] = quickSpecs.ram;
    if (quickSpecs.storage) specsMap['Storage'] = quickSpecs.storage;
    if (quickSpecs.gpu) specsMap['Graphics'] = quickSpecs.gpu;
    if (quickSpecs.display) specsMap['Display'] = quickSpecs.display;

    categoryAttributes.forEach((ca) => {
      const val = productForm.attributeValues[ca.attributeId];
      if (val) {
        specsMap[ca.attribute.name] = val;
      }
    });

    customSpecs.forEach((cs) => {
      if (cs.key.trim() && cs.value.trim()) {
        specsMap[cs.key.trim()] = cs.value.trim();
      }
    });

    // Also match quickSpecs into categoryAttributes if available
    const attrValuesMap = { ...productForm.attributeValues };
    categoryAttributes.forEach((ca) => {
      const attrNameLower = ca.attribute.name.toLowerCase();
      if (!attrValuesMap[ca.attributeId]) {
        if ((attrNameLower.includes('processor') || attrNameLower.includes('cpu')) && quickSpecs.cpu) {
          attrValuesMap[ca.attributeId] = quickSpecs.cpu;
        } else if ((attrNameLower.includes('ram') || attrNameLower.includes('memory')) && quickSpecs.ram) {
          attrValuesMap[ca.attributeId] = quickSpecs.ram;
        } else if ((attrNameLower.includes('storage') || attrNameLower.includes('ssd') || attrNameLower.includes('hard drive')) && quickSpecs.storage) {
          attrValuesMap[ca.attributeId] = quickSpecs.storage;
        } else if ((attrNameLower.includes('graphic') || attrNameLower.includes('gpu')) && quickSpecs.gpu) {
          attrValuesMap[ca.attributeId] = quickSpecs.gpu;
        } else if ((attrNameLower.includes('display') || attrNameLower.includes('screen')) && quickSpecs.display) {
          attrValuesMap[ca.attributeId] = quickSpecs.display;
        }
      }
    });

    // Format attribute values array for API
    const formattedAttributeValues = Object.entries(attrValuesMap)
      .filter(([_, val]) => val !== undefined && val !== '')
      .map(([attributeId, value]) => ({
        attributeId,
        textValue: String(value),
      }));

    const payload = {
      ...productForm,
      images: imagesArray,
      attributeValues: formattedAttributeValues,
      specs: specsMap,
      isArchived: productForm.status === 'archived',
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          editingProduct
            ? (isRtl ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
            : (isRtl ? 'تم إضافة المنتج بنجاح' : 'Product created successfully'),
          'success'
        );
        setIsProductModalOpen(false);
        fetchCatalogData();
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Duplicate Product Action
  const handleDuplicateProduct = async (id: string, name: string) => {
    if (!confirm(`Duplicate product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Product duplicated with new unique SKU', 'success');
        fetchCatalogData();
      } else {
        showToast(data.error || 'Failed to duplicate product', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Archive / Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product archived successfully', 'info');
        fetchCatalogData();
      } else {
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Quick Inline Table Actions
  const handleQuickStockChange = async (p: ProductItem, delta: number) => {
    const newCount = Math.max(0, p.stockCount + delta);
    if (newCount === p.stockCount) return;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id
          ? {
              ...item,
              stockCount: newCount,
              inStock: newCount > 0,
            }
          : item
      )
    );

    try {
      await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: p.id,
          quantityDelta: delta,
          reason: 'manual',
          notes: 'Quick inline table adjustment',
        }),
      });
      showToast(`Stock updated for ${p.sku}: ${newCount} units`, 'success');
    } catch {
      fetchCatalogData();
    }
  };

  const handleQuickStatusToggle = async (p: ProductItem) => {
    const nextStatus = p.status === 'active' ? 'draft' : 'active';
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
    );
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`${p.sku} is now ${nextStatus.toUpperCase()}`, 'info');
    } catch {
      fetchCatalogData();
    }
  };

  const handleQuickDealToggle = async (p: ProductItem) => {
    const nextDealState = !p.isDeal;
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, isDeal: nextDealState } : item))
    );
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeal: nextDealState }),
      });
      showToast(
        nextDealState
          ? (isRtl ? `تمت إضافة "${p.name}" إلى عروض اليوم 🔥` : `"${p.name}" added to Today's Deals 🔥`)
          : (isRtl ? `تمت إزالة "${p.name}" من عروض اليوم` : `"${p.name}" removed from Today's Deals`),
        'success'
      );
    } catch {
      fetchCatalogData();
      showToast(isRtl ? 'فشل تحديث حالة العرض' : 'Failed to update deal status', 'error');
    }
  };

  // Bulk Operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'archive' | 'delete' | 'changeCategory', targetCat?: string) => {
    if (selectedProductIds.length === 0) return;
    if (action === 'delete' && !confirm(`Permanently delete ${selectedProductIds.length} products?`)) return;

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedProductIds,
          targetCategoryId: targetCat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Bulk action applied to ${data.affectedCount || selectedProductIds.length} items`, 'success');
        setSelectedProductIds([]);
        setIsBulkCategoryModalOpen(false);
        fetchCatalogData();
      } else {
        showToast(data.error || 'Failed to execute bulk action', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // CSV Import Validation and Run
  const handleValidateImport = async () => {
    if (!csvContent.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent, validateOnly: true }),
      });
      const data = await res.json();
      setImportSummary(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!csvContent.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent, validateOnly: false }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully imported ${data.importedCount} products`, 'success');
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportSummary(null);
        fetchCatalogData();
      } else {
        showToast(data.error || 'Import failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));

    const matchesCat =
      selectedCat === 'all' ||
      p.categoryId === selectedCat ||
      p.categorySlug === selectedCat;

    let matchesStock = true;
    if (stockFilter === 'inStock') matchesStock = p.stockCount > p.lowStockThreshold;
    else if (stockFilter === 'lowStock')
      matchesStock = p.stockCount > 0 && p.stockCount <= p.lowStockThreshold;
    else if (stockFilter === 'outOfStock') matchesStock = p.stockCount === 0;
    else if (stockFilter === 'archived') matchesStock = p.isArchived || p.status === 'archived';

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = p.status === statusFilter;
    }

    let matchesDeal = true;
    if (dealFilter === 'deals') {
      matchesDeal = Boolean(p.isDeal);
    }

    return matchesSearch && matchesCat && matchesStock && matchesStatus && matchesDeal;
  });

  const totalUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stockCount || 0), 0);
  const lowStockCount = products.filter(
    (p) => p.stockCount > 0 && p.stockCount <= (p.lowStockThreshold || 5)
  ).length;
  const dealsCount = products.filter((p) => p.isDeal).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'كتالوج المنتجات والمواصفات الديناميكية' : 'Product Catalog & Dynamic Specifications'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'إدارة كتالوج الأجهزة والشبكات، تخصيص الخصائص الديناميكية، والتحديث الجماعي واستيراد وتصدير CSV.'
              : 'Enterprise hardware catalog with dynamic attributes, variants, bulk workflows, and CSV tooling.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchCatalogData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <a
            href="/api/admin/products/export?format=csv"
            download="hubcloud-products.csv"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/60"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
          </a>

          {/* Import CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/60"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'استيراد CSV' : 'Import CSV'}</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={openCreateProductModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة منتج جديد' : 'Add Hardware Product'}</span>
          </button>
        </div>
      </div>

      {/* Catalog Hub Sub-Navigation */}
      <CatalogNavTabs />

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'المنتجات النشطة' : 'Active Products'}
            </span>
            <div className="text-2xl font-black text-white font-mono">{products.length}</div>
          </div>
          <Package className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'إجمالي القطع بالمخزن' : 'Total Inventory Units'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {totalUnits.toLocaleString()}
            </div>
          </div>
          <Boxes className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'القيمة الإجمالية للمخزون' : 'Total Value (EGP)'}
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono">
              {formatPrice(totalValue)}
            </div>
          </div>
          <Tag className="w-8 h-8 text-indigo-500/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'تنبيهات نقص المخزون' : 'Low Stock Alerts'}
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">{lowStockCount}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Bulk Actions Toolbar (Sticky when items selected) */}
      {selectedProductIds.length > 0 && (
        <div className="bg-blue-950/70 border border-blue-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono">
              {selectedProductIds.length}
            </span>
            <span>{isRtl ? 'منتجات محددة' : 'Products Selected'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              {isRtl ? 'تفعيل' : 'Activate'}
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {isRtl ? 'تعطيل' : 'Draft'}
            </button>
            <button
              onClick={() => setIsBulkCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              {isRtl ? 'تغيير القسم' : 'Change Category'}
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
            >
              {isRtl ? 'أرشفة' : 'Archive'}
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
            >
              {isRtl ? 'حذف نهائي' : 'Delete'}
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث بالاسم، الماركة، SKU، أو الباركود...' : 'Search by name, brand, SKU, or barcode...'}
            className={`w-full ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isRtl ? `جميع الأقسام (${categories.length})` : `All Categories (${categories.length})`}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {isRtl && c.nameAr ? c.nameAr : c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isRtl ? 'جميع حالات المخزون' : 'All Stock Statuses'}</option>
            <option value="inStock">{isRtl ? 'مخزون كافٍ (> الحد الأدنى)' : 'Healthy Stock (> Threshold)'}</option>
            <option value="lowStock">{isRtl ? 'تنبيه مخزون منخفض (≤ الحد الأدنى)' : 'Low Stock Alert (≤ Threshold)'}</option>
            <option value="outOfStock">{isRtl ? 'نفد من المخزون (0 قطع)' : 'Out of Stock (0 units)'}</option>
            <option value="archived">{isRtl ? 'المنتجات المؤرشفة' : 'Archived Products'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
            <option value="draft">{isRtl ? 'مسودة' : 'Draft'}</option>
            <option value="archived">{isRtl ? 'مؤرشف' : 'Archived'}</option>
          </select>

          {/* Today's Deals Filter */}
          <button
            type="button"
            onClick={() => setDealFilter((prev) => (prev === 'all' ? 'deals' : 'all'))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              dealFilter === 'deals'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title={isRtl ? 'تصفية المنتجات التي تظهر في عروض اليوم' : 'Filter products currently in Today’s Deals'}
          >
            <Flame className={`w-3.5 h-3.5 ${dealFilter === 'deals' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>{isRtl ? `عروض اليوم (${dealsCount})` : `Today's Deals (${dealsCount})`}</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs text-slate-300`}>
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-800 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">{isRtl ? 'المنتج' : 'Hardware Item'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'الماركة والقسم' : 'Brand & Category'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'رمز SKU والباركود' : 'SKU & Barcode'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'السعر' : 'Price'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'حالة المخزون' : 'Stock Status'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'الحالة' : 'State'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {isRtl ? 'لم يتم العثور على أجهزة مطابقة للفلاتر.' : 'No hardware products found matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isLowStock =
                    p.stockCount > 0 && p.stockCount <= (p.lowStockThreshold || 5);
                  const isOutOfStock = p.stockCount === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(p.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-800 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white p-1 relative flex-shrink-0 border border-slate-800">
                            <Image
                              src={p.thumbnail || '/images/category_laptops.jpg'}
                              alt={p.name}
                              fill
                              className="object-contain p-0.5 mix-blend-multiply"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-xs truncate">{p.name}</span>
                              {p.isDeal && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black shrink-0 shadow-2xs">
                                  <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400 animate-pulse" />
                                  <span>{isRtl ? 'عرض اليوم' : 'Deal'}</span>
                                </span>
                              )}
                            </div>
                            {p.nameAr && (
                              <div className="text-[10px] text-slate-400 truncate" dir="rtl">
                                {p.nameAr}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{p.brand}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          /{p.categorySlug || p.categoryId}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-200">{p.sku}</div>
                        {p.barcode && <div className="text-[10px] text-slate-500">{p.barcode}</div>}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white text-sm">{formatPrice(p.price)}</div>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            {formatPrice(p.oldPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p, -1)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                              title="Decrease 1 unit"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold font-mono text-white text-xs px-2 min-w-[32px] text-center">
                              {p.stockCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p, 1)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                              title="Increase 1 unit"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isOutOfStock
                                ? 'bg-red-500'
                                : isLowStock
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-emerald-400'
                            }`}
                            title={
                              isOutOfStock
                                ? 'Out of stock'
                                : isLowStock
                                ? 'Low stock alert'
                                : 'Optimal stock'
                            }
                          />
                        </div>
                        {isLowStock && (
                          <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            p.status === 'active' && !p.isArchived
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'draft'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                          title={isRtl ? 'انقر للتبديل بين نشط / مسودة' : 'Click to toggle between Active / Draft'}
                        >
                          {p.isArchived
                            ? (isRtl ? 'مؤرشف' : 'Archived')
                            : p.status === 'draft'
                            ? (isRtl ? 'مسودة' : 'Draft')
                            : (isRtl ? 'نشط' : 'Active')}
                        </button>
                      </td>

                      <td className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'} gap-1.5`}>
                          <Link
                            href={`/products/${p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                            title={isRtl ? 'معاينة في المتجر' : 'Preview Storefront'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* 1-Click Quick Deal Toggle */}
                          <button
                            type="button"
                            onClick={() => handleQuickDealToggle(p)}
                            className={`p-1.5 rounded-lg transition-all ${
                              p.isDeal
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs shadow-amber-500/10 hover:bg-amber-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-amber-400'
                            }`}
                            title={
                              p.isDeal
                                ? (isRtl ? 'ضمن عروض اليوم 🔥 (انقر للإلغاء)' : "In Today's Deals 🔥 (Click to remove)")
                                : (isRtl ? 'إضافة إلى عروض اليوم 🔥' : "Add to Today's Deals 🔥")
                            }
                          >
                            <Flame className={`w-3.5 h-3.5 ${p.isDeal ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleDuplicateProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-colors"
                            title={isRtl ? 'تكرار المنتج' : 'Duplicate Product'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title={isRtl ? 'تعديل المنتج' : 'Edit Product'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                            title={isRtl ? 'أرشفة أو حذف' : 'Archive Product'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streamlined Fast Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>{editingProduct ? (isRtl ? 'تعديل بيانات المنتج' : 'Edit Hardware Product') : (isRtl ? 'إضافة منتج جديد' : 'New Hardware Product')}</span>
                    {editingProduct && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {editingProduct.sku}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl
                      ? 'محرر المنتجات السريع: مواصفات بنقرة واحدة، توليد الوصف الذكي، وإدارة كاملة للأسعار'
                      : 'Fast product editor: 1-click specs, auto description generator & pricing management'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs (Clean 4 Steps) */}
            <div className="flex border-b border-slate-800 gap-2 pb-2 overflow-x-auto scroll-smooth touch-pan-x scrollbar-none">
              {[
                {
                  id: 'details' as const,
                  label: isRtl ? '1. البيانات والأسعار' : '1. Basic Info & Pricing',
                  icon: Package,
                },
                {
                  id: 'specs' as const,
                  label: isRtl
                    ? `2. المواصفات الفنية (${
                        (quickSpecs.cpu ? 1 : 0) +
                        (quickSpecs.ram ? 1 : 0) +
                        (quickSpecs.storage ? 1 : 0) +
                        (quickSpecs.gpu ? 1 : 0) +
                        (quickSpecs.display ? 1 : 0) +
                        categoryAttributes.length +
                        customSpecs.length
                      })`
                    : `2. Specs Engine (${
                        (quickSpecs.cpu ? 1 : 0) +
                        (quickSpecs.ram ? 1 : 0) +
                        (quickSpecs.storage ? 1 : 0) +
                        (quickSpecs.gpu ? 1 : 0) +
                        (quickSpecs.display ? 1 : 0) +
                        categoryAttributes.length +
                        customSpecs.length
                      })`,
                  icon: Cpu,
                },
                {
                  id: 'description' as const,
                  label: isRtl ? '3. الوصف والصور الذكية' : '3. Description & Media',
                  icon: Sparkles,
                },
                {
                  id: 'advanced' as const,
                  label: isRtl ? '4. خيارات متقدمة (SEO)' : '4. Advanced (Variants & SEO)',
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* ========================================================================= */}
              {/* TAB 1: BASIC INFO & PRICING                                               */}
              {/* ========================================================================= */}
              {modalTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Product Names (EN & AR) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'اسم المنتج (بالإنجليزية) *' : 'Product Name (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Dell Precision 5570 Mobile Workstation"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'اسم المنتج (بالعربية)' : 'Product Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={productForm.nameAr}
                        onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                        placeholder="مثال: لابتوب ديل بريسيجن 5570 ورك ستيشن"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Brand & Category & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'الماركة / البراند *' : 'Brand *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        placeholder="Dell, HP, Lenovo, Apple..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                      {/* 1-Click Popular Brands */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Cisco', 'Hikvision'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, brand: b })}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                              productForm.brand.toLowerCase() === b.toLowerCase()
                                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'القسم (Single-Level Category) *' : 'Category *'}
                      </label>
                      <select
                        value={productForm.categoryId}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setProductForm({ ...productForm, categoryId: cat });
                          loadCategoryAttributes(cat);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {isRtl ? c.nameAr || c.name : c.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {isRtl ? 'يتم تحميل مواصفات القسم تلقائياً' : 'Category specs bound automatically'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'حالة النشر' : 'Publication Status'}
                      </label>
                      <select
                        value={productForm.status}
                        onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="active">{isRtl ? 'منشور ونشط (Active)' : 'Active (Published)'}</option>
                        <option value="draft">{isRtl ? 'مسودة - غير معروض (Draft)' : 'Draft (Hidden)'}</option>
                        <option value="archived">{isRtl ? 'مؤرشف (Archived)' : 'Archived'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing Fields */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isRtl ? 'الأسعار والعملة (EGP)' : 'Pricing Details (EGP)'}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          {isRtl ? 'سعر البيع النهائي (EGP) *' : 'Selling Price (EGP) *'}
                        </label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          {isRtl ? 'السعر قبل الخصم (اختياري)' : 'Compare At / Old Price'}
                        </label>
                        <input
                          type="number"
                          value={productForm.compareAtPrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              compareAtPrice: Number(e.target.value),
                            })
                          }
                          placeholder="مثال: 32000"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          {isRtl ? 'سعر التكلفة (COGS - داخلي)' : 'Cost Price (COGS)'}
                        </label>
                        <input
                          type="number"
                          value={productForm.costPrice || ''}
                          onChange={(e) =>
                            setProductForm({ ...productForm, costPrice: Number(e.target.value) })
                          }
                          placeholder="لحساب الأرباح بدقة"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Today's Deals Toggle */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      productForm.isDeal
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-xs'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            productForm.isDeal
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          <Flame
                            className={`w-5 h-5 ${
                              productForm.isDeal ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            <span>
                              {isRtl ? 'عرض اليوم الحصري (Today’s Deal)' : "Today's Exclusive Deal"}
                            </span>
                            {productForm.isDeal && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                                {isRtl ? 'نشط في العروض 🔥' : 'Active Deal 🔥'}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isRtl
                              ? 'عند التفعيل، سيظهر هذا المنتج فوراً في شريط عروض اليوم على الصفحة الرئيسية وفي صفحة /deals'
                              : 'When enabled, this product appears immediately in Today’s Deals bar on the homepage and /deals'}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={productForm.isDeal}
                          onChange={(e) =>
                            setProductForm((prev) => ({ ...prev, isDeal: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Stock & SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold">{isRtl ? 'كود الصنف (SKU) *' : 'SKU *'}</label>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, sku: generateRandomSku() })}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>{isRtl ? 'توليد كود' : 'Regenerate'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'الباركود (Barcode / EAN)' : 'Barcode / EAN'}
                      </label>
                      <input
                        type="text"
                        value={productForm.barcode || ''}
                        onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                        placeholder="e.g. 0196801234567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'عدد الوحدات بالمخزون' : 'Stock Units'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stockCount}
                        onChange={(e) =>
                          setProductForm({ ...productForm, stockCount: Number(e.target.value) })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'تنبيه النواقص عند' : 'Low Stock Alert'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.lowStockThreshold}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            lowStockThreshold: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: SPECS ENGINE (QUICK SPECS + CATEGORY ATTRS + CUSTOM SPECS)         */}
              {/* ========================================================================= */}
              {modalTab === 'specs' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Quick Hardware Specs Bar */}
                  <div className="bg-gradient-to-br from-slate-950 to-blue-950/20 border border-blue-500/20 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                        <h3 className="text-xs font-black text-white">
                          {isRtl
                            ? '⚡ أسرع إدخال لمواصفات العتاد (Quick Hardware Presets)'
                            : '⚡ Quick Hardware Specifications Bar'}
                        </h3>
                      </div>
                      <span className="text-[11px] text-blue-300/80">
                        {isRtl ? 'اختر المواصفة بنقرة واحدة أو اكتبها يدوياً' : 'Click presets to fill instantly or type custom'}
                      </span>
                    </div>

                    {/* Auto-Sync Explanatory Banner for Non-Technical Users */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold">
                          {isRtl ? 'نظام المزامنة التلقائية مفعل (Auto-Sync ⚡)' : 'Auto-Sync Enabled ⚡'}
                        </span>
                        <span className="text-[11px] text-blue-300/80 hidden sm:inline">
                          {isRtl
                            ? '— أي مواصفة تختارها أو تكتبها هنا ستُسجل تلقائياً في فلاتر القسم، ولن تحتاج لإعادة كتابتها إطلاقاً.'
                            : '— Picking or typing specs here automatically populates category filters below without typing twice.'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md">
                        {isRtl ? 'تلقائي ومباشر' : 'Live Sync'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CPU / Processor */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isRtl ? 'المعالج (Processor / CPU)' : 'Processor (CPU)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quickSpecs.cpu}
                          onChange={(e) => handleUpdateQuickSpec('cpu', e.target.value)}
                          placeholder="e.g. Intel Core i7-13700H"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-1">
                          {['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'Xeon E5', 'Apple M2'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSetQuickSpec('cpu', preset)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                quickSpecs.cpu.includes(preset)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* RAM / Memory */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{isRtl ? 'الذاكرة العشوائية (RAM)' : 'Memory (RAM)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quickSpecs.ram}
                          onChange={(e) => handleUpdateQuickSpec('ram', e.target.value)}
                          placeholder="e.g. 32GB DDR5 4800MHz"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-1">
                          {['8GB DDR4', '16GB DDR4', '16GB DDR5', '32GB DDR5', '64GB DDR5', '128GB ECC'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSetQuickSpec('ram', preset)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                quickSpecs.ram.includes(preset)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Storage / SSD */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isRtl ? 'سعة التخزين (Storage / SSD)' : 'Storage (SSD)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quickSpecs.storage}
                          onChange={(e) => handleUpdateQuickSpec('storage', e.target.value)}
                          placeholder="e.g. 1TB NVMe PCIe 4.0 SSD"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-1">
                          {['256GB SSD', '512GB NVMe', '1TB NVMe Gen4', '2TB NVMe SSD', '4TB SSD'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSetQuickSpec('storage', preset)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                quickSpecs.storage.includes(preset)
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* GPU / Graphics */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isRtl ? 'كارت الشاشة (Graphics / GPU)' : 'Graphics (GPU)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quickSpecs.gpu}
                          onChange={(e) => handleUpdateQuickSpec('gpu', e.target.value)}
                          placeholder="e.g. NVIDIA GeForce RTX 4060 8GB"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-1">
                          {['Intel Iris Xe', 'RTX 3050 4GB', 'RTX 4060 8GB', 'RTX 4070 12GB', 'RTX 4080', 'NVIDIA Quadro'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSetQuickSpec('gpu', preset)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                quickSpecs.gpu.includes(preset)
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Display / Screen */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isRtl ? 'الشاشة والعرض (Display / Screen)' : 'Display / Screen'}</span>
                      </label>
                      <input
                        type="text"
                        value={quickSpecs.display}
                        onChange={(e) => handleUpdateQuickSpec('display', e.target.value)}
                        placeholder="e.g. 15.6 inch FHD 144Hz IPS Anti-Glare"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex flex-wrap gap-1">
                        {['14" FHD IPS', '15.6" FHD 144Hz', '15.6" OLED 4K', '16" QHD+ 165Hz', '27" 4K UHD'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSetQuickSpec('display', preset)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                              quickSpecs.display.includes(preset)
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category-bound Attributes (if any) */}
                  {categoryAttributes.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>
                          {isRtl
                            ? `مواصفات إضافية مخصصة لقسم (${productForm.categoryId})`
                            : `Assigned Category Attributes (/${productForm.categoryId})`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {categoryAttributes.length} {isRtl ? 'مواصفة معرفة' : 'attributes'}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryAttributes.map((ca) => {
                          const attr = ca.attribute;
                          const currentVal = productForm.attributeValues[attr.id] || '';

                          let selectOptions: string[] = [];
                          if (attr.type === 'select' && attr.options) {
                            if (Array.isArray(attr.options)) {
                              selectOptions = attr.options.map((s: any) => String(s).trim()).filter(Boolean);
                            } else if (typeof attr.options === 'string') {
                              try {
                                const p = JSON.parse(attr.options);
                                selectOptions = Array.isArray(p)
                                  ? p.map((s: any) => String(s).trim()).filter(Boolean)
                                  : [attr.options.trim()];
                              } catch {
                                selectOptions = attr.options
                                  .split(',')
                                  .map((s: string) => s.trim())
                                  .filter(Boolean);
                              }
                            }
                          }

                          const linkedField = getLinkedQuickSpecField(attr.slug, attr.name);

                          return (
                            <div key={ca.id} className="space-y-1">
                              <label className="block text-slate-300 font-bold text-xs flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>
                                    {isRtl ? attr.nameAr || attr.name : attr.name} {attr.unit ? `(${attr.unit})` : ''}
                                  </span>
                                  {linkedField && (
                                    <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                                      {isRtl ? 'متزامن تلقائياً' : 'Auto-synced'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  {attr.group?.name}
                                </span>
                              </label>

                              {attr.type === 'select' && selectOptions.length > 0 ? (
                                <select
                                  value={currentVal}
                                  onChange={(e) => handleUpdateCategoryAttribute(attr.id, attr.slug, attr.name, e.target.value)}
                                  className={`w-full bg-slate-900 border ${currentVal ? 'border-blue-500/50 bg-blue-950/20' : 'border-slate-800'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs`}
                                >
                                  <option value="">-- {isRtl ? 'اختر' : 'Select'} {attr.name} --</option>
                                  {currentVal && !selectOptions.includes(currentVal) && (
                                    <option value={currentVal}>{currentVal} ({isRtl ? 'محدد تلقائياً ⚡' : 'Auto ⚡'})</option>
                                  )}
                                  {selectOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={attr.type === 'number' ? 'number' : 'text'}
                                  value={currentVal}
                                  onChange={(e) => handleUpdateCategoryAttribute(attr.id, attr.slug, attr.name, e.target.value)}
                                  placeholder={`${isRtl ? 'أدخل' : 'Enter'} ${attr.name}...`}
                                  className={`w-full bg-slate-900 border ${currentVal ? 'border-blue-500/50 bg-blue-950/20' : 'border-slate-800'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* On-The-Fly Custom Specifications */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isRtl ? 'مواصفات إضافية خاصة (على الطاير)' : 'Custom Specifications (On the fly)'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isRtl
                            ? 'أضف أي مواصفة فريدة مثل: الضمان، نوع المنافذ، سعة البطارية، الوزن، اللون'
                            : 'Add any custom key/value spec: Warranty, Ports, Battery, Weight, Color'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCustomSpec}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-bold border border-blue-500/30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isRtl ? 'إضافة مواصفة جديدة' : 'Add Spec Row'}</span>
                      </button>
                    </div>

                    {customSpecs.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-2">
                        {isRtl
                          ? 'لم تتم إضافة مواصفات مخصصة بعد. انقر زر "إضافة مواصفة جديدة" لكتابة أي مواصفة إضافية.'
                          : 'No custom specifications added. Click "Add Spec Row" to add any extra specification.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customSpecs.map((cs, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cs.key}
                              onChange={(e) => handleUpdateCustomSpec(idx, 'key', e.target.value)}
                              placeholder={isRtl ? 'اسم المواصفة (مثال: الضمان)' : 'Spec Name (e.g. Warranty)'}
                              className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-slate-600 font-bold">:</span>
                            <input
                              type="text"
                              value={cs.value}
                              onChange={(e) => handleUpdateCustomSpec(idx, 'value', e.target.value)}
                              placeholder={isRtl ? 'القيمة (مثال: 3 سنوات شامل الدعم)' : 'Value (e.g. 3 Years Onsite)'}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSpec(idx)}
                              className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                              title={isRtl ? 'حذف هذا السطر' : 'Remove spec'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: DESCRIPTION & MEDIA (AI GENERATOR + PRESETS)                       */}
              {/* ========================================================================= */}
              {modalTab === 'description' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* AI Description Generator Banner */}
                  <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                          <Wand2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">
                            {isRtl ? '⚡ المساعد الذكي لتوليد الوصف التلقائي' : '⚡ Smart Description Generator'}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {isRtl
                              ? 'يجمع كل المواصفات المدخلة ويكتب وصفاً احترافياً مرتباً باللغتين العربية والإنجليزية فوراً'
                              : 'Compiles all entered specs into a professional, structured bilingual description'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoGenerateDescription}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{isRtl ? '⚡ توليد الوصف من المواصفات الآن' : '⚡ Generate Description from Specs'}</span>
                      </button>
                    </div>

                    {/* Quick Selling Highlight Templates */}
                    <div className="pt-2 border-t border-blue-500/10 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-300">
                        {isRtl ? 'إضافة ميزات متخصصة:' : 'Add Template Highlights:'}
                      </span>
                      {[
                        { id: 'gaming' as const, label: isRtl ? '🎮 ألعاب وجرافيك' : '🎮 Gaming Performance' },
                        { id: 'workstation' as const, label: isRtl ? '💼 ورك ستيشن ومحترفين' : '💼 Pro Workstation' },
                        { id: 'office' as const, label: isRtl ? '🖥️ مكتبي وإداري' : '🖥️ Office Productivity' },
                        { id: 'network' as const, label: isRtl ? '🌐 سيرفرات وشبكات' : '🌐 Server & Network' },
                      ].map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => applyDescriptionTemplate(tpl.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-blue-900/40 text-slate-300 hover:text-white border border-slate-800 text-[10px] font-bold transition-all"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Descriptions (Arabic & English) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span>{isRtl ? 'الوصف باللغة العربية (RTL)' : 'Arabic Description (RTL)'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {productForm.descriptionAr.length} {isRtl ? 'حرف' : 'chars'}
                        </span>
                      </label>
                      <textarea
                        rows={7}
                        dir="rtl"
                        value={productForm.descriptionAr}
                        onChange={(e) =>
                          setProductForm({ ...productForm, descriptionAr: e.target.value })
                        }
                        placeholder="اكتب الوصف أو انقر زر التوليد الذكي بالأعلى لتوليد مواصفات منسقة..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span>{isRtl ? 'الوصف باللغة الإنجليزية (LTR)' : 'English Description (LTR)'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {productForm.description.length} chars
                        </span>
                      </label>
                      <textarea
                        rows={7}
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                        placeholder="Write description or click Auto-Generate above to build instantly..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Media & Images Section */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>{isRtl ? 'صور المنتج والوسائط (Product Images)' : 'Product Media & Images'}</span>
                    </h4>

                    {/* Main Image URL + Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-3 space-y-2">
                        <label className="block text-slate-300 font-bold">
                          {isRtl ? 'رابط الصورة الرئيسية للمنتج (Cover URL) *' : 'Main Cover Image URL *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.thumbnail}
                          onChange={(e) =>
                            setProductForm({ ...productForm, thumbnail: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />

                        {/* 1-Click Hardware Cover Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {isRtl ? 'صور جاهزة بنقرة واحدة:' : '1-Click Presets:'}
                          </span>
                          {[
                            {
                              label: isRtl ? '💻 لابتوب' : '💻 Laptop',
                              url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              label: isRtl ? '🖥️ كمبيوتر' : '🖥️ PC',
                              url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              label: isRtl ? '🖲️ سيرفر' : '🖲️ Server',
                              url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              label: isRtl ? '🖥️ شاشة' : '🖥️ Monitor',
                              url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                            },
                            {
                              label: isRtl ? '🌐 شبكات' : '🌐 Network',
                              url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
                            },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setProductForm({ ...productForm, thumbnail: preset.url })}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white border border-slate-800 transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Thumbnail Preview */}
                      <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900 border border-slate-800 h-28">
                        {productForm.thumbnail ? (
                          <img
                            src={productForm.thumbnail}
                            alt="Cover Preview"
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        ) : (
                          <div className="text-slate-600 text-[10px] text-center">
                            {isRtl ? 'معاينة الصورة' : 'Preview'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Gallery URLs */}
                    <div className="pt-2">
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl
                          ? 'صور إضافية للمعرض (مفصولة بفاصلة)'
                          : 'Additional Gallery Images (Comma-separated URLs)'}
                      </label>
                      <input
                        type="text"
                        value={productForm.additionalImages}
                        onChange={(e) =>
                          setProductForm({ ...productForm, additionalImages: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: ADVANCED (VARIANTS & SEO)                                          */}
              {/* ========================================================================= */}
              {modalTab === 'advanced' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Variants Management */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {isRtl
                            ? `موديلات وفئات المنتج الإضافية (${productForm.variants.length})`
                            : `Configured Product Variants (${productForm.variants.length})`}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isRtl
                            ? 'أضف فئات متعددة إذا كان للمنتج خيارات رامات أو سعة تخزين مختلفة بأسعار مختلفة'
                            : 'Configure multiple RAM / Storage / Color tiers for this item'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setProductForm((prev) => ({
                            ...prev,
                            variants: [
                              ...prev.variants,
                              {
                                sku: `${prev.sku}-V${prev.variants.length + 1}`,
                                price: prev.price,
                                stockCount: 5,
                                options: { Tier: `Option ${prev.variants.length + 1}` },
                              },
                            ],
                          }))
                        }
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'إضافة فئة جديدة' : 'Add Variant'}</span>
                      </button>
                    </div>

                    {productForm.variants.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-3 text-center">
                        {isRtl
                          ? 'هذا منتج قياسي مستقل. انقر "إضافة فئة جديدة" إذا كان له فئات متعددة.'
                          : 'Standard standalone product. Click "Add Variant" if this product comes in multiple tiers.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {productForm.variants.map((v, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900 p-3 rounded-xl border border-slate-800 grid grid-cols-4 gap-3 items-center"
                          >
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                                Variant SKU
                              </label>
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => {
                                  const newV = [...productForm.variants];
                                  newV[idx].sku = e.target.value;
                                  setProductForm({ ...productForm, variants: newV });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                                Price (EGP)
                              </label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const newV = [...productForm.variants];
                                  newV[idx].price = Number(e.target.value);
                                  setProductForm({ ...productForm, variants: newV });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                                Stock Units
                              </label>
                              <input
                                type="number"
                                value={v.stockCount}
                                onChange={(e) => {
                                  const newV = [...productForm.variants];
                                  newV[idx].stockCount = Number(e.target.value);
                                  setProductForm({ ...productForm, variants: newV });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                              />
                            </div>

                            <div className="flex items-center justify-end pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newV = productForm.variants.filter((_, i) => i !== idx);
                                  setProductForm({ ...productForm, variants: newV });
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO Metadata */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white">
                      {isRtl ? 'تحسين محركات البحث (SEO Settings)' : 'Search Engine Optimization (SEO)'}
                    </h4>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={productForm.seoTitle}
                        onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                        placeholder="Title appearing in Google search results..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">SEO Meta Description</label>
                      <textarea
                        rows={3}
                        value={productForm.seoDescription}
                        onChange={(e) =>
                          setProductForm({ ...productForm, seoDescription: e.target.value })
                        }
                        placeholder="Snippet appearing in search engine results..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>

                <div className="flex items-center gap-3">
                  {modalTab !== 'details' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ProductModalTab[] = ['details', 'specs', 'description', 'advanced'];
                        const currentIdx = tabs.indexOf(modalTab);
                        if (currentIdx > 0) setModalTab(tabs[currentIdx - 1]);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                    >
                      {isRtl ? '← الخطوة السابقة' : '← Previous Step'}
                    </button>
                  )}

                  {modalTab !== 'advanced' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ProductModalTab[] = ['details', 'specs', 'description', 'advanced'];
                        const currentIdx = tabs.indexOf(modalTab);
                        if (currentIdx < tabs.length - 1) setModalTab(tabs[currentIdx + 1]);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-xs border border-slate-700/60 transition-colors"
                    >
                      {isRtl ? 'الخطوة التالية →' : 'Next Step →'}
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
                  >
                    {editingProduct
                      ? (isRtl ? 'حفظ التعديلات' : 'Save Changes')
                      : (isRtl ? 'إنشاء المنتج' : 'Create Product')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Category Assignment Modal */}
      {isBulkCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Move Selected Items to Category</h3>
            <select
              value={bulkTargetCategory}
              onChange={(e) => setBulkTargetCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkCategoryModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('changeCategory', bulkTargetCategory)}
                disabled={!bulkTargetCategory}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Batch CSV Hardware Import</span>
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSummary(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste CSV records below. Required header fields: <code className="text-blue-400 font-mono">name, brand, category, price, sku</code>. Optional: <code className="text-blue-400 font-mono">stock, description</code>.
            </p>

            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`name,brand,category,price,sku,stock\n"HP ProDesk 600 G6","HP","desktops",18500,"HC-HP-600",15`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />

            {importSummary && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">Validation Results:</div>
                <div className="text-emerald-400">
                  ✓ Valid rows: {importSummary.validCount}
                </div>
                {importSummary.invalidCount > 0 && (
                  <div className="text-red-400">
                    ✗ Invalid rows: {importSummary.invalidCount}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSummary(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleValidateImport}
                disabled={isImporting || !csvContent.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold disabled:opacity-50"
              >
                Validate Format
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isImporting || !csvContent.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
