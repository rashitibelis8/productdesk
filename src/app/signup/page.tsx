'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

const FEATURES = [
  {
    icon: 'speed',
    title: 'Real-time Inventory Tracking',
    description: 'Monitor your stock levels with millisecond precision.',
  },
  {
    icon: 'shield',
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and granular access controls.',
  },
  {
    icon: 'integration_instructions',
    title: 'Seamless Integrations',
    description: 'Connect with your existing workflow instantly.',
  },
] as const;

export default function SignUpPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpInput) => {
    setFormError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-inverse-surface md:flex-row">
      {/* Left split: branding / value props */}
      <div className="relative hidden flex-col overflow-hidden border-r border-outline-variant bg-surface-container-lowest p-margin-desktop dark:border-outline dark:bg-inverse-surface md:flex md:w-1/2">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <Link href="/">
            <Logo />
          </Link>

          <div className="mt-stack-lg max-w-md">
            <h1 className="mb-stack-md font-display text-display text-on-surface dark:text-inverse-on-surface">
              Build the future, faster.
            </h1>
            <p className="mb-stack-lg font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
              Join thousands of high-growth product teams accelerating their delivery with ProductDesk.
            </p>
            <div className="flex flex-col gap-stack-md">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary-fixed text-primary dark:bg-primary/20 dark:text-inverse-primary">
                    <Icon name={feature.icon} size={20} />
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[16px] leading-[24px] text-on-surface dark:text-inverse-on-surface">
                      {feature.title}
                    </h3>
                    <p className="text-on-surface-variant dark:text-surface-variant">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-stack-lg font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
            &quot;ProductDesk transformed how we manage operations globally. Unmatched clarity.&quot;
            <span className="mt-1 block font-bold text-on-surface dark:text-inverse-on-surface">— Sarah Jenkins, COO</span>
          </div>
        </div>
      </div>

      {/* Right split: sign up form */}
      <div className="flex flex-1 flex-col justify-center bg-surface px-margin-mobile py-stack-lg dark:bg-inverse-surface md:px-margin-desktop">
        <Link href="/" className="mb-stack-lg inline-block md:hidden">
          <Logo />
        </Link>

        <div className="mx-auto w-full max-w-[420px] rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-card dark:border-outline dark:bg-inverse-surface">
          {submitted ? (
            <div className="py-stack-md text-center">
              <div className="mx-auto mb-stack-md flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                <Icon name="mark_email_read" filled />
              </div>
              <h2 className="mb-stack-sm font-headline-lg-mobile text-headline-lg-mobile text-on-surface dark:text-inverse-on-surface md:font-headline-lg md:text-headline-lg">
                Check your email
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                We&apos;ve sent a verification link to your email. Click it to verify your account and set your
                password.
              </p>
              <Link
                href="/login"
                className="mt-stack-lg inline-flex items-center justify-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
              >
                <Icon name="arrow_back" size={16} />
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-on-surface dark:text-inverse-on-surface md:font-headline-lg md:text-headline-lg">
                Create Account
              </h2>
              <p className="mb-stack-lg font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                Start your 14-day free trial. No credit card required.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
                {formError && (
                  <div className="rounded-lg bg-error-container px-3 py-2 font-body-md text-body-md text-on-error-container">
                    {formError}
                  </div>
                )}
                <Input
                  label="Work Email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Company Name"
                  placeholder="Acme Corp"
                  error={errors.businessName?.message}
                  {...register('businessName')}
                />
                <div className="pt-stack-sm">
                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Create Account
                    <Icon name="arrow_forward" size={18} />
                  </Button>
                </div>
              </form>

              <p className="mt-stack-md text-center font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>

              <div className="mt-stack-lg border-t border-outline-variant pt-stack-md text-center dark:border-outline">
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-primary hover:underline dark:text-inverse-primary">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
