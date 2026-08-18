'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">
      {children}
    </label>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError(
        result.error.includes('verify your email') ? result.error : 'Invalid email or password'
      );
      return;
    }

    router.push(searchParams.get('callbackUrl') ?? '/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      {formError && (
        <div className="rounded-lg bg-error-container px-3 py-2 font-body-md text-body-md text-on-error-container">
          {formError}
        </div>
      )}

      <div>
        <FieldLabel htmlFor="email">Email Address</FieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant dark:text-surface-variant">
            <Icon name="mail" size={20} />
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={cn(
              'block w-full rounded-lg border bg-surface-container-lowest py-2 pl-10 pr-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 dark:bg-inverse-surface dark:text-inverse-on-surface',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.email ? 'border-error' : 'border-outline-variant dark:border-outline'
            )}
            {...register('email')}
          />
        </div>
        {errors.email?.message && <p className="mt-1 font-label-md text-label-md text-error">{errors.email.message}</p>}
      </div>

      <div>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant dark:text-surface-variant">
            <Icon name="lock" size={20} />
          </span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              'block w-full rounded-lg border bg-surface-container-lowest py-2 pl-10 pr-10 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 dark:bg-inverse-surface dark:text-inverse-on-surface',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              errors.password ? 'border-error' : 'border-outline-variant dark:border-outline'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface dark:text-surface-variant dark:hover:text-inverse-on-surface"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        </div>
        {errors.password?.message && <p className="mt-1 font-label-md text-label-md text-error">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 dark:border-outline"
          />
          <span className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">Remember this device</span>
        </label>
        <Link
          href="/forgot-password"
          className="font-body-md text-body-md text-primary transition-colors hover:text-primary-container dark:text-inverse-primary"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="mt-1 w-full" isLoading={isSubmitting}>
        Sign In
      </Button>

      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-outline-variant dark:border-outline" />
        <span className="mx-4 flex-shrink-0 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
          or continue with
        </span>
        <div className="flex-grow border-t border-outline-variant dark:border-outline" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => signIn('google', { callbackUrl: searchParams.get('callbackUrl') ?? '/dashboard' })}
      >
        <GoogleIcon />
        Sign in with Google
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-surface-container-lowest dark:bg-inverse-surface">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-margin-mobile py-margin-desktop lg:w-[58%] lg:px-[8%] xl:px-[10%]">
        <div className="mx-auto w-full max-w-[420px]">
          <Logo size="md" />

          <div className="mb-stack-lg mt-stack-lg">
            <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              Enter your credentials to manage your inventory and live shipments.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <Link
            href="/signup"
            className="mt-stack-lg block w-full rounded-lg border-2 border-primary/30 py-2.5 text-center font-label-md text-label-md text-primary transition-colors hover:bg-primary/5 dark:border-inverse-primary/30 dark:text-inverse-primary dark:hover:bg-inverse-primary/10"
          >
            Create new account
          </Link>
        </div>
      </div>

      {/* Right: ambient brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0b0f1a] lg:flex lg:w-[42%] lg:flex-col lg:justify-end">
        {/* Warehouse-aisle mood background: layered glow + receding grid lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.35),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 64px)',
            }}
          />
          <div
            className="absolute inset-0 [perspective:600px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 48px)',
              transform: 'rotateX(55deg) scale(2)',
              transformOrigin: 'top',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0b0f1a] via-[#0b0f1a]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f1a]/40 via-transparent to-[#0b0f1a]/70" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-label-md text-label-md text-white/80">System Status: All Nodes Operational</span>
          </div>

          <div className="flex-1" />

          <div>
            <h2 className="mb-3 font-display text-[40px] font-bold leading-[1.1] text-white">
              Your stock, organized. Finally.
            </h2>
            <p className="mb-6 max-w-md font-body-lg text-body-lg text-white/70">
              ProductDesk gives you real-time visibility into every product, and warehouse movement — all in one
              place.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="mb-1 font-label-md text-label-md text-white/60">Total Items Logged</p>
                <p className="font-display text-headline-lg text-white">
                  842,912 <span className="font-label-md text-label-md text-emerald-400">+12.3%</span>
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="mb-1 font-label-md text-label-md text-white/60">Active Dispatches</p>
                <p className="font-display text-headline-lg text-white">
                  1,480 <span className="font-label-md text-label-md text-fuchsia-400">Live Tracked</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <p className="max-w-md font-body-md text-body-md italic text-white/70">
            &quot;Implementing ProductDesk reduced our fulfillment times by 30% inside the first month. The
            predictive restocking engine does the heavy lifting for us.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
