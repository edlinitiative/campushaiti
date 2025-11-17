/**
 * API Middleware
 * Rate limiting and audit logging for API routes
 */

import { NextResponse } from "next/server";
import { rateLimiters, getClientIdentifier } from "./rate-limiter";
import { auditLogger, AuditAction, AuditSeverity } from "./audit-logger";

export interface APIMiddlewareOptions {
  rateLimiter?: keyof typeof rateLimiters;
  auditAction?: AuditAction;
  requireAuth?: boolean;
}

/**
 * Apply rate limiting to API endpoint
 */
export async function withRateLimit(
  request: Request,
  limiterType: keyof typeof rateLimiters = "api"
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[limiterType];
  const result = limiter.check(identifier);

  if (!result.allowed) {
    // Log rate limit exceeded
    await auditLogger.log({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.WARNING,
      ipAddress: identifier,
      details: {
        limiterType,
        retryAfter: result.retryAfter,
      },
    });

    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
          "Retry-After": result.retryAfter?.toString() || "60",
        },
      }
    );
  }

  return null; // No rate limit, proceed
}

/**
 * Apply audit logging to API endpoint
 */
export async function withAuditLog(
  request: Request,
  action: AuditAction,
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  const ipAddress = getClientIdentifier(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  await auditLogger.log({
    action,
    userId,
    ipAddress,
    userAgent,
    details,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Combined middleware wrapper for API routes
 */
export async function withAPIMiddleware(
  request: Request,
  options: APIMiddlewareOptions = {}
): Promise<{
  error?: NextResponse;
  clientId: string;
}> {
  const clientId = getClientIdentifier(request);

  // Apply rate limiting if configured
  if (options.rateLimiter) {
    const rateLimitError = await withRateLimit(request, options.rateLimiter);
    if (rateLimitError) {
      return { error: rateLimitError, clientId };
    }
  }

  // Apply audit logging if configured
  if (options.auditAction) {
    await withAuditLog(request, options.auditAction);
  }

  return { clientId };
}

/**
 * Helper to add security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

/**
 * Validate request body against schema
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      errors.push(`Missing required field: ${String(field)}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
