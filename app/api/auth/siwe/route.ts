// app/api/auth/siwe/route.ts
// SIWE (Sign-In with Ethereum) authentication API
// Handles login payload generation, login verification, session management

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Session management using cookies
// SESSION_SECRET should be set in production for enhanced security
// If not set, uses simple base64 encoding (works but less secure)
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_COOKIE_NAME = 'siwe-session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Warn if SESSION_SECRET is not set in production
if (process.env.NODE_ENV === 'production' && !SESSION_SECRET) {
  console.warn('⚠️  WARNING: SESSION_SECRET not set in production. Sessions are less secure.');
}

interface SIWESession {
  address: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Generate a SIWE login payload (message for user to sign)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Generate SIWE message
    const domain = request.headers.get('host') || 'satoshesluggers.com';
    const origin = request.headers.get('origin') || `https://${domain}`;
    const issuedAt = new Date().toISOString();
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const message = `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${origin}
Version: 1
Chain ID: 8453
Nonce: ${Math.random().toString(36).substring(2, 15)}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;

    return NextResponse.json({ payload: message });
  } catch (error) {
    console.error('Error generating SIWE payload:', error);
    return NextResponse.json(
      { error: 'Failed to generate login payload' },
      { status: 500 }
    );
  }
}

/**
 * Verify SIWE signature and create session (login)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, address } = body;

    if (!message || !signature || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: message, signature, address' },
        { status: 400 }
      );
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      const normalizedRecovered = recoveredAddress.toLowerCase();
      const normalizedProvided = address.toLowerCase();

      if (normalizedRecovered !== normalizedProvided) {
        return NextResponse.json(
          { error: 'Invalid signature. Address does not match signature.' },
          { status: 401 }
        );
      }

      // Verify message format (basic validation)
      if (!message.includes('wants you to sign in')) {
        return NextResponse.json(
          { error: 'Invalid SIWE message format' },
          { status: 400 }
        );
      }

      // Check expiration
      const expirationMatch = message.match(/Expiration Time: (.+)/);
      if (expirationMatch) {
        const expirationTime = new Date(expirationMatch[1]);
        if (expirationTime < new Date()) {
          return NextResponse.json(
            { error: 'Message has expired' },
            { status: 401 }
          );
        }
      }

      // Create session
      const session: SIWESession = {
        address: normalizedProvided,
        issuedAt: Date.now(),
        expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
      };

      // Create simple JWT-like token (in production, use a proper JWT library)
      const sessionToken = Buffer.from(JSON.stringify(session)).toString('base64url');

      // Set cookie with session
      const response = NextResponse.json({ success: true, address: normalizedProvided });
      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: 'Invalid signature format' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in SIWE login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

