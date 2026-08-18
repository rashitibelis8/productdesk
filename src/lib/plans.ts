import { Plan } from '@prisma/client';

export const LOW_STOCK_THRESHOLD = 5;

export const PLAN_PRODUCT_LIMITS: Record<Plan, number | null> = {
  FREE: 20,
  BASIC: 100,
  PRO: 1000,
  BUSINESS: null, // unlimited
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: 'Free',
  BASIC: 'Basic',
  PRO: 'Pro',
  BUSINESS: 'Business',
};

export function getProductLimit(plan: Plan): number | null {
  return PLAN_PRODUCT_LIMITS[plan];
}

export function isAtProductLimit(plan: Plan, currentCount: number): boolean {
  const limit = getProductLimit(plan);
  if (limit === null) return false;
  return currentCount >= limit;
}
