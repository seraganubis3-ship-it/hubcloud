'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ChevronRight,
  Lock,
  CreditCard,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Copy,
  Check,
  Banknote
} from 'lucide-react';
import { EGYPT_GOVERNORATES } from '@/lib/egypt-locations';
import { SavedAddress } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    language,
    isRtl,
    formatPrice,
    cart,
    cartCount,
    subtotal,
    shipping,
    vat,
    discount,
    total,
    clearCart,
    showToast,
    currentUser,
    savedAddresses,
    createOrder
  } = useStore();

  const [formData, setFormData] = useState({
    firstName: currentUser ? currentUser.name.split(' ')[0] : '',
    lastName: currentUser ? currentUser.name.split(' ').slice(1).join(' ') || '' : '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    postalCode: '',
    paymentMethod: 'instapay',
    notes: ''
  });

  // Comprehensive Egyptian Address State
  const [selectedGovId, setSelectedGovId] = useState<string>('cairo');
  const [selectedCity, setSelectedCity] = useState<string>('مدينة نصر');
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [customCity, setCustomCity] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [buildingDetails, setBuildingDetails] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');

  const [paymentReference, setPaymentReference] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [storePaymentConfig, setStorePaymentConfig] = useState({
    instapayIpa: 'hubcloud@instapay',
    instapayPhone: '01019569891',
    vodafoneCashWallet: '01019569891',
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStorePaymentConfig({
            instapayIpa: data.settings.instapayIpa || 'hubcloud@instapay',
            instapayPhone: data.settings.instapayPhone || '01019569891',
            vodafoneCashWallet: data.settings.vodafoneCashWallet || '01019569891',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      showToast(isRtl ? 'تم نسخ البيانات بنجاح' : 'Copied to clipboard', 'info');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.warn('Clipboard error:', e);
    }
  };

  // Pre-fill from saved addresses or first address if present
  React.useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      const first = savedAddresses[0];
      const foundGov = EGYPT_GOVERNORATES.find(g =>
        first.city.includes(g.nameAr) || first.city.toLowerCase().includes(g.nameEn.toLowerCase())
      );
      if (foundGov) {
        setSelectedGovId(foundGov.id);
        const foundCity = foundGov.cities.find(c => first.city.includes(c.nameAr));
        if (foundCity) {
          setSelectedCity(foundCity.nameAr);
          setIsCustomCity(false);
        } else {
          setIsCustomCity(true);
          setCustomCity(first.city.replace(`${foundGov.nameAr} - `, '').trim());
        }
      } else if (first.city) {
        setIsCustomCity(true);
        setCustomCity(first.city);
      }
      if (first.addressDetails) {
        setStreetAddress(first.addressDetails);
      }
    }
  }, [savedAddresses]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    const foundGov = EGYPT_GOVERNORATES.find(g =>
      addr.city.includes(g.nameAr) || addr.city.toLowerCase().includes(g.nameEn.toLowerCase())
    );
    if (foundGov) {
      setSelectedGovId(foundGov.id);
      const foundCity = foundGov.cities.find(c => addr.city.includes(c.nameAr));
      if (foundCity) {
        setSelectedCity(foundCity.nameAr);
        setIsCustomCity(false);
      } else {
        setIsCustomCity(true);
        setCustomCity(addr.city.replace(`${foundGov.nameAr} - `, '').trim());
      }
    } else if (addr.city) {
      setIsCustomCity(true);
      setCustomCity(addr.city);
    }
    if (addr.addressDetails) {
      setStreetAddress(addr.addressDetails);
    }
    showToast(isRtl ? `تم تطبيق العنوان: ${addr.title}` : `Applied address: ${addr.title}`, 'info');
  };

  const handleGovChange = (govId: string) => {
    setSelectedGovId(govId);
    const gov = EGYPT_GOVERNORATES.find(g => g.id === govId);
    if (gov && gov.cities.length > 0) {
      setSelectedCity(gov.cities[0].nameAr);
      setIsCustomCity(false);
      setCustomCity('');
    } else {
      setIsCustomCity(true);
      setCustomCity('');
    }
  };

  const currentGov = EGYPT_GOVERNORATES.find(g => g.id === selectedGovId) || EGYPT_GOVERNORATES[0];
  const finalCityName = isCustomCity ? customCity.trim() : selectedCity;
  const fullDestinationCity = `${currentGov.nameAr} - ${finalCityName}`;
  const fullAddressDetails = [
    streetAddress.trim(),
    buildingDetails.trim() ? buildingDetails.trim() : '',
    landmark.trim() ? `(علامة مميزة: ${landmark.trim()})` : '',
  ].filter(Boolean).join('، ');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validations with clear localized Arabic messages
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast(isRtl ? 'يرجى كتابة الاسم الأول واسم العائلة بالكامل' : 'Please enter your full name', 'error');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || !/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      showToast(isRtl ? 'يرجى إدخال رقم هاتف محمول مصري صحيح (11 رقم يبدأ بـ 01)' : 'Please enter a valid 11-digit Egyptian mobile number', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!finalCityName) {
      showToast(isRtl ? 'يرجى تحديد أو كتابة اسم المدينة أو المركز أو الحي' : 'Please specify your city or district', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 3) {
      showToast(isRtl ? 'يرجى كتابة اسم الشارع أو تفاصيل العنوان (3 أحرف على الأقل)' : 'Please enter your street address details', 'error');
      setIsSubmitting(false);
      return;
    }

    const finalNotes = [
      formData.notes,
      paymentReference ? `[Payment Ref / Wallet: ${paymentReference}]` : '',
    ].filter(Boolean).join(' | ');

    const computedPaymentStatus = formData.paymentMethod === 'cod' ? 'cash_on_delivery' : 'pending';

    try {
      let serverOrderId: string | undefined;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email,
          customerPhone: cleanPhone,
          city: fullDestinationCity,
          address: fullAddressDetails,
          postalCode: formData.postalCode,
          paymentMethod: formData.paymentMethod,
          paymentStatus: computedPaymentStatus,
          notes: finalNotes,
          subtotal,
          shipping,
          vat,
          discount,
          total,
          items: cart.map(item => ({
            productId: item.product.id,
            variantId: item.selectedVariantId,
            productName: item.product.name,
            productNameAr: item.product.nameAr,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedOptions: {
              ...(item.selectedOptions || {}),
              ...(item.selectedRam ? { ram: item.selectedRam } : {}),
              ...(item.selectedStorage ? { storage: item.selectedStorage } : {}),
              ...(item.selectedWarranty ? { warranty: item.selectedWarranty } : {}),
            },
          }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isRtl ? 'فشل تأكيد الطلب من الخادم' : 'Failed to place order.'));
      }
      serverOrderId = data.order?.id;

      // Sync into StoreContext & LocalStorage
      const created = createOrder({
        id: serverOrderId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: cleanPhone,
        shippingAddress: fullAddressDetails,
        city: fullDestinationCity,
        items: [...cart],
        subtotal,
        shipping,
        vat,
        discount,
        total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: computedPaymentStatus,
        orderStatus: 'processing'
      });

      clearCart();
      showToast(isRtl ? 'تم تأكيد طلبك بنجاح!' : 'Order placed and saved successfully!', 'success');
      router.push(`/order-success/${created.id}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || (isRtl ? 'حدث خطأ أثناء معالجة الطلب' : 'Error processing order'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{isRtl ? 'سلة المشتريات فارغة' : 'No items in cart to checkout'}</h2>
        <Link href="/products" className="inline-block bg-hub-blue text-white px-6 py-2.5 rounded-xl font-bold">
          {isRtl ? 'تصفح المنتجات' : 'Browse Products'}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <Link href="/cart" className="hover:text-hub-blue">{isRtl ? 'السلة' : 'Cart'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'إتمام الطلب' : 'Checkout'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {isRtl ? 'إتمام وتأكيد الطلب' : 'Checkout & Order Confirmation'}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Form: Customer Details, Delivery Address & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-hub-blue text-white font-bold text-[12px] flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-gray-900 text-[16px]">
                  {isRtl ? 'بيانات العميل' : 'Customer Information'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'الاسم الأول' : 'First Name'} *</label>
                  <input
                    type="text"
                    id="firstName"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'اسم العائلة' : 'Last Name'} *</label>
                  <input
                    type="text"
                    id="lastName"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'} *</label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'رقم الموبايل' : 'Phone Number (Egypt)'} *</label>
                  <input
                    type="tel"
                    id="phone"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-hub-blue text-white font-bold text-[12px] flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[16px]">
                    {isRtl ? 'عنوان وبيانات التوصيل والشحن' : 'Shipping & Delivery Destination'}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    {isRtl ? 'تغطية توصيل سريعة لجميع محافظات ومراكز وقرى جمهورية مصر العربية' : 'Fast, tracked delivery across all 27 Egyptian governorates'}
                  </p>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    {isRtl ? 'اختر بسرعة من عناوينك المحفوظة مسبقاً:' : 'Quickly select from your saved addresses:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-100/80 border border-blue-200 rounded-lg text-blue-800 transition-colors min-h-[40px] flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-hub-blue" />
                        <span>{addr.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Governorate (27 Governorates) */}
                <div>
                  <label htmlFor="governorate" className="text-[12px] font-bold text-gray-700 block mb-1">
                    {isRtl ? 'المحافظة' : 'Governorate'} *
                  </label>
                  <select
                    id="governorate"
                    value={selectedGovId}
                    onChange={(e) => handleGovChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue bg-white font-medium"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {isRtl ? `${gov.nameAr} (${gov.nameEn})` : `${gov.nameEn} (${gov.nameAr})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. City / Markaz / District */}
                <div>
                  <label htmlFor="cityDistrict" className="text-[12px] font-bold text-gray-700 block mb-1">
                    {isRtl ? 'المدينة / المركز / الحي' : 'City / Center / District'} *
                  </label>
                  {!isCustomCity ? (
                    <select
                      id="cityDistrict"
                      value={selectedCity}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCity(true);
                          setCustomCity('');
                        } else {
                          setSelectedCity(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue bg-white font-medium"
                    >
                      {currentGov.cities.map((c) => (
                        <option key={c.nameAr} value={c.nameAr}>
                          {isRtl ? c.nameAr : c.nameEn}
                        </option>
                      ))}
                      <option value="__custom__">
                        {isRtl ? '➕ منطقة أو مركز آخر (كتابة يدوية)...' : '➕ Other City / Area (Enter manually)...'}
                      </option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        id="customCity"
                        required
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder={isRtl ? 'اكتب اسم المركز أو القرية أو الحي (مثال: تلا، شنتنا الحجر)' : 'Enter city, markaz, or village name'}
                        className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCity(false);
                          if (currentGov.cities.length > 0) {
                            setSelectedCity(currentGov.cities[0].nameAr);
                          }
                        }}
                        className="text-[11px] font-bold text-hub-blue hover:underline block"
                      >
                        {isRtl ? '↩ العودة لقائمة المناطق الشائعة' : '↩ Back to list'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Detailed Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="streetAddress" className="text-[12px] font-bold text-gray-700 block mb-1">
                    {isRtl ? 'اسم الشارع والمنطقة بالتفصيل' : 'Street Name & Detailed Area'} *
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder={isRtl ? 'مثال: شارع البحر، بجوار المحطة، حي الزهور' : 'e.g. 15 El Gomhoreya St, Station area'}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>

                {/* 4. Building / Floor / Apartment */}
                <div>
                  <label htmlFor="buildingDetails" className="text-[12px] font-bold text-gray-700 block mb-1">
                    {isRtl ? 'تفاصيل المبنى (العمارة / الدور / الشقة)' : 'Building, Floor & Flat'}
                    <span className="text-gray-400 font-normal mr-1">({isRtl ? 'اختياري' : 'Optional'})</span>
                  </label>
                  <input
                    type="text"
                    id="buildingDetails"
                    value={buildingDetails}
                    onChange={(e) => setBuildingDetails(e.target.value)}
                    placeholder={isRtl ? 'مثال: عمارة 4، الدور الثالث، شقة 12' : 'e.g. Bldg 4, 3rd Floor, Apt 12'}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>

                {/* 5. Landmark */}
                <div>
                  <label htmlFor="landmark" className="text-[12px] font-bold text-gray-700 block mb-1">
                    {isRtl ? 'علامة مميزة لتسهيل وصول المندوب' : 'Landmark (Helpful for Courier)'}
                    <span className="text-gray-400 font-normal mr-1">({isRtl ? 'اختياري' : 'Optional'})</span>
                  </label>
                  <input
                    type="text"
                    id="landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={isRtl ? 'مثال: بجوار صيدلية العزبي، أمام مسجد النور...' : 'e.g. Next to pharmacy or opposite mosque'}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>
              </div>

              {/* Real-time Address Preview Box */}
              {(streetAddress.trim().length > 0 || isCustomCity) && (
                <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5 text-[12px] flex items-start gap-2.5 text-blue-950 mt-2 shadow-xs">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wide">
                      {isRtl ? 'العنوان الذي سيظهر لبوليصة الشحن ومندوب التوصيل:' : 'Formatted Shipping Destination:'}
                    </span>
                    <p className="text-blue-900 leading-relaxed font-semibold text-[13px]">
                      {fullDestinationCity}، {fullAddressDetails || (isRtl ? 'في انتظار تفاصيل الشارع...' : 'Waiting for street details...')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Methods */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-hub-blue text-white font-bold text-[12px] flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[16px]">
                    {isRtl ? 'طريقة الدفع' : 'Payment Method'}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    {isRtl ? 'اختر الدفع عبر إنستاباي أو فودافون كاش أو الدفع عند الاستلام' : 'Pay securely via Vodafone Cash, InstaPay, or COD'}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Option 1: InstaPay */}
                <div className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'instapay' ? 'border-hub-blue bg-blue-50/20 ring-1 ring-hub-blue/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'instapay'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'instapay' })}
                        className="text-hub-blue focus:ring-hub-blue w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[14px] sm:text-[15px] text-gray-900 block">
                            {isRtl ? 'إنستاباي (InstaPay)' : 'InstaPay Instant Transfer'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            0% عمولة
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-[12px] text-gray-500 block mt-0.5">
                          {isRtl ? 'تحويل فوري عبر تطبيق إنستاباي' : 'Instant 0% fee bank-to-bank transfer via InstaPay IPA'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs h-10 sm:h-11 w-24 sm:w-28 flex items-center justify-center shrink-0 self-end sm:self-auto relative">
                      <Image src="/images/payments/instapay.png" alt="InstaPay" width={100} height={36} className="h-full w-auto object-contain" />
                    </div>
                  </label>

                  {formData.paymentMethod === 'instapay' && (
                    <div className="mt-3.5 pt-3.5 border-t border-blue-100 text-[12px] space-y-3">
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-blue-200/80 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-gray-600 font-medium text-[11px] sm:text-[12px]">
                            {isRtl ? 'معرف إنستاباي (IPA):' : 'InstaPay IPA Address:'}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-hub-blue text-[12px] sm:text-[13px] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 break-all">
                            <span>{storePaymentConfig.instapayIpa}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(storePaymentConfig.instapayIpa, 'ipa')}
                              className="p-1 hover:bg-blue-100 rounded text-gray-500 hover:text-hub-blue transition-colors cursor-pointer shrink-0"
                              title="Copy"
                            >
                              {copiedField === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100">
                          <span className="text-gray-600 font-medium text-[11px] sm:text-[12px]">
                            {isRtl ? 'أو رقم الموبايل المسجل:' : 'Or Registered Phone:'}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-gray-800 text-[12px] sm:text-[13px] bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                            <span dir="ltr">{storePaymentConfig.instapayPhone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(storePaymentConfig.instapayPhone, 'phone')}
                              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-hub-blue transition-colors cursor-pointer shrink-0"
                              title="Copy"
                            >
                              {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'اسم المحول أو الرقم المرجعي للعملية (اختياري):' : 'Sender Account Name / Reference No (Optional):'}
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder={isRtl ? 'مثال: أحمد محمود - عملية 982143' : 'e.g. Ahmed Mahmoud - Ref #982143'}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-[12px] text-gray-900 focus:outline-none focus:border-hub-blue"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Vodafone Cash */}
                <div className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'vodafone_cash' ? 'border-hub-blue bg-blue-50/20 ring-1 ring-hub-blue/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'vodafone_cash'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'vodafone_cash' })}
                        className="text-hub-blue focus:ring-hub-blue w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[14px] sm:text-[15px] text-gray-900 block">
                            {isRtl ? 'فودافون كاش (Vodafone Cash)' : 'Vodafone Cash Wallet'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            محفظة إلكترونية
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-[12px] text-gray-500 block mt-0.5">
                          {isRtl ? 'تحويل مباشر لمحفظتنا الإلكترونية' : 'Direct mobile wallet transfer'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-2xs h-10 sm:h-11 w-24 sm:w-28 flex items-center justify-center shrink-0 self-end sm:self-auto relative">
                      <Image src="/images/payments/vodafone-cash.png" alt="Vodafone Cash" width={100} height={36} className="h-full w-auto object-contain" />
                    </div>
                  </label>

                  {formData.paymentMethod === 'vodafone_cash' && (
                    <div className="mt-3.5 pt-3.5 border-t border-blue-100 text-[12px] space-y-3">
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-red-200/80 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-gray-600 font-medium text-[11px] sm:text-[12px]">
                            {isRtl ? 'رقم محفظة فودافون كاش:' : 'Vodafone Cash Wallet Number:'}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-[#E60000] text-[13px] sm:text-[14px] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                            <span dir="ltr">{storePaymentConfig.vodafoneCashWallet}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(storePaymentConfig.vodafoneCashWallet, 'vf')}
                              className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                              title="Copy"
                            >
                              {copiedField === 'vf' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {isRtl
                            ? 'حول المبلغ لرقم المحفظة الموضح أعلاه، واكتب رقم محفظتك بالأسفل للتأكيد.'
                            : 'Transfer the order amount to the wallet number above, then enter your wallet phone number below.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'رقم المحفظة التي قمت بالتحويل منها:' : 'Sender Wallet Phone Number:'}
                        </label>
                        <input
                          type="tel"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder={isRtl ? 'مثال: 010xxxxxxxx' : 'e.g. 010xxxxxxxx'}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-[12px] text-gray-900 focus:outline-none focus:border-hub-blue font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Cash on Delivery */}
                <div className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'cod' ? 'border-hub-blue bg-blue-50/20 ring-1 ring-hub-blue/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="text-hub-blue focus:ring-hub-blue w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[14px] sm:text-[15px] text-gray-900 block">
                          {isRtl ? 'الدفع عند الاستلام (Cash on Delivery)' : 'Cash on Delivery (COD)'}
                        </span>
                        <span className="text-[11px] sm:text-[12px] text-gray-500 block mt-0.5">
                          {isRtl ? 'ادفع نقداً لمندوب الشحن عند استلام وفحص الأجهزة' : 'Pay in cash upon inspection and delivery'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-xl text-gray-700 text-[11px] font-extrabold flex items-center gap-1.5 shrink-0 border border-gray-200 self-end sm:self-auto">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>COD</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-[16px] sm:text-[17px] text-gray-900 pb-3 border-b border-gray-100">
                {isRtl ? `محتويات الطلب (${cartCount} منتجات)` : `Order Items (${cartCount})`}
              </h3>

              {/* Mini Item List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 p-1 flex-shrink-0 relative">
                        <Image src={item.product.thumbnail || item.product.images[0]} alt={item.product.name} fill className="object-contain" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-gray-900 block truncate">{item.product.name}</span>
                        <span className="text-[11px] text-gray-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 flex-shrink-0 font-mono">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-[13px] text-gray-600">
                <div className="flex justify-between">
                  <span>{isRtl ? 'المجموع:' : 'Subtotal:'}</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRtl ? 'الشحن:' : 'Shipping:'}</span>
                  <span className="font-bold text-gray-900">{formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{isRtl ? 'الخصم:' : 'Discount:'}</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-black text-gray-900 text-[15px] sm:text-[16px]">{isRtl ? 'الإجمالي:' : 'Total Amount:'}</span>
                  <span className="text-xl sm:text-2xl font-black text-hub-blue">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-hub-blue hover:bg-hub-blue-dark disabled:bg-blue-300 text-white font-extrabold text-[14px] sm:text-[15px] py-3.5 sm:py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? (isRtl ? 'جاري تأكيد الطلب...' : 'Processing Order...') : (isRtl ? 'تأكيد الطلب الآن' : 'Place Order & Get Invoice')}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isRtl ? 'دفع آمن ومشفر 100%' : 'Encrypted & Secure 256-bit SSL Checkout'}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
