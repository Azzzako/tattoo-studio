import { NextResponse } from 'next/server';

import { ZodError } from 'zod';

export type ApiErrorCode =
  'unauthorized' | 'forbidden' | 'not_found' | 'bad_request' | 'rate_limited' | 'internal_error';

const STATUS: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  bad_request: 400,
  rate_limited: 429,
  internal_error: 500,
};

export class ApiError extends Error {
  statusCode: number;
  code: ApiErrorCode;
  details: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = STATUS[code];
    this.details = details;
  }
}

export function jsonError(error: unknown, fallbackMessage = 'Error interno'): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'bad_request' as const,
          message: 'Parametros invalidos',
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }
  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json(
    { error: { code: 'internal_error' as const, message, details: null } },
    { status: 500 },
  );
}

export function unauthorized(message = 'Falta API key'): NextResponse {
  return NextResponse.json(
    { error: { code: 'unauthorized', message, details: null } },
    {
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer realm="tattoo-studio"' },
    },
  );
}

export function json<T>(payload: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(payload, init);
}
