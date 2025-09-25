'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { login, signup } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SubmitButton } from './submit-button';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? login : signup;
  const [state, dispatch] = useFormState(action, { message: null, errors: {} });

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Email address
        </Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby="email-error"
          />
          {state.errors?.email && (
            <p id="email-error" className="text-sm font-medium text-destructive mt-1">
              {state.errors.email.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Password
        </Label>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            aria-describedby="password-error"
          />
          {state.errors?.password && (
            <p id="password-error" className="text-sm font-medium text-destructive mt-1">
              {state.errors.password.join(', ')}
            </p>
          )}
        </div>
      </div>

      {state.errors?.form && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.errors.form}</AlertDescription>
        </Alert>
      )}

      <div>
        <SubmitButton
          className="w-full"
          pendingText={mode === 'login' ? 'Signing in...' : 'Creating account...'}
        >
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </SubmitButton>
      </div>
      
      <p className="mt-10 text-center text-sm text-muted-foreground">
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
        <Link
          href={mode === 'login' ? '/signup' : '/login'}
          className="font-semibold leading-6 text-primary hover:text-primary/90 ml-2"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </form>
  );
}
