'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { LogoutButton } from '@/components/settings/LogoutButton';
import { cn } from '@/lib/utils';
import { PLAN_LABELS, PLAN_PRODUCT_LIMITS } from '@/lib/plans';
import type { Plan } from '@prisma/client';

const PLAN_ORDER: Plan[] = ['FREE', 'BASIC', 'PRO', 'BUSINESS'];

const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  FREE: 'Great for getting started with a small catalog.',
  BASIC: 'More room to grow your product catalog.',
  PRO: 'For growing businesses with larger inventories.',
  BUSINESS: 'Unlimited products and future team features.',
};

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'security', label: 'Security' },
  { id: 'team', label: 'Team' },
  { id: 'billing', label: 'Billing' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface SettingsViewProps {
  businessName: string;
  email: string;
  memberSince: string;
  plan: Plan;
  productCount: number;
  limit: number | null;
  usagePercent: number;
}

export function SettingsView({
  businessName,
  email,
  memberSince,
  plan,
  productCount,
  limit,
  usagePercent,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  return (
    <div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Settings</h1>
      <p className="mb-stack-lg mt-1 font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
        Manage your workspace, team, and account preferences.
      </p>

      {/* Tabs */}
      <div className="mb-stack-lg border-b border-outline-variant dark:border-outline">
        <nav aria-label="Tabs" className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 font-label-md text-label-md transition-colors',
                activeTab === tab.id
                  ? 'border-primary font-bold text-primary dark:border-inverse-primary dark:text-inverse-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface dark:text-surface-variant dark:hover:text-inverse-on-surface'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab !== 'general' ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-stack-lg text-center">
            <Icon name="hourglass_top" className="text-3xl text-on-surface-variant dark:text-surface-variant" />
            <h2 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface">
              Coming soon
            </h2>
            <p className="max-w-sm font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              {TABS.find((t) => t.id === activeTab)?.label} settings aren&apos;t available yet. Check back in a
              future update.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          {/* Form Section */}
          <div className="flex flex-col gap-stack-lg lg:col-span-8">
            {/* Workspace Profile */}
            <Card>
              <div className="flex flex-col gap-1 border-b border-outline-variant px-stack-md pb-4 pt-stack-md dark:border-outline">
                <h2 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface">
                  Workspace Profile
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  Your company&apos;s basic information.
                </p>
              </div>
              <div className="flex flex-col gap-6 px-stack-md py-stack-md">
                <Input
                  label="Workspace Name"
                  value={businessName}
                  disabled
                  readOnly
                  hint="Renaming your workspace isn't available yet."
                  className="cursor-not-allowed opacity-70"
                />
                <Input label="Email" value={email} disabled readOnly className="cursor-not-allowed opacity-70" />
                <Input
                  label="Member Since"
                  value={memberSince}
                  disabled
                  readOnly
                  className="cursor-not-allowed opacity-70"
                />
                <div>
                  <label className="mb-2 block font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">
                    Workspace Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-highest dark:border-outline dark:bg-surface-container-high/10">
                      <span className="font-headline-md text-headline-md font-bold text-on-surface-variant dark:text-surface-variant">
                        {businessName.trim().charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <Button type="button" variant="secondary" size="sm" disabled>
                      Upload new
                    </Button>
                    <Button type="button" variant="ghost" size="sm" disabled className="text-error">
                      Remove
                    </Button>
                  </div>
                  <p className="mt-2 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                    Logo uploads aren&apos;t available yet.
                  </p>
                </div>
              </div>
            </Card>

            {/* Localization */}
            <Card>
              <div className="flex flex-col gap-1 border-b border-outline-variant px-stack-md pb-4 pt-stack-md dark:border-outline">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface">
                    Localization
                  </h2>
                  <Badge color="gray">Coming soon</Badge>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  Set your default region and language preferences.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 px-stack-md py-stack-md md:grid-cols-2">
                <Select label="Timezone" disabled defaultValue="pacific">
                  <option value="pacific">(GMT-08:00) Pacific Time</option>
                  <option value="eastern">(GMT-05:00) Eastern Time</option>
                  <option value="london">(GMT+00:00) London</option>
                  <option value="cet">(GMT+01:00) Central European Time</option>
                </Select>
                <Select label="Default Currency" disabled defaultValue="usd">
                  <option value="usd">USD - US Dollar</option>
                  <option value="eur">EUR - Euro</option>
                  <option value="gbp">GBP - British Pound</option>
                </Select>
                <div className="md:col-span-2">
                  <Select label="Platform Language" disabled defaultValue="en">
                    <option value="en">English (US)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <div className="rounded-xl border border-error-container bg-surface-container-lowest shadow-card dark:bg-inverse-surface">
              <div className="flex flex-col gap-1 border-b border-error-container px-stack-md pb-4 pt-stack-md">
                <h2 className="font-headline-md text-headline-md text-error">Danger Zone</h2>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  Irreversible and destructive actions.
                </p>
              </div>
              <div className="flex flex-col gap-4 px-stack-md py-stack-md sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-label-md text-label-md font-bold text-on-surface dark:text-inverse-on-surface">
                    Delete Workspace
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                    Permanently remove your workspace and all of its contents from the platform. This action is not
                    reversible. This feature isn&apos;t available yet.
                  </p>
                </div>
                <Button type="button" variant="secondary" disabled className="ml-0 whitespace-nowrap text-error sm:ml-4">
                  Delete Workspace
                </Button>
              </div>
            </div>

            {/* Plan & Usage (real functionality, preserved from the previous screen) */}
            <Card>
              <CardHeader>
                <h2 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface">
                  Plan &amp; Usage
                </h2>
                <Badge color="brand">{PLAN_LABELS[plan]} plan</Badge>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div>
                  <div className="mb-1.5 flex justify-between font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                    <span>Products used</span>
                    <span>
                      {productCount} / {limit ?? 'Unlimited'}
                    </span>
                  </div>
                  {limit && (
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high dark:bg-surface-container-highest/10">
                      <div
                        className={cn('h-full rounded-full', usagePercent >= 90 ? 'bg-amber-500' : 'bg-primary')}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PLAN_ORDER.map((planOption) => (
                    <div
                      key={planOption}
                      className={cn(
                        'rounded-lg border p-4',
                        planOption === plan
                          ? 'border-primary bg-primary/5 dark:border-inverse-primary'
                          : 'border-outline-variant dark:border-outline'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-label-md text-label-md font-bold text-on-surface dark:text-inverse-on-surface">
                          {PLAN_LABELS[planOption]}
                        </p>
                        {planOption === plan && <Badge color="brand">Current</Badge>}
                      </div>
                      <p className="mt-1 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                        {PLAN_DESCRIPTIONS[planOption]}
                      </p>
                      <p className="mt-2 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                        {PLAN_PRODUCT_LIMITS[planOption]
                          ? `Up to ${PLAN_PRODUCT_LIMITS[planOption]} products`
                          : 'Unlimited products'}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Paid plans and upgrades are coming soon — this section previews the plans that will unlock higher
                  product limits and future features like orders, invoices and multi-user access.
                </p>
              </CardBody>
            </Card>

            {/* Session */}
            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface dark:text-inverse-on-surface">
                    Sign out
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                    End your current session on this device.
                  </p>
                </div>
                <LogoutButton />
              </CardBody>
            </Card>
          </div>

          {/* Side Info Area */}
          <div className="flex flex-col gap-stack-md lg:col-span-4">
            <Card className="relative overflow-hidden rounded-xl p-6">
              <Icon name="admin_panel_settings" className="mb-4 block text-3xl text-primary dark:text-inverse-primary" />
              <h3 className="mb-2 font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface">
                Admin Access
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                Only workspace administrators can modify general settings and localization preferences.
              </p>
            </Card>
            <div className="flex items-start gap-4 rounded-xl border border-outline-variant bg-surface-container p-6 shadow-card dark:border-outline dark:bg-surface-container-high/10">
              <Icon name="info" className="text-on-surface-variant dark:text-surface-variant" />
              <div>
                <h4 className="mb-1 font-label-md text-label-md font-bold text-on-background dark:text-inverse-on-surface">
                  Need help?
                </h4>
                <p className="mb-3 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                  Check out our documentation on workspace configuration.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:underline dark:text-inverse-primary"
                >
                  Read Docs
                  <Icon name="arrow_forward" className="text-[14px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
