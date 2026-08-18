'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeClasses: Record<ToastType, string> = {
  success: 'bg-tertiary text-on-tertiary',
  error: 'bg-error text-on-error',
  info: 'bg-inverse-surface text-inverse-on-surface',
};

const TOAST_DURATION = 4000;
const EXIT_DURATION = 200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'toast-root';
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {container &&
        createPortal(
          <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map((t) => (
              <ToastMessage key={t.id} toast={t} onRemove={removeToast} />
            ))}
          </div>,
          container
        )}
    </ToastContext.Provider>
  );
}

type Phase = 'enter' | 'visible' | 'leave';

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const [phase, setPhase] = useState<Phase>('enter');

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase('visible'));
    const hideTimer = setTimeout(() => setPhase('leave'), TOAST_DURATION);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'leave') return;
    const removeTimer = setTimeout(() => onRemove(toast.id), EXIT_DURATION);
    return () => clearTimeout(removeTimer);
  }, [phase, onRemove, toast.id]);

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 font-body-md text-body-md font-medium shadow-card transition-all duration-200 ease-out',
        phase === 'visible' ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        typeClasses[toast.type]
      )}
    >
      {toast.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
