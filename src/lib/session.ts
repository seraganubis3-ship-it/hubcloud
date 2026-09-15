import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'hubcloud_session';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  'hubcloud-super-secret-jwt-key-2026-production-grade-safe-encryption';

const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

export interface SessionUser {
  id?: string;
  userId: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Signs an Edge-compatible JWT containing the session payload.
 * Expires in 7 days.
 */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verifies and decodes an Edge-compatible JWT session token.
 * Returns null if the token is invalid, expired, or tampered with.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: String(payload.userId),
      userId: String(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
      name: String(payload.name || ''),
    };
  } catch (error) {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
