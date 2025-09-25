import 'server-only';
import { cookies } from 'next/headers';
import type { SessionPayload } from './definitions';
import { findUserById } from './data';

const SESSION_COOKIE_NAME = 'linkcraft_session';

// In a real app, these would be encrypted using something like 'jose'
// For this mock, we'll use a simple base64 encoding.

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session: SessionPayload = { userId, expiresAt };

  const sessionString = JSON.stringify(session);
  const encodedSession = Buffer.from(sessionString).toString('base64');

  cookies().set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const sessionString = Buffer.from(cookie, 'base64').toString('utf-8');
    const session: SessionPayload = JSON.parse(sessionString);

    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    return await findUserById(session.userId);
}
