'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

const formSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormInput = z.infer<typeof formSchema>;

type StrengthLevel = {
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  bar: string;
  text: string;
};

const STRENGTH_LEVELS: StrengthLevel[] = [
  { label: 'Weak', bar: 'bg-error', text: 'text-error' },
  { label: 'Weak', bar: 'bg-error', text: 'text-error' },
  { label: 'Fair', bar: 'bg-outline', text: 'text-outline dark:text-surface-variant' },
  { label: 'Good', bar: 'bg-primary dark:bg-inverse-primary', text: 'text-primary dark:text-inverse-primary' },
  { label: 'Strong', bar: 'bg-tertiary dark:bg-tertiary-fixed', text: 'text-tertiary dark:text-tertiary-fixed' },
];

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return { score, ...STRENGTH_LEVELS[score] };
}

function PasswordField({
  id,
  label,
  registration,
  error,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="new-password"
          className={cn(
            'block w-full rounded-lg border bg-surface-container-lowest px-3 py-2 pr-10 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 dark:bg-inverse-surface dark:text-inverse-on-surface',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            error ? 'border-error' : 'border-outline-variant dark:border-outline'
          )}
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition-colors hover:text-on-surface dark:text-surface-variant dark:hover:text-inverse-on-surface"
        >
          <Icon name={show ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
      {error && <p className="mt-1 font-label-md text-label-md text-error">{error}</p>}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = async (data: FormInput) => {
    setFormError(null);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password, confirmPassword: data.confirmPassword }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Something went wrong');
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (!token) {
    return (
      <p className="font-body-md text-body-md text-error">
        This reset link is missing a token. Please request a new one.
      </p>
    );
  }

  if (success) {
    return (
      <div className="space-y-stack-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
          <Icon name="check" filled />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
          Password Reset Complete
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
          Your password has been successfully updated. Redirecting to sign in&hellip;
        </p>
      </div>
    );
  }

  const strength = getPasswordStrength(passwordValue);
  const barsFilled = passwordValue ? Math.max(strength.score, 1) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
      {formError && (
        <div className="rounded-lg bg-error-container px-3 py-2 font-body-md text-body-md text-on-error-container">
          {formError}
        </div>
      )}

      <div>
        <PasswordField
          id="new-password"
          label="New Password"
          registration={register('password')}
          error={errors.password?.message}
          show={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
        />
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
              Password strength
            </span>
            <span
              className={cn(
                'font-label-md text-label-md',
                passwordValue ? strength.text : 'text-on-surface-variant dark:text-surface-variant'
              )}
            >
              {passwordValue ? strength.label : 'Weak'}
            </span>
          </div>
          <div className="flex h-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-full w-full overflow-hidden rounded-full bg-surface-variant dark:bg-outline/30"
              >
                <div
                  className={cn('h-full rounded-full transition-all duration-300', i < barsFilled ? strength.bar : 'w-0')}
                  style={{ width: i < barsFilled ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword?.message}
        show={showConfirmPassword}
        onToggle={() => setShowConfirmPassword((s) => !s)}
      />

      <Button type="submit" className="mt-stack-md w-full" isLoading={isSubmitting}>
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-margin-mobile py-margin-desktop dark:bg-inverse-surface md:px-margin-desktop">
      {/* Ambient background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed via-transparent to-transparent opacity-20 dark:from-primary/30" />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card dark:border-outline dark:bg-inverse-surface">
        <div className="p-stack-lg">
          <div className="mb-stack-lg text-center">
            <div className="mb-stack-sm inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name="lock_reset" filled />
            </div>
            <h1 className="mb-1 font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">
              Set New Password
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <div className="rounded-b-xl border-t border-outline-variant bg-surface-container-lowest p-stack-md text-center dark:border-outline dark:bg-inverse-surface">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
          >
            <Icon name="arrow_back" size={16} />
            Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}
