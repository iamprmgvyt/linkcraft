'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Clipboard, ClipboardCheck, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { shortenUrl } from '@/lib/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from './submit-button';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const initialState = { message: null, errors: {}, shortUrl: null };

export default function UrlShortener() {
  const [state, dispatch] = useActionState(shortenUrl, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.message && state.errors?.form) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.errors.form.join(', '),
      });
    } else if (state.shortUrl) {
      formRef.current?.reset();
    }
  }, [state, toast]);
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (state.shortUrl) {
      navigator.clipboard.writeText(state.shortUrl);
      setCopied(true);
      toast({
          title: "Copied to clipboard!",
          description: state.shortUrl,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardContent className="p-6">
        <form action={dispatch} ref={formRef} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="longUrl">URL to shorten</Label>
            <Input
              id="longUrl"
              name="longUrl"
              placeholder="https://your-super-long-url.com/with/a/long/path"
              required
              aria-describedby="longUrl-error"
            />
            {state.errors?.longUrl && (
              <p id="longUrl-error" className="text-sm font-medium text-destructive">
                {state.errors.longUrl.join(', ')}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="alias">Custom alias (optional)</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm p-2 rounded-l-md bg-muted">
                linkcraft.vercel.app/
              </span>
              <Input
                id="alias"
                name="alias"
                placeholder="my-cool-link"
                className="rounded-l-none"
                aria-describedby="alias-error"
              />
            </div>
            {state.errors?.alias && (
              <p id="alias-error" className="text-sm font-medium text-destructive">
                {state.errors.alias.join(', ')}
              </p>
            )}
          </div>
          <SubmitButton
            className="w-full bg-accent hover:bg-accent/90"
            pendingText="Shortening..."
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Shorten Link
          </SubmitButton>
        </form>
        {state.shortUrl && (
          <div className="mt-4">
              <Alert className="border-primary/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Success! Here's your short link:</AlertTitle>
                  <AlertDescription className="flex items-center justify-between mt-2">
                      <a href={state.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline truncate">
                          {state.shortUrl}
                      </a>
                      <button onClick={handleCopy} className="p-2 rounded-md hover:bg-secondary">
                          {copied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                          <span className="sr-only">Copy to clipboard</span>
                      </button>
                  </AlertDescription>
              </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
