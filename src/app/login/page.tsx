'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/layout/Logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  KeyRound,
  ExternalLink,
  X
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const { isRtl, login, register, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 9) score += 1;
    if (/[0-9]/.test(regPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(regPassword) || /[A-Z]/.test(regPassword)) score += 1;

    if (score <= 1) return { score: 1, label: isRtl ? 'ضعيفة' : 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: isRtl ? 'متوسطة' : 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: isRtl ? 'قوية' : 'Good', color: 'bg-blue-500' };
    return { score: 4, label: isRtl ? 'ممتازة' : 'Strong', color: 'bg-emerald-500' };
  }, [regPassword, isRtl]);

  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail) {
      setErrorMessage(isRtl ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address');
      return;
    }

    if (!loginPassword) {
      setErrorMessage(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user.email, data.user.role, data.user);
        showToast(
          isRtl ? `مرحباً بعودتك، ${data.user.name}` : `Welcome back, ${data.user.name}`,
          'success'
        );

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(data.error || (isRtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
      }
    } catch (err) {
      console.warn('Login request error:', err);
      setErrorMessage(isRtl ? 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً' : 'Could not connect to server, please try again later');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      setErrorMessage(isRtl ? 'يرجى استكمال جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage(isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(isRtl ? 'يرجى الموافقة على شروط الخدمة وسياسة الخصوصية' : 'Please accept terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: regPassword,
          role: 'customer'
        })
      });
      const data = await res.json();

      if (res.ok && data.user) {
        register({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: 'customer'
        });
        showToast(
          isRtl ? 'تم إنشاء الحساب بنجاح! مرحباً بك في هاب كلاود' : 'Account created successfully! Welcome to Hub Cloud',
          'success'
        );

        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(data.error || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'Registration failed'));
      }
    } catch (err) {
      console.warn('Registration API error:', err);
      setErrorMessage(isRtl ? 'تعذر الاتصال بالخادم' : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-[85vh] flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <Logo size="lg" />
            <p className="text-[12px] text-gray-500 font-medium">
              {isRtl ? 'حلول عتاد الشبكات وتكنولوجيا الأعمال في مصر' : 'Enterprise Hardware & IT Solutions in Egypt'}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden p-6 sm:p-8">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              {activeTab === 'login'
                ? (isRtl ? 'أهلاً بك، سجل الدخول إلى حسابك' : 'Welcome back, sign in to your account')
                : (isRtl ? 'إنشاء حساب جديد في هاب كلاود' : 'Create your Hub Cloud account')}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">
              {activeTab === 'login'
                ? (isRtl ? 'أدخل بريدك الإلكتروني وكلمة المرور للمتابعة' : 'Enter your email and password to proceed')
                : (isRtl ? 'سجل بياناتك للتمتع بتجربة تسوق سريعة ومتابعة شحناتك' : 'Join thousands of businesses and professionals today')}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-[12px] sm:text-[13px] animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-bold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* ----------------- LOGIN FORM ----------------- */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-extrabold text-gray-700 mb-1.5">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3.5 rtl:pl-3.5 rtl:pr-10 py-2.5 sm:py-3 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-extrabold text-gray-700">
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 sm:py-3 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none text-[12px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold">{isRtl ? 'تذكر بيانات الدخول' : 'Remember my session'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-[14px] py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isRtl ? 'جاري التحقق والدخول...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- REGISTER FORM ----------------- */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-extrabold text-gray-700 mb-1">
                  {isRtl ? 'الاسم بالكامل أو اسم الشركة' : 'Full Name or Company Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isRtl ? 'أحمد محمود / شركة النور للتقنية' : 'Ahmed Mahmoud'}
                    className="w-full pl-10 pr-3.5 rtl:pl-3.5 rtl:pr-10 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-extrabold text-gray-700 mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-extrabold text-gray-700 mb-1">
                    {isRtl ? 'رقم الهاتف المحمول (مصر)' : 'Mobile Phone (Egypt)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-extrabold text-gray-700 mb-1">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {regPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-500">{isRtl ? 'قوة كلمة المرور:' : 'Strength:'}</span>
                      <span className={`${passwordStrength.score >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-gray-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-extrabold text-gray-700 mb-1">
                  {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-[13px] border rounded-xl focus:outline-none font-mono ${
                      regConfirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-rose-400 focus:border-rose-500'
                        : 'border-gray-200 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regConfirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-[12px] text-gray-600 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    {isRtl
                      ? 'أوافق على شروط الخدمة وسياسة الخصوصية وضمان هاب كلاود المعتمد.'
                      : 'I agree to the Terms of Service, Privacy Policy, and Warranty.'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-[14px] py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Return to Store Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span>←</span>
            <span>{isRtl ? 'العودة للمتجر الرئيسي وتصفح الأجهزة' : 'Return to Store'}</span>
          </Link>
        </div>

      </div>

      {/* Forgot Password Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-900">
                {isRtl ? 'استعادة أو إعادة تعيين كلمة المرور' : 'Reset Password Help'}
              </h4>
              <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                {isRtl
                  ? 'لحماية أمان حسابات الشركات وسجلات الشراء، تتم استعادة كلمة المرور عبر فريق الدعم المعتمد.'
                  : 'For enterprise account security, password recovery is handled directly via verified support.'}
              </p>
            </div>

            <div className="space-y-2 pt-1 text-[12px]">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="block font-bold text-gray-800 mb-0.5">
                  {isRtl ? '1. الدعم الفني عبر واتساب (فوري)' : '1. Instant WhatsApp Support'}
                </span>
                <span className="text-gray-500 text-[11px]">
                  {isRtl ? 'تواصل فورياً لإعادة تعيين كلمة المرور خلال دقائق.' : 'Chat with technical support to verify identity.'}
                </span>
                <a
                  href="https://wa.me/201012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  <span>{isRtl ? 'فتح محادثة واتساب الدعم' : 'Open WhatsApp Support'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="block font-bold text-gray-800 mb-0.5">
                  {isRtl ? '2. مراسلة قسم الحسابات عبر البريد' : '2. Email Support'}
                </span>
                <span className="text-gray-500 text-[11px]">
                  support@hubcloud.com
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 text-[13px] rounded-xl transition-colors"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
