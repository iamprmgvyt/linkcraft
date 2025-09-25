import { findLinkByShortCode, incrementClickCount } from '@/lib/data';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Link2, AlertTriangle } from 'lucide-react';

type Props = {
  params: {
    alias: string;
  };
};

export default async function ShortLinkPage({ params }: Props) {
  const { alias } = params;
  const link = await findLinkByShortCode(alias);

  if (link) {
    await incrementClickCount(alias);
    redirect(link.longUrl);
  }

  // If link is not found, show a user-friendly "not found" page instead of a generic 404
  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Link Not Found</h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
        The link you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <a
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Create a new link
        </a>
      </div>
    </div>
  );
}
