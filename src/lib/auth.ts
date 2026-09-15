import bcrypt from 'bcryptjs';
import {
  AUTH_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SessionUser,
  signSessionToken,
  verifySessionToken,
} from './session';

export {
  AUTH_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  type SessionUser,
  signSessionToken,
  verifySessionToken,
};

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Securely compares a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}

/**
 * Reads and verifies the session token from a Next.js Request (cookies header)
 */
export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!match) return null;

  const token = match.substring(`${AUTH_COOKIE_NAME}=`.length);
  if (!token) return null;

  return verifySessionToken(token);
}
