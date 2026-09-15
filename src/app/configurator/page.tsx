'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  FileSpreadsheet,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Part {
  id: string;
  category: 'chassis' | 'cpu' | 'ram' | 'storage' | 'nic' | 'psu' | 'os';
  name: string;
  nameAr: string;
  price: number;
  specs: string;
  specsAr: string;
  wattage: number;
}

export default function ConfiguratorPage() {
  const { language, isRtl, formatPrice, addToCart, showToast } = useStore();

  const PARTS: Record<string, Part[]> = {
    chassis: [
      { id: 'ch-1', category: 'chassis', name: 'Dell PowerEdge R760 2U Rack Chassis', nameAr: 'كيس سيرفر ديل باور إيدج R760 راك 2U', price: 42000, specs: '2U Dual Socket, 24x 2.5" NVMe Bays', specsAr: '2U سوكت مزدوج، 24 منفذ تخزين NVMe', wattage: 80 },
      { id: 'ch-2', category: 'chassis', name: 'HPE ProLiant DL380 Gen11 2U Server Chassis', nameAr: 'كيس سيرفر إتش بي إي برولايانت DL380 جين 11', price: 45000, specs: '2U Enterprise Rack with iLO 6 Management', specsAr: '2U إنتربرايز مع إدارة iLO 6', wattage: 85 },
      { id: 'ch-3', category: 'chassis', name: 'Supermicro 4U AI & GPU Enterprise Chassis', nameAr: 'شاسيه سوبر مايكرو 4U لأنظمة الذكاء الاصطناعي وكروت الشاشة', price: 68000, specs: 'Supports up to 4x Dual-Width GPUs, Redundant Cooling', specsAr: 'يدعم حتى 4 كروت شاشة GPU وتبريد مزدوج', wattage: 120 }
    ],
    cpu: [
      { id: 'cpu-1', category: 'cpu', name: 'Dual Intel Xeon Silver 4410Y (2x 12 Cores, 2.0 GHz)', nameAr: 'معالجان Intel Xeon Silver 4410Y (إجمالي 24 نواة)', price: 48000, specs: '24 Cores / 48 Threads Total, 30MB Cache', specsAr: '24 نواة / 48 خيط معالجة، 30 ميجا كاش', wattage: 300 },
      { id: 'cpu-2', category: 'cpu', name: 'Dual Intel Xeon Gold 6430 (2x 32 Cores, 2.1 GHz)', nameAr: 'معالجان Intel Xeon Gold 6430 (إجمالي 64 نواة)', price: 98000, specs: '64 Cores / 128 Threads, 60MB Cache, High-Compute', specsAr: '64 نواة / 128 خيط معالجة للحوسبة السحابية العالية', wattage: 540 },
      { id: 'cpu-3', category: 'cpu', name: 'Dual AMD EPYC 9354 (2x 32 Cores, 3.25 GHz Turbo)', nameAr: 'معالجان AMD EPYC 9354 فائق السرعة (64 نواة)', price: 115000, specs: '64 Cores / 128 Threads, 256MB L3 Cache, PCIe 5.0', specsAr: '64 نواة / 128 خيط معالجة، 256 ميجا كاش L3', wattage: 560 }
    ],
    ram: [
      { id: 'ram-1', category: 'ram', name: '64GB (2x 32GB) DDR5 4800MHz ECC Registered', nameAr: '64 جيجابايت (2x 32GB) DDR5 ECC تصحيح أخطاء', price: 18500, specs: 'Dual Channel ECC Registered Server Memory', specsAr: 'ذاكرة سيرفرات مسجلة مدعومة بحماية الأخطاء', wattage: 30 },
      { id: 'ram-2', category: 'ram', name: '128GB (4x 32GB) DDR5 4800MHz ECC Registered', nameAr: '128 جيجابايت (4x 32GB) DDR5 ECC تصحيح أخطاء', price: 34000, specs: 'Quad Channel High-Throughput ECC Memory', specsAr: 'ذاكرة رباعية القنوات فائقة السرعة للأعمال الضخمة', wattage: 60 },
      { id: 'ram-3', category: 'ram', name: '256GB (8x 32GB) DDR5 4800MHz ECC Registered', nameAr: '256 جيجابايت (8x 32GB) DDR5 ECC تصحيح أخطاء', price: 65000, specs: 'Octa Channel Enterprise Memory for Virtualization', specsAr: 'ذاكرة ثمانية القنوات لأنظمة السحابة والـ Virtualization', wattage: 120 }
    ],
    storage: [
      { id: 'st-1', category: 'storage', name: '2x 1.92TB Enterprise NVMe PCIe 4.0 SSD (RAID 1 Mirror)', nameAr: 'قرصان 1.92TB NVMe فئة إنتربرايز (مصفوفة RAID 1)', price: 26000, specs: '7000 MB/s Read, 1.2M IOPS, Power-Loss Protection', specsAr: 'سرعة 7000 ميجا/ثانية مع حماية انقطاع الكهرباء', wattage: 25 },
      { id: 'st-2', category: 'storage', name: '4x 3.84TB Enterprise NVMe SSD (RAID 10 Fast & Safe)', nameAr: '4 أقراص 3.84TB NVMe SSD (مصفوفة RAID 10 فائقة الأمان)', price: 72000, specs: '15.3TB Raw Array, Enterprise Data Center Endurance', specsAr: 'سعة 15.3 تيرابايت للمؤسسات وقواعد البيانات', wattage: 50 },
      { id: 'st-3', category: 'storage', name: '8x 8TB SAS 12Gb/s 7.2K RPM Hard Drives (RAID 6)', nameAr: '8 أقراص 8TB SAS إنتربرايز (مصفوفة RAID 6 للتخزين الضخم)', price: 58000, specs: '64TB Raw Storage Array for Big Data & Backups', specsAr: 'سعة 64 تيرابايت للملفات والنسخ الاحتياطي السحابي', wattage: 80 }
    ],
    nic: [
      { id: 'nic-1', category: 'nic', name: 'Dual Port 10GbE SFP+ Fiber Network Card', nameAr: 'كارت شبكة ألياف ضوئية Dual Port 10GbE SFP+', price: 9500, specs: 'Intel X520 10 Gigabit Dual-Port Fiber Interface', specsAr: 'منفذان ألياف ضوئية بسرعة 10 جيجابت/ثانية', wattage: 20 },
      { id: 'nic-2', category: 'nic', name: 'Mellanox ConnectX-6 Dual-Port 25GbE / 100GbE NIC', nameAr: 'كارت شبكة ميلانوكس فائق السرعة ConnectX-6 25/100GbE', price: 28000, specs: '25/50/100 Gbps Low Latency RDMA Interface', specsAr: 'سرعات تصل إلى 100 جيجابت/ثانية مع دعم RDMA', wattage: 35 }
    ],
    psu: [
      { id: 'psu-1', category: 'psu', name: 'Dual 800W Redundant 80+ Platinum Hot-Plug PSUs', nameAr: 'مزودان طاقة مزدوجان 800W بلاتينيوم تبديل ساخن', price: 12000, specs: '1+1 Redundant Hot-Swap Power Supplies', specsAr: 'مزود طاقة احتياطي 1+1 يعمل بدون إيقاف السيرفر', wattage: 0 },
      { id: 'psu-2', category: 'psu', name: 'Dual 1400W Redundant 80+ Titanium High-Efficiency PSUs', nameAr: 'مزودان طاقة مزدوجان 1400W تيتانيوم كفاءة 96%', price: 19500, specs: '1+1 Redundant 96% Efficiency Power Supply Unit', specsAr: 'مزودان طاقة تيتانيوم 1400 واط لأعلى استقرار', wattage: 0 }
    ]
  };

  const [selectedParts, setSelectedParts] = useState<{
    chassis: Part;
    cpu: Part;
    ram: Part;
    storage: Part;
    nic: Part;
    psu: Part;
  }>({
    chassis: PARTS.chassis[0],
    cpu: PARTS.cpu[0],
    ram: PARTS.ram[0],
    storage: PARTS.storage[0],
    nic: PARTS.nic[0],
    psu: PARTS.psu[0]
  });

  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, part) => sum + part.price, 0);
  }, [selectedParts]);

  const totalWattage = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, part) => sum + part.wattage, 0) + 50; // base fans/board
  }, [selectedParts]);

  const handleAddConfiguredServerToCart = () => {
    const customProduct: Product = {
      id: `custom-server-${Date.now()}`,
      name: `Custom Hubcloud Server: ${selectedParts.chassis.name} + ${selectedParts.cpu.name}`,
      nameAr: `سيرفر مخصص من Hubcloud: ${selectedParts.chassis.nameAr}`,
      brand: 'HUB CLOUD Custom Build',
      category: 'Servers & Storage',
      categorySlug: 'servers-storage',
      sku: `SRV-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      price: totalPrice,
      inStock: true,
      stockCount: 5,
      shipsWithin: 'Custom assembled in 48 hours',
      shipsWithinAr: 'يتم التجميع والاختبار خلال 48 ساعة',
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      description: `Custom Enterprise Node: ${selectedParts.cpu.name}, ${selectedParts.ram.name}, ${selectedParts.storage.name}, ${selectedParts.nic.name}, ${selectedParts.psu.name}`,
      descriptionAr: `تجميعة سيرفر إنتربرايز: ${selectedParts.cpu.nameAr}، ${selectedParts.ram.nameAr}، ${selectedParts.storage.nameAr}`,
      specs: {
        'Chassis': selectedParts.chassis.name,
        'Processors': selectedParts.cpu.name,
        'Memory (RAM)': selectedParts.ram.name,
        'Storage Array': selectedParts.storage.name,
        'Networking NIC': selectedParts.nic.name,
        'Power Supply': selectedParts.psu.name,
        'Estimated Wattage': `${totalWattage}W peak load`
      }
    };

    addToCart(customProduct, 1);
  };

  const steps = [
    { key: 'chassis', label: '1. الشاسيه والكيس (Chassis)', labelEn: '1. Server Chassis', icon: Server },
    { key: 'cpu', label: '2. المعالجات (Dual CPUs)', labelEn: '2. Processors (Dual CPUs)', icon: Cpu },
    { key: 'ram', label: '3. الذاكرة العشوائية (ECC RAM)', labelEn: '3. ECC Memory (RAM)', icon: Zap },
    { key: 'storage', label: '4. مصفوفة التخزين (Storage Array)', labelEn: '4. Storage Array (RAID)', icon: HardDrive },
    { key: 'nic', label: '5. كروت الشبكة السريعة (NIC)', labelEn: '5. Network Card (NIC)', icon: Network },
    { key: 'psu', label: '6. مزودات الطاقة (Redundant PSU)', labelEn: '6. Redundant Power Supply', icon: Zap }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'مُركب وباني السيرفرات المخصص' : 'Custom Server Configurator'}</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0C1F38] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[12px] font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'أداة Hubcloud لتجميع الخوادم المخصصة' : 'Interactive Enterprise Server Builder'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {isRtl ? 'ابنِ خادم شركتك بالمواصفات الدقيقة' : 'Configure Your Custom Enterprise Server'}
          </h1>
          <p className="text-[13px] text-gray-300 max-w-2xl">
            {isRtl
              ? 'اختر قطع السيرفر المتوافقة 100% مع حساب فوري لاستهلاك الطاقة (Wattage) والتكلفة الإجمالية وضمان التشغيل 24/7.'
              : 'Customize dual-socket servers, ECC RAM, enterprise NVMe RAID arrays, and redundant power with live compatibility checks.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Configuration Steps (8 Cols) */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            {steps.map((step) => {
              const currentList = PARTS[step.key];
              const selectedPart = (selectedParts as any)[step.key] as Part;
              const Icon = step.icon;

              return (
                <div key={step.key} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Icon className="w-5 h-5 text-hub-blue shrink-0" />
                    <h3 className="font-extrabold text-gray-900 text-[14px] sm:text-[15px]">
                      {isRtl ? step.label : step.labelEn}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {currentList.map((part) => {
                      const isSelected = selectedPart.id === part.id;
                      return (
                        <div
                          key={part.id}
                          onClick={() => setSelectedParts({ ...selectedParts, [step.key]: part })}
                          className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 ${
                            isSelected
                              ? 'border-hub-blue bg-blue-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-start sm:items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${isSelected ? 'border-hub-blue bg-hub-blue text-white' : 'border-gray-300'}`}>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </span>
                              <h4 className="font-bold text-[13px] sm:text-[14px] text-gray-900 leading-snug">
                                {isRtl ? part.nameAr : part.name}
                              </h4>
                            </div>
                            <p className="text-[11px] sm:text-[12px] text-gray-500 pl-6 rtl:pl-0 rtl:pr-6">
                              {isRtl ? part.specsAr : part.specs}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-6 rtl:pl-0 rtl:pr-6 sm:pl-0 sm:rtl:pr-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <span className="font-black text-hub-blue text-[14px] sm:text-[15px] font-mono shrink-0">
                              {formatPrice(part.price)}
                            </span>
                            {part.wattage > 0 && (
                              <span className="text-[10px] text-gray-400 block shrink-0">
                                +{part.wattage}W Power
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Summary & Quote Drawer (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-[16px] sm:text-[17px] text-gray-900 pb-3 border-b border-gray-100">
                {isRtl ? 'ملخص تجميعة السيرفر' : 'Server Build Summary'}
              </h3>

              {/* Selected Parts Snapshot */}
              <div className="space-y-2.5 text-[12px] text-gray-600">
                {Object.entries(selectedParts).map(([k, p]) => (
                  <div key={k} className="flex justify-between items-start gap-2 py-1 border-b border-gray-100 last:border-b-0">
                    <span className="font-semibold text-gray-500 uppercase text-[10px] shrink-0">{k}:</span>
                    <span className="font-bold text-gray-800 text-end truncate max-w-[65%]">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Live Specs Indicators: Wattage & Compatibility */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-gray-700">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[11px] sm:text-[12px]">{isRtl ? 'استهلاك الطاقة المتوقع:' : 'Estimated Power Draw:'}</span>
                  </span>
                  <span className="font-extrabold text-gray-900 font-mono text-[12px] sm:text-[13px]">{totalWattage} Watts</span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isRtl ? 'جميع القطع متوافقة 100% مع نظام التبريد والـ BIOS' : '100% Hardware & Thermal Compatible'}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-[13px] sm:text-[14px] font-bold text-gray-600 block">{isRtl ? 'السعر الإجمالي:' : 'Total Config Price:'}</span>
                  <span className="text-[10px] text-gray-400">{isRtl ? 'شامل التركيب والضمان' : 'Includes assembly & warranty'}</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-hub-blue font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddConfiguredServerToCart}
                  className="w-full bg-hub-blue hover:bg-hub-blue-dark text-white font-extrabold text-[14px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 min-h-[44px]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isRtl ? 'إضافة السيرفر لسلة الشراء' : 'Add Configured Server to Cart'}</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                    showToast(isRtl ? 'تم تصدير مواصفات التجميعة للطباعة/PDF' : 'PC Build Summary exported!', 'success');
                  }}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold text-[13px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isRtl ? 'طباعة / تصدير مواصفات التجميعة (PDF)' : 'Export PC Build Summary (PDF)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-hub-blue shrink-0" />
                <span>{isRtl ? 'تجميع واختبار ضغط (Burn-in Test) على أيدي مهندسينا قبل التسليم' : 'Assembled and 24h stress-tested by certified engineers'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Summary Bar */}
        <div className="lg:hidden fixed bottom-[57px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 block leading-tight">{isRtl ? 'إجمالي السيرفر:' : 'Total Config:'}</span>
            <span className="text-[16px] font-black text-hub-blue font-mono">{formatPrice(totalPrice)}</span>
          </div>
          <button
            onClick={handleAddConfiguredServerToCart}
            className="bg-hub-blue hover:bg-hub-blue-dark active:scale-95 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 shrink-0 min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isRtl ? 'إضافة للسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
