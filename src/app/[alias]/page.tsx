'use client';

import { findLinkByShortCode, incrementClickCount } from '@/lib/data';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function NotFoundRedirect() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      // Use window.location.href for a hard redirect to ensure the page reloads.
      window.location.href = '/';
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center space-y-4 text-center p-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Link Not Found</h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
        The link you are looking for does not exist. Redirecting to the homepage in {countdown} seconds...
      </p>
      <Button asChild>
          <Link href="/">
              <Timer className="mr-2 h-4 w-4" />
              Go to Homepage Now
          </Link>
      </Button>
    </div>
  );
}


export default function ShortLinkPage({ params }: { params: { alias: string } }) {
  const [linkData, setLinkData] = useState<{ longUrl: string } | null | 'not_found'>(null);

  useEffect(() => {
    async function fetchLink() {
      const link = await findLinkByShortCode(params.alias);
      if (link) {
        await incrementClickCount(params.alias);
        setLinkData({ longUrl: link.longUrl });
        redirect(link.longUrl);
      } else {
        setLinkData('not_found');
      }
    }

    fetchLink();
  }, [params.alias]);

  if (linkData === 'not_found') {
    return <NotFoundRedirect />;
  }

  // Display a loading state or nothing while the async operation is in progress
  return (
      <div className="flex h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Redirecting...</p>
          </div>
      </div>
  );
}
