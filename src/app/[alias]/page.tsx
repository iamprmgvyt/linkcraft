'use client';

import { findLinkByShortCode, incrementClickCount } from '@/lib/data';
import { redirect, useRouter } from 'next/navigation';
import { Link2, AlertTriangle, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

// This is a client component to handle the countdown and redirect
function NotFoundRedirect() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Link Not Found</h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
        The link you are looking for does not exist. Redirecting to the homepage in {countdown} seconds...
      </p>
      <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <a
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Timer className="mr-2 h-4 w-4" />
          Go to Homepage
        </a>
      </div>
    </div>
  );
}


// The page itself remains a server component for initial data fetching
export default async function ShortLinkPage({ params }: { params: { alias: string } }) {
  const { alias } = params;
  const link = await findLinkByShortCode(alias);

  if (link) {
    await incrementClickCount(alias);
    redirect(link.longUrl);
  }

  // If link is not found, render the client component for redirection
  return <NotFoundRedirect />;
}
