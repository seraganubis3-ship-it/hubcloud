import { NextResponse } from 'next/server';
import { getSessionUserFromRequest, SessionUser } from './auth';
import { isManagerUser, hasPermission } from './rbac';

export type AuthResult =
  | { authorized: true; user: SessionUser }
  | { authorized: false; response: NextResponse };

/**
 * Ensures the request contains a valid, authenticated session cookie.
 */
export async function requireSession(request: Request): Promise<AuthResult> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }
  return { authorized: true, user };
}

/**
 * Ensures the request is from an authenticated user with an 'admin' role.
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const auth = await requireSession(request);
  if (!auth.authorized) return auth;

  if (auth.user.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Administrative privileges required.' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Ensures the request is from the General Store Manager.
 */
export async function requireManager(request: Request): Promise<AuthResult> {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth;

  if (!isManagerUser({ email: auth.user.email, role: auth.user.role as any, adminRoleId: auth.user.adminRoleId || undefined })) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Only the General Store Manager has access to this operation.' },
        { status: 403 }
      ),
    };
  }

  return auth;
}
