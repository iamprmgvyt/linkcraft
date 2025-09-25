import { getCurrentUser } from '@/lib/auth';
import { getLinksByUserId } from '@/lib/data';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const links = await getLinksByUserId(user.id);

  // We need to serialize the Date object before passing it to the client component
  const serializedLinks = links.map(link => ({
    ...link,
    createdAt: link.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Your Links</h1>
      <p className="text-muted-foreground mb-8">
        Manage and track your shortened URLs.
      </p>
      <DashboardClient initialLinks={serializedLinks} />
    </div>
  );
}
