'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Mail,
  Server,
  ShieldCheck,
  Send,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Settings,
  Lock,
  User,
  Hash,
  Globe,
  Bell,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { renderOrderConfirmationHtml, renderOrderStatusUpdateHtml } from '@/lib/email-templates';

export default function AdminEmailSettingsPage() {
  const { showToast, isRtl } = useStore();

  // SMTP Settings State
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [fromName, setFromName] = useState('HUB CLOUD IT Solutions');
  const [fromEmail, setFromEmail] = useState('sales@hubcloud.info');
  const [adminNotifyEmail, setAdminNotifyEmail] = useState('sales@hubcloud.info');
  const [orderEmailsEnabled, setOrderEmailsEnabled] = useState(true);
  const [adminAlertsEnabled, setAdminAlertsEnabled] = useState(true);

  // Status & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Template Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'confirmation' | 'status'>('confirmation');

  // Load Settings & Logs on mount
  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/email/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setHost(s.host || '');
        setPort(s.port || 587);
        setSecure(Boolean(s.secure));
        setUser(s.user || '');
        setFromName(s.fromName || 'HUB CLOUD IT Solutions');
        setFromEmail(s.fromEmail || '');
        setAdminNotifyEmail(s.adminNotifyEmail || '');
        setOrderEmailsEnabled(s.orderEmailsEnabled !== false);
        setAdminAlertsEnabled(s.adminAlertsEnabled !== false);
        setHasExistingPassword(Boolean(s.hasPassword));
        if (s.pass) setPass(s.pass);
      }
    } catch (e) {
      console.error('Failed to load email settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/admin/email/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load email logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Preset Configurations
  const applyPreset = (preset: 'gmail' | 'outlook' | 'cpanel') => {
    if (preset === 'gmail') {
      setHost('smtp.gmail.com');
      setPort(465);
      setSecure(true);
      showToast(isRtl ? 'تم تطبيق إعدادات Gmail (ملاحظة: يتطلب App Password)' : 'Gmail preset applied (requires App Password)', 'info');
    } else if (preset === 'outlook') {
      setHost('smtp.office365.com');
      setPort(587);
      setSecure(false);
      showToast(isRtl ? 'تم تطبيق إعدادات Microsoft 365 / Outlook' : 'Outlook preset applied', 'info');
    } else if (preset === 'cpanel') {
      setHost('mail.hubcloud.info');
      setPort(465);
      setSecure(true);
      showToast(isRtl ? 'تم تطبيق إعدادات البريد الخاص بالنطاق cPanel/Webmail' : 'cPanel webmail preset applied', 'info');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        host,
        port: Number(port),
        secure,
        user,
        pass,
        fromName,
        fromEmail: fromEmail || user,
        adminNotifyEmail: adminNotifyEmail || user,
        orderEmailsEnabled,
        adminAlertsEnabled,
      };

      const res = await fetch('/api/admin/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isRtl ? 'تم حفظ إعدادات الـ SMTP بنجاح' : 'SMTP settings saved successfully', 'success');
        setHasExistingPassword(Boolean(data.settings.hasPassword));
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (e) {
      showToast('Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showToast(isRtl ? 'يرجى كتابة عنوان بريد إلكتروني صالح للتجربة' : 'Please enter a valid email address', 'error');
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);

      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: testEmail,
          customConfig: {
            host,
            port: Number(port),
            secure,
            user,
            pass,
            fromName,
            fromEmail: fromEmail || user,
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        showToast(isRtl ? 'تم إرسال البريد التجريبي بنجاح!' : 'Test email sent successfully!', 'success');
        fetchLogs();
      } else {
        showToast(data.message || 'فشل إرسال البريد التجريبي', 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'حدث خطأ في الاتصال' });
      showToast('Connection test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Mock Order for HTML Preview
  const mockOrder = {
    id: 'HC-849201',
    createdAt: new Date().toISOString(),
    customerName: 'أحمد محمود',
    customerEmail: 'customer@example.com',
    customerPhone: '+20 010 1234 5678',
    city: 'الجيزة',
    address: 'شارع جامعة الدول العربية - المهندسين',
    paymentMethod: 'instapay',
    paymentStatus: 'pending',
    subtotal: 38500,
    vat: 5390,
    shipping: 0,
    discount: 0,
    total: 43890,
    notes: 'يرجى الاتصال قبل الوصول بنصف ساعة',
    items: [
      {
        productName: 'Dell Precision 3660 Workstation',
        productNameAr: 'محطة عمل ديل بريسيجن Dell Precision 3660',
        quantity: 1,
        unitPrice: 38500,
        totalPrice: 38500,
        selectedRam: '32GB DDR5',
        selectedStorage: '1TB NVMe SSD',
        selectedWarranty: 'ضمان 3 سنوات ضد عيوب الصناعة',
      },
    ],
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'إدارة البريد الإلكتروني وخادم الـ SMTP' : 'Email Management & SMTP Gateway'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'تكوين خادم الـ SMTP لإرسال فواتير وتأكيدات الشراء للعملاء فورياً وإشعارات المبيعات الجديدة للإدارة.'
              : 'Configure SMTP credentials to automatically send order confirmation receipts to buyers and sales alerts to admins.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>{isRtl ? 'معاينة شكل الإيميل' : 'Preview Order Receipt'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isRtl ? 'حفظ إعدادات الـ SMTP' : 'Save SMTP Settings'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">{isRtl ? 'جاري تحميل إعدادات البريد...' : 'Loading email settings...'}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main SMTP Config Form - 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Card 1: Server Configuration */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-400 shrink-0" />
                    <h3 className="font-bold text-white text-sm">
                      {isRtl ? 'بيانات اتصال خادم البريد (SMTP Server)' : 'SMTP Connection Credentials'}
                    </h3>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{isRtl ? 'إعداد سريع:' : 'Presets:'}</span>
                    <button
                      type="button"
                      onClick={() => applyPreset('gmail')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors"
                    >
                      Gmail
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('outlook')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors"
                    >
                      Outlook
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('cpanel')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors"
                    >
                      cPanel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Host */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'عنوان الخادم (SMTP Host)' : 'SMTP Host'}
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        required
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="smtp.gmail.com أو mail.hubcloud.info"
                        className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Port */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'المنفذ (SMTP Port)' : 'SMTP Port'}
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 rtl:right-3 rtl:left-auto" />
                      <input
                        type="number"
                        required
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        placeholder="587 أو 465"
                        className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'اسم المستخدم / البريد (SMTP User)' : 'Username / Sender Email'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        required
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        placeholder="sales@hubcloud.info"
                        className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'كلمة المرور (SMTP Password / App Password)' : 'Password / App Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 rtl:right-3 rtl:left-auto" />
                      <input
                        type="password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        placeholder={hasExistingPassword ? '•••••••• (محفوظة مسبقاً)' : 'أدخل كلمة المرور'}
                        className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {hasExistingPassword && (
                      <span className="text-[10px] text-emerald-400 mt-1 block">
                        {isRtl ? '✓ كلمة المرور محفوظة ومحمية' : '✓ Password saved and encrypted'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Secure SSL Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isRtl ? 'تشفير SSL/TLS المباشر (Secure)' : 'Direct SSL/TLS Encryption'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isRtl ? 'قم بتفعيله للمنفذ 465، أو اتركه معطلاً للمنفذ 587 (STARTTLS).' : 'Enable for port 465 (SSL), disable for port 587 (STARTTLS).'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSecure(!secure)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      secure ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        secure ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 2: Sender & Routing Identity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="font-bold text-white text-sm">
                    {isRtl ? 'هوية المرسل وتوجيه الإشعارات' : 'Sender Identity & Notification Routing'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'اسم المرسل (From Name)' : 'Sender Display Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="HUB CLOUD IT Solutions"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'بريد المرسل (From Email)' : 'From Email Address'}
                    </label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="sales@hubcloud.info"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isRtl ? 'بريد استلام تنبيهات الطلبات الجديدة للإدارة (يمكنك إضافة أكثر من بريد)' : 'Admin New Orders Alert Recipients (Multiple allowed)'}
                    </label>
                    <input
                      type="text"
                      value={adminNotifyEmail}
                      onChange={(e) => setAdminNotifyEmail(e.target.value)}
                      placeholder="sales@hubcloud.info, manager@hubcloud.info, dispatch@hubcloud.info"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {isRtl
                        ? 'يمكنك كتابة أكثر من عنوان بريد إلكتروني مفصولين بفاصلة (,) وسيتم إشعار جميع العناوين فوراً عند وصول أي طلب جديد'
                        : 'Enter multiple email addresses separated by commas (,). All will receive the new order alert simultaneously'}
                    </span>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isRtl ? 'إرسال تأكيد الطلب للعميل تلقائياً' : 'Auto-send Customer Order Confirmation'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isRtl ? 'إرسال بريد بتفاصيل الأوردر والفاتورة للعميل بعد إتمام الشراء فوراً' : 'Dispatches branded receipt to the customer upon checkout'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderEmailsEnabled(!orderEmailsEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        orderEmailsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          orderEmailsEnabled ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isRtl ? 'إرسال تنبيه طلب جديد للمبيعات والإدارة' : 'Auto-send Admin Order Alerts'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isRtl ? 'إشعار فريق العمل بالطلبات الجديدة لتجهيز الشحنة والتواصل' : 'Alerts operations & dispatch team immediately'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminAlertsEnabled(!adminAlertsEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        adminAlertsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          adminAlertsEnabled ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isRtl ? 'حفظ وتطبيق إعدادات الـ SMTP' : 'Save and Apply Configuration'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Connection Test & Live Logs */}
          <div className="space-y-6">
            
            {/* Card 3: Test Connection Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Send className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  {isRtl ? 'فحص الاتصال وإرسال بريد اختباري' : 'Test SMTP Connection'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? 'أدخل بريدك الشخصي واضغط إرسال للتحقق الفوري من صحة بيانات الخادم وكلمة المرور وتخطي الجدار الناري.'
                  : 'Send a live diagnostic test message to verify credentials and firewall connectivity.'}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isRtl ? 'عنوان البريد المستلم للتجربة' : 'Recipient Email Address'}
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !host || !user}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isRtl ? 'جاري فحص الاتصال...' : 'Testing Connection...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isRtl ? 'إرسال بريد تجريبي الآن' : 'Send Diagnostic Test Email'}</span>
                    </>
                  )}
                </button>

                {/* Diagnostic Result */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : 'bg-red-950/40 border-red-800/60 text-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">
                          {testResult.success ? (isRtl ? 'نجح الاتصال والإرسال!' : 'Connection Successful!') : (isRtl ? 'فشل إرسال البريد' : 'Dispatch Failed')}
                        </strong>
                        <span className="text-[11px] opacity-90 break-words mt-0.5 block font-mono">
                          {testResult.message}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Recent Dispatched Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-white text-xs">
                    {isRtl ? 'سجل العمليات والرسائل الأخيرة' : 'Recent Dispatch Logs'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={isLoadingLogs}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  title={isRtl ? 'تحديث السجل' : 'Refresh Logs'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {logs.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-4">
                  {isRtl ? 'لا توجد رسائل مرسلة مسجلة حتى الآن.' : 'No email logs recorded yet.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {logs.slice(0, 15).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-slate-300 truncate max-w-[150px]">{log.to}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.status === 'SENT'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {log.status === 'SENT' ? (isRtl ? 'تم الإرسال' : 'Sent') : (isRtl ? 'فشل' : 'Failed')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{log.type}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {log.errorMessage && (
                        <p className="text-[10px] text-red-400 font-mono break-all pt-0.5 border-t border-slate-800/60 mt-1">
                          {log.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="font-bold text-white text-sm">
                  {isRtl ? 'معاينة قوالب البريد الإلكتروني' : 'Live Email Templates Preview'}
                </h3>
              </div>

              {/* Template Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTab('confirmation')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-colors ${
                    previewTab === 'confirmation'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'تأكيد الطلب والفاتورة' : 'Order Confirmation'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('status')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-colors ${
                    previewTab === 'status'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'تحديث حالة الطلب (مثال: تم الشحن)' : 'Status Update (Shipped)'}
                </button>
              </div>

              <button
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with Iframe / Render */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
              <div
                className="bg-white rounded-xl overflow-hidden shadow"
                dangerouslySetInnerHTML={{
                  __html:
                    previewTab === 'confirmation'
                      ? renderOrderConfirmationHtml(mockOrder)
                      : renderOrderStatusUpdateHtml(mockOrder, 'shipped'),
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {isRtl ? 'إغلاق المعاينة' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
