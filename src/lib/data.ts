import type { Link } from './definitions';

// In-memory store for demonstration purposes
const links: Link[] = [];


// --- Link Data Functions ---

export async function findLinkByShortCode(shortCode: string): Promise<Link | undefined> {
  return links.find(link => link.shortCode === shortCode);
}

export async function createLink(link: Omit<Link, 'id'>): Promise<Link> {
  const newLink = { ...link, id: Date.now().toString() };
  links.push(newLink);
  return newLink;
}

export async function incrementClickCount(shortCode: string): Promise<void> {
    const link = await findLinkByShortCode(shortCode);
    if (link) {
        link.clicks++;
    }
}
