// lib/session-auth.ts
// Utility functions for session-based authentication

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'siwe-session';

export interface SIWESession {
  address: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Get the authenticated wallet address from the session
 * Returns null if no valid session exists
 */
export async function getAuthenticatedAddress(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session: SIWESession = JSON.parse(
      Buffer.from(sessionToken, 'base64url').toString()
    );

    // Check expiration
    if (session.expiresAt < Date.now()) {
      return null;
    }

    return session.address.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Verify that the request has a valid authenticated session
 * Throws an error if authentication fails
 */
export async function requireAuth(): Promise<string> {
  const address = await getAuthenticatedAddress();

  if (!address) {
    throw new Error('Unauthorized: No valid session found');
  }

  return address;
}

