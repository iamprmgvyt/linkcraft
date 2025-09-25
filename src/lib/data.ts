import type { Link, User } from './definitions';

// In-memory store for demonstration purposes
const users: User[] = [];
const links: Link[] = [];

// --- User Data Functions ---

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return users.find(user => user.email === email);
}

export async function findUserById(userId: string): Promise<User | undefined> {
  return users.find(user => user.id === userId);
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const newUser = { id: Date.now().toString(), ...user };
  users.push(newUser);
  return newUser;
}

// --- Link Data Functions ---

export async function findLinkByShortCode(shortCode: string): Promise<Link | undefined> {
  return links.find(link => link.shortCode === shortCode);
}

export async function createLink(link: Omit<Link, 'id'>): Promise<Link> {
  const newLink = { ...link, id: Date.now().toString() };
  links.push(newLink);
  return newLink;
}

export async function getLinksByUserId(userId: string): Promise<Link[]> {
  return links.filter(link => link.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function incrementClickCount(shortCode: string): Promise<void> {
    const link = await findLinkByShortCode(shortCode);
    if (link) {
        link.clicks++;
    }
}

export async function updateLink(id: string, userId: string, updates: { longUrl?: string; shortCode?: string }): Promise<Link | null> {
    const linkIndex = links.findIndex(l => l.id === id && l.userId === userId);
    if (linkIndex === -1) {
        return null;
    }
    
    // If shortCode is being updated, check for uniqueness
    if (updates.shortCode && updates.shortCode !== links[linkIndex].shortCode) {
        const existing = await findLinkByShortCode(updates.shortCode);
        if (existing) {
            throw new Error("Alias already in use.");
        }
    }

    links[linkIndex] = { ...links[linkIndex], ...updates };
    return links[linkIndex];
}

export async function deleteLink(id: string, userId: string): Promise<boolean> {
    const linkIndex = links.findIndex(l => l.id === id && l.userId === userId);
    if (linkIndex === -1) {
        return false;
    }
    links.splice(linkIndex, 1);
    return true;
}
