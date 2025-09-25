export type Link = {
  id: string;
  userId: string | null;
  longUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
};
