'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  DEFAULT_ADMIN_ROLES,
  isManagerUser,
  PATH_TO_PERMISSION,
} from '@/lib/rbac';
import { AdminPermission, AdminRoleDefinition, User } from '@/types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Check,
  X,
  Plus,
  Lock,
  UserCheck,
  Layers,
  ShoppingBag,
  Package,
  Tag,
  Settings,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  FileText,
  Boxes,
  SlidersHorizontal,
  History
} from 'lucide-react';

export default function AdminRolesPage() {
  const { currentUser, isRtl, showToast, setCurrentUser } = useStore();
  const [roles, setRoles] = useState<AdminRoleDefinition[]>(DEFAULT_ADMIN_ROLES);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedStaffToEdit, setSelectedStaffToEdit] = useState<User | null>(null);

  const isManager = isManagerUser(currentUser);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaffList(data.staff);
      }
    } catch (e) {
      console.warn('Could not load staff list:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler to assign role to staff
  const handleAssignRole = async (userId: string, roleId: string) => {
    const targetRole = roles.find(r => r.id === roleId);
    if (!targetRole) return;

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminRoleId: roleId }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(prev =>
          prev.map(u => (u.id === userId ? { ...u, adminRoleId: roleId } : u))
        );
        showToast(
          isRtl
            ? `تم تحديث رتبة الموظف إلى: ${targetRole.nameAr}`
            : `Staff role updated to ${targetRole.name}`,
          'success'
        );
      }
    } catch (e: any) {
      showToast(isRtl ? 'حدث خطأ أثناء تحديث الرتبة' : 'Error updating role', 'error');
    }
  };

  // Switch active simulation role for the manager to preview experience
  const handleSimulateRole = (roleId: string) => {
    if (!currentUser) return;
    const target = roles.find(r => r.id === roleId);
    if (!target) return;

    const updatedUser: User = {
      ...currentUser,
      adminRoleId: roleId,
      isManager: roleId === 'manager',
    };

    if (setCurrentUser) {
      setCurrentUser(updatedUser);
    }
    showToast(
      isRtl
        ? `أنت الآن تعاين لوحة التحكم برتبة: ${target.nameAr}`
        : `Simulating admin experience as: ${target.name}`,
      'info'
    );
  };

  // Section icons mapping
  const permissionIcons: Record<AdminPermission, any> = {
    dashboard: LayoutDashboard,
    products: Package,
    orders: ShoppingBag,
    customers: Users,
    categories: Layers,
    attributes: SlidersHorizontal,
    inventory: Boxes,
    coupons: Tag,
    audit_logs: History,
    pages: FileText,
    settings: Settings,
    roles: Shield,
  };

  const allPermissions: { key: AdminPermission; labelEn: string; labelAr: string }[] = [
    { key: 'dashboard', labelEn: 'Dashboard Overview', labelAr: 'الرئيسية والإحصائيات' },
    { key: 'products', labelEn: 'Products & Stock', labelAr: 'المنتجات والمخزون' },
    { key: 'orders', labelEn: 'Orders Pipeline', labelAr: 'الطلبات والمبيعات' },
    { key: 'customers', labelEn: 'Customers Directory', labelAr: 'بيانات العملاء' },
    { key: 'categories', labelEn: 'Categories Management', labelAr: 'إدارة الأقسام' },
    { key: 'attributes', labelEn: 'Dynamic Attributes', labelAr: 'المواصفات والخصائص' },
    { key: 'inventory', labelEn: 'Inventory & Stock History', labelAr: 'المخزون وحركة التوريد' },
    { key: 'coupons', labelEn: 'Coupons & Discounts', labelAr: 'الكوبونات والتخفيضات' },
    { key: 'audit_logs', labelEn: 'System Audit Logs', labelAr: 'سجل العمليات والرقابة' },
    { key: 'pages', labelEn: 'CMS Page Content', labelAr: 'محتوى الصفحات والسياسات' },
    { key: 'settings', labelEn: 'Store Settings', labelAr: 'إعدادات المتجر' },
    { key: 'roles', labelEn: 'Roles & Permissions', labelAr: 'إدارة الرولز والصلاحيات' },
  ];

  // Access Denied Screen if user is not the Manager
  if (!isManager) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">
            {isRtl ? 'صلاحية مقيدة - للمدير العام فقط' : 'Restricted Access - Manager Only'}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'صفحة إدارة الرولز وتوزيع الصلاحيات متاحة حصرياً للمدير العام للمتجر (Super Admin). يرجى مراجعة الإدارة إذا كنت بحاجة لصلاحيات إضافية.'
              : 'The Roles & Permissions configuration suite is strictly restricted to the General Store Manager. Please contact your manager for access.'}
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => handleSimulateRole('manager')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-hub-blue text-white rounded-xl text-xs font-bold hover:bg-hub-blue-dark transition-colors shadow"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isRtl ? 'تسجيل الدخول كرتبة المدير العام' : 'Switch Back to Manager Role'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Roles & Access Control (RBAC)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Manager Only
                </span>
              </h1>
              <p className="text-[13px] text-slate-400 mt-0.5">
                Manage staff roles and control which administrative pages each team member is allowed to view.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-hub-blue' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulator Banner for Store Owner */}
      <div className="p-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/30 border border-purple-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              {isRtl ? 'محاكي تجربة الموظفين (Role Preview)' : 'Live Staff Experience Simulator'}
            </h4>
            <p className="text-[12px] text-slate-400">
              {isRtl
                ? 'يمكنك تبديل رتبتك مؤقتاً لتجربة ما يراه كل موظف والتأكد من إخفاء الصفحات غير المصرح بها.'
                : 'Test how the sidebar and pages look to different staff members by switching roles.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => handleSimulateRole(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentUser?.adminRoleId === r.id || (r.id === 'manager' && isManager && !currentUser?.adminRoleId)
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isRtl ? r.nameAr : r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Defined Roles Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-hub-blue" />
          <span>Defined Staff Roles ({roles.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => {
            const isManagerRole = role.isManager;
            return (
              <div
                key={role.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isManagerRole
                    ? 'bg-gradient-to-br from-purple-950/30 to-slate-900 border-purple-500/40 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isManagerRole ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/10 text-hub-blue'
                    }`}>
                      {isManagerRole ? <ShieldCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[14px]">{isRtl ? role.nameAr : role.name}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                        {role.id}
                      </span>
                    </div>
                  </div>

                  {isManagerRole && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Super Admin
                    </span>
                  )}
                </div>

                <p className="text-[12px] text-slate-400 leading-relaxed mb-4 min-h-[36px]">
                  {role.description}
                </p>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Authorized Sections:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map(perm => {
                      const Icon = permissionIcons[perm] || Shield;
                      return (
                        <span
                          key={perm}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          <Icon className="w-3 h-3 text-hub-blue" />
                          <span className="capitalize">{perm}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-hub-blue" />
          <span>Access Control Matrix</span>
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-[13px] text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5 text-start">Administrative Section</th>
                  {roles.map(r => (
                    <th key={r.id} className="py-4 px-4 text-center">
                      <span className="block text-white">{isRtl ? r.nameAr : r.name}</span>
                      <span className="text-[10px] font-normal text-slate-500 font-mono">({r.id})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allPermissions.map(perm => {
                  const Icon = permissionIcons[perm.key] || Shield;
                  return (
                    <tr key={perm.key} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-hub-blue" />
                        <span>{isRtl ? perm.labelAr : perm.labelEn}</span>
                      </td>
                      {roles.map(r => {
                        const hasAccess = r.permissions.includes(perm.key);
                        return (
                          <td key={r.id} className="py-3.5 px-4 text-center">
                            {hasAccess ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-600">
                                <X className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-hub-blue" />
          <span>Staff & Administrators Directory</span>
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-hub-blue animate-spin" />
              <p className="text-sm text-slate-400">Loading staff directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-[13px] text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5 text-start">Staff Member</th>
                    <th className="py-4 px-5 text-start">Email & Phone</th>
                    <th className="py-4 px-5 text-start">Assigned Role</th>
                    <th className="py-4 px-5 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {staffList.map(staff => {
                    const currentRoleId = staff.adminRoleId || (staff.email === 'admin@hubcloud.eg' ? 'manager' : 'orders_specialist');
                    return (
                      <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                              {staff.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{staff.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">ID: {staff.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">
                          <div>{staff.email}</div>
                          <div className="text-slate-500">{staff.phone}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <select
                            value={currentRoleId}
                            onChange={(e) => handleAssignRole(staff.id, e.target.value)}
                            disabled={staff.email === 'admin@hubcloud.eg'}
                            className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-hub-blue cursor-pointer disabled:opacity-50"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>
                                {isRtl ? r.nameAr : r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-5 text-end">
                          {staff.email === 'admin@hubcloud.eg' ? (
                            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                              Primary Owner
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              Active Staff
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
