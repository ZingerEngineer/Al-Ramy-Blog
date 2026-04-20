import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientErrorLogger } from '@/lib/logger';

/**
 * Schema for client error reports
 */
const clientErrorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/log/client-error
 * Endpoint to receive and log client-side errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the error report
    const validatedError = clientErrorSchema.safeParse(body);

    if (!validatedError.success) {
      clientErrorLogger.warn(
        { errors: validatedError.error.flatten() },
        'Invalid client error report received',
      );
      return NextResponse.json({ error: 'Invalid error report format' }, { status: 400 });
    }

    const { message, stack, componentStack, url, userAgent, metadata } = validatedError.data;

    // Extract additional request context
    const headers = request.headers;
    const realUserAgent = userAgent || headers.get('user-agent') || 'unknown';
    const referer = headers.get('referer') || url || 'unknown';

    // Log the client error with full context
    clientErrorLogger.error(
      {
        message,
        stack,
        componentStack,
        url: referer,
        userAgent: realUserAgent,
        metadata,
        timestamp: new Date().toISOString(),
      },
      'Client-side error reported',
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Log the error in processing the client error report
    clientErrorLogger.error({ err: error }, 'Failed to process client error report');

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
