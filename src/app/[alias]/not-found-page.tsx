'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

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
