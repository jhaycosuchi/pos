import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? '✓ SET' : '✗ NOT SET',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ SET' : '✗ NOT SET',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? `✓ SET (${process.env.GOOGLE_PRIVATE_KEY.length} chars)` : '✗ NOT SET',
    NEXT_PUBLIC_GOOGLE_SHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ? '✓ SET' : '✗ NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });
}
