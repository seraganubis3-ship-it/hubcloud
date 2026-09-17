import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: any;
}

/**
 * Standard successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200, extra?: Record<string, any>): NextResponse {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return NextResponse.json(
      {
        success: true,
        ...data,
        ...(extra || {}),
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data,
      ...(extra || {}),
    },
    { status }
  );
}

/**
 * Standard error JSON response
 */
export function apiError(
  message: string,
  status = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    { status }
  );
}

/**
 * Global API error handler that prevents leaking internal database schema,
 * connection strings, or stack traces in production.
 */
export function handleApiError(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again later.'): NextResponse {
  console.error('[API Error]:', error);

  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
      return apiError(`A record with this ${target} already exists.`, 409, 'CONFLICT');
    }

    // Prisma Record Not Found
    if (err.code === 'P2025') {
      return apiError('The requested resource was not found.', 404, 'NOT_FOUND');
    }

    // Prisma Foreign Key Failure
    if (err.code === 'P2003') {
      return apiError('A related resource could not be found or referenced.', 400, 'FOREIGN_KEY_FAILED');
    }

    // Explicit custom message if it is a safe validation error
    if (err.isOperational && err.message) {
      return apiError(err.message, err.statusCode || 400);
    }
  }

  // Sanitized message for production
  return apiError(fallbackMessage, 500, 'INTERNAL_SERVER_ERROR');
}

