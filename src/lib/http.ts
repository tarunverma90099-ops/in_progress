import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

/** Error carrying an HTTP status code, thrown from route handlers. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export const badRequest = (m: string) => new HttpError(400, m);
export const forbidden = (m: string) => new HttpError(403, m);
export const notFound = (m: string) => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);

export const ok = (data: Record<string, unknown> = {}, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });

/**
 * Wraps a route handler: connects to MongoDB, converts thrown HttpErrors and
 * common Mongoose errors into JSON responses, and logs unexpected failures.
 */
export function route<A extends unknown[]>(
  label: string,
  handler: (...args: A) => Promise<NextResponse>
) {
  return async (...args: A): Promise<NextResponse> => {
    // The connection error is captured rather than thrown so that malformed
    // requests still get their 400 instead of a misleading 503.
    const connectionError = await connectDB().then(
      () => null,
      (error: unknown) => (error instanceof Error ? error : new Error(String(error)))
    );

    try {
      const response = await handler(...args);
      if (connectionError) return databaseUnavailable(label, connectionError);
      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (isDuplicateKeyError(error)) {
        return NextResponse.json({ error: 'This record already exists' }, { status: 409 });
      }
      if (connectionError) return databaseUnavailable(label, connectionError);

      console.error(`${label} error:`, error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

function databaseUnavailable(label: string, error: Error) {
  console.error(`${label} — database unavailable:`, error.message);
  return NextResponse.json(
    { error: 'Database unavailable. Check MONGODB_URI and that MongoDB is running.' },
    { status: 503 }
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}

/** Parse a JSON body, rejecting malformed payloads with a 400 instead of a 500. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw badRequest('Request body must be valid JSON');
  }
}

/** Validate a Mongo ObjectId, throwing a 400 instead of a CastError 500. */
export function objectId(value: unknown, field: string): string {
  const id = String(value ?? '');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw badRequest(`Invalid ${field}`);
  }
  return id;
}

/** Escape a string for safe literal use inside a regular expression. */
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a case-insensitive exact-match filter for an email address.
 *
 * Mongoose's `lowercase`/`trim` setters only run on document writes — they are
 * NOT applied to query filters, `insertMany`, or raw driver updates, and they
 * never touch rows written before the setter existed. A plain equality match on
 * the lowercased address therefore misses any stored address that differs in
 * case or has stray whitespace, which surfaces to the user as a bogus
 * "Invalid email or password". Matching case-insensitively avoids that.
 */
export const emailFilter = (email: string) => ({
  $regex: `^\\s*${escapeRegex(email)}\\s*$`,
  $options: 'i',
});

/** Today's date as YYYY-MM-DD. */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/** Normalise any date input to YYYY-MM-DD, throwing a 400 when unparsable. */
export function toDateStr(value: unknown): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw badRequest('Invalid date');
  return date.toISOString().slice(0, 10);
}
