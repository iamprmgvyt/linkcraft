export type Link = {
  id: string;
  userId: string | null;
  longUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
};

export type User = {
  id:string;
  email: string;
  password: string; // In a real app, this would be a hash
};

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};
