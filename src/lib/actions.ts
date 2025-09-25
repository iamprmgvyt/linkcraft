'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createUser,
  findUserByEmail,
  createLink,
  findLinkByShortCode,
  deleteLink,
  updateLink
} from './data';
import { createSession, deleteSession, getCurrentUser } from './auth';

// --- Auth Actions ---

const AuthSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string;
  };
  message?: string | null;
};

export async function signup(prevState: AuthState, formData: FormData) {
  const validatedFields = AuthSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to sign up.',
    };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      errors: { form: 'An account with this email already exists.' },
      message: 'Signup failed.',
    };
  }

  try {
    const newUser = await createUser({ email, password });
    await createSession(newUser.id);
  } catch (error) {
    return { errors: { form: 'Something went wrong.' }, message: 'Database Error: Failed to Create User.' };
  }

  redirect('/dashboard');
}

export async function login(prevState: AuthState, formData: FormData) {
  const validatedFields = AuthSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to log in.',
    };
  }

  const { email, password } = validatedFields.data;

  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    return {
      errors: { form: 'Invalid credentials.' },
      message: 'Login failed.',
    };
  }

  try {
    await createSession(user.id);
  } catch (error) {
    return { errors: { form: 'Something went wrong.' }, message: 'Something went wrong.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}

// --- Link Actions ---

const ShortenUrlSchema = z.object({
  longUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  alias: z.string().optional().refine(
    (s) => !s || /^[a-zA-Z0-9_-]+$/.test(s),
    { message: 'Alias can only contain letters, numbers, underscores, and hyphens.' }
  ),
});

type ShortenState = {
  errors?: {
    longUrl?: string[];
    alias?: string[];
    form?: string;
  };
  message?: string | null;
  shortUrl?: string | null;
};

function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

export async function shortenUrl(prevState: ShortenState, formData: FormData): Promise<ShortenState> {
  const validatedFields = ShortenUrlSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
    };
  }
  
  const { longUrl, alias } = validatedFields.data;
  let shortCode = alias;
  
  if (shortCode) {
    const existing = await findLinkByShortCode(shortCode);
    if (existing) {
      return {
        errors: { alias: ['This custom alias is already taken.'] },
        message: 'Alias unavailable.',
      };
    }
  } else {
    // Generate a unique short code
    do {
      shortCode = generateShortCode();
    } while (await findLinkByShortCode(shortCode));
  }
  
  try {
    const user = await getCurrentUser();
    const newLink = await createLink({
      longUrl,
      shortCode,
      userId: user?.id ?? null,
      clicks: 0,
      createdAt: new Date(),
    });

    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    const host = process.env.VERCEL_URL || 'localhost:9002'; // Default to localhost:9002 for dev
    
    revalidatePath('/dashboard');
    return { message: 'URL shortened successfully!', shortUrl: `${protocol}${host}/${newLink.shortCode}` };
  } catch (error) {
    return { errors: {form: 'Database Error: Failed to create link.'}, message: 'Failed to shorten URL.' };
  }
}

const UpdateLinkSchema = z.object({
  id: z.string(),
  longUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  shortCode: z.string().min(1, 'Alias cannot be empty').refine(
    (s) => /^[a-zA-Z0-9_-]+$/.test(s),
    { message: 'Alias can only contain letters, numbers, underscores, and hyphens.' }
  ),
});

type UpdateLinkState = {
  errors?: {
    longUrl?: string[];
    shortCode?: string[];
    form?: string;
  };
  message?: string | null;
}

export async function updateLinkAction(prevState: UpdateLinkState, formData: FormData): Promise<UpdateLinkState> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { form: 'Authentication required.' }, message: 'Unauthorized' };
  }

  const validatedFields = UpdateLinkSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
    };
  }

  const { id, longUrl, shortCode } = validatedFields.data;

  try {
    await updateLink(id, user.id, { longUrl, shortCode });
    revalidatePath('/dashboard');
    return { message: 'Link updated successfully.' };
  } catch (error: any) {
    return { errors: { form: error.message || 'Database Error: Failed to update link.' }, message: 'Failed to update link.' };
  }
}


export async function deleteLinkAction(id: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Authentication required.');
    }

    try {
        await deleteLink(id, user.id);
        revalidatePath('/dashboard');
        return { message: 'Link deleted successfully.' };
    } catch (error) {
        return { message: 'Database Error: Failed to delete link.' };
    }
}
