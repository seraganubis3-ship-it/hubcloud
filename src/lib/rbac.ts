import { AdminPermission, AdminRoleDefinition, User } from '@/types';

export const DEFAULT_ADMIN_ROLES: AdminRoleDefinition[] = [
  {
    id: 'manager',
    name: 'General Store Manager',
    nameAr: 'المدير العام للمتجر',
    description: 'Full unrestricted access to all store operations, financials, system settings, and staff roles.',
    permissions: [
      'dashboard',
      'products',
      'orders',
      'customers',
      'categories',
      'attributes',
      'inventory',
      'audit_logs',
      'coupons',
      'pages',
      'settings',
      'roles',
    ],
    isManager: true,
  },
  {
    id: 'inventory_manager',
    name: 'Inventory & Catalog Manager',
    nameAr: 'مدير المخزون والمنتجات',
    description: 'Manage hardware products, real-time stock levels, catalog pricing, and category structures.',
    permissions: ['dashboard', 'products', 'categories', 'attributes', 'inventory'],
    isManager: false,
  },
  {
    id: 'orders_specialist',
    name: 'Sales & Orders Specialist',
    nameAr: 'مسؤول المبيعات والطلبات',
    description: 'Process incoming customer orders, manage fulfillment statuses, and view customer records.',
    permissions: ['dashboard', 'orders', 'customers'],
    isManager: false,
  },
  {
    id: 'marketing_specialist',
    name: 'Marketing & Promotions Lead',
    nameAr: 'مسؤول التسويق والكوبونات',
    description: 'Create and manage promotional discount coupons, marketing campaigns, and seasonal sales.',
    permissions: ['dashboard', 'coupons', 'pages'],
    isManager: false,
  },
  {
    id: 'support_agent',
    name: 'Customer Support Representative',
    nameAr: 'خدمة العملاء والدعم',
    description: 'Inspect order tracking and customer inquiries to assist shoppers with delivery updates.',
    permissions: ['orders', 'customers'],
    isManager: false,
  },
];

export const PATH_TO_PERMISSION: Record<string, AdminPermission> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/orders': 'orders',
  '/admin/customers': 'customers',
  '/admin/categories': 'categories',
  '/admin/attributes': 'attributes',
  '/admin/audit-logs': 'audit_logs',
  '/admin/coupons': 'coupons',
  '/admin/pages': 'pages',
  '/admin/settings': 'settings',
  '/admin/emails': 'settings',
  '/admin/roles': 'roles',
};

/**
 * Checks if a user is the primary General Manager (Owner / Super Admin)
 */
export function isManagerUser(user: { email?: string; role?: string; isManager?: boolean; adminRoleId?: string } | User | null): boolean {
  if (!user || user.role !== 'admin') return false;
  // If explicitly flagged as manager or has email of system admin or manager role
  if (user.isManager === true) return true;
  if (user.adminRoleId === 'manager') return true;
  if (user.email && user.email.toLowerCase() === 'admin@hubcloud.eg') return true;
  // Default fallback: if role is admin and no adminRoleId set, default to manager
  if (!user.adminRoleId) return true;
  return false;
}

/**
 * Checks if a user has access to a specific permission
 */
export function hasPermission(user: User | null, permission: AdminPermission): boolean {
  if (!user || user.role !== 'admin') return false;

  // The Manager has all permissions unconditionally
  if (isManagerUser(user)) return true;

  // Roles permission is exclusively reserved for the Manager
  if (permission === 'roles') return false;

  // Custom user permissions override
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission)) return true;
  }

  // Look up role definition
  const role = DEFAULT_ADMIN_ROLES.find(r => r.id === user.adminRoleId);
  if (role && role.permissions.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Checks if a user can access a specific admin URL path
 */
export function canAccessPath(user: User | null, pathname: string): boolean {
  if (!user || user.role !== 'admin') return false;
  if (isManagerUser(user)) return true;

  // Find the closest matching permission
  const matchingKey = Object.keys(PATH_TO_PERMISSION).find(key => {
    if (key === '/admin') return pathname === '/admin';
    return pathname === key || pathname.startsWith(`${key}/`);
  });

  if (!matchingKey) return true;

  const requiredPermission = PATH_TO_PERMISSION[matchingKey];
  return hasPermission(user, requiredPermission);
}
