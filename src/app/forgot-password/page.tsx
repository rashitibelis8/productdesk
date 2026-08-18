'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background dark:bg-inverse-surface dark:text-inverse-on-surface">
      <main className="flex flex-grow items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-[440px]">
          <div className="mb-stack-lg flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-card dark:border-outline dark:bg-inverse-surface md:p-[40px]">
            {submitted ? (
              <div className="text-center">
                <h1 className="mb-stack-sm font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
                  Check your email
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  If an account with that email exists, we&apos;ve sent a reset link. In development, check the server
                  console for the link.
                </p>
                <div className="mt-stack-lg">
                  <Link
                    href="/login"
                    className="inline-flex items-center font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
                  >
                    <Icon name="arrow_back" size={16} className="mr-1" />
                    Return to login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-stack-lg text-center">
                  <h1 className="mb-stack-sm font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
                    Forgot your password?
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-stack-sm block font-label-md text-label-md text-on-surface dark:text-inverse-on-surface"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant dark:text-surface-variant">
                        <Icon name="mail" size={20} />
                      </span>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        className={cn(
                          'block w-full rounded-lg border bg-surface-container-lowest py-2 pl-10 pr-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 dark:bg-inverse-surface dark:text-inverse-on-surface',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          errors.email ? 'border-error' : 'border-outline-variant dark:border-outline'
                        )}
                        {...register('email')}
                      />
                    </div>
                    {errors.email?.message && (
                      <p className="mt-1 font-label-md text-label-md text-error">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-stack-sm pt-stack-sm">
                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                      Send Reset Link
                    </Button>
                    <div className="pt-stack-sm text-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
                      >
                        <Icon name="arrow_back" size={16} className="mr-1" />
                        Return to login
                      </Link>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
