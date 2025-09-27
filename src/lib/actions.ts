'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  createLink,
  findLinkByShortCode,
} from './data';

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
    form?: string[];
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
    const newLink = await createLink({
      longUrl,
      shortCode,
      userId: null,
      clicks: 0,
      createdAt: new Date(),
    });

    const protocol = 'https://';
    const host = 'linkcraft-ashen.vercel.app';
    
    return { message: 'URL shortened successfully!', shortUrl: `${protocol}${host}/${newLink.shortCode}` };
  } catch (error) {
    return { errors: {form: ['Database Error: Failed to create link.']}, message: 'Failed to shorten URL.' };
  }
}
