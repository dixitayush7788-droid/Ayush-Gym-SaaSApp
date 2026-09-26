// app/admin/gyms/new/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSuperAdmin } from '@/lib/auth/require-super-admin';
import { createRouteHandlerClient } from '@/lib/supabase/server';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface OnboardGymState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<
    Record<
      | 'gym_name'
      | 'owner_name'
      | 'owner_phone'
      | 'owner_email'
      | 'subscription_plan'
      | 'subscription_start_date'
      | 'subscription_end_date'
      | 'subscription_price',
      string
    >
  >;
}

export const INITIAL_ONBOARD_STATE: OnboardGymState = { status: 'idle' };

// -----------------------------------------------------------------------------
// Validation helpers
// -----------------------------------------------------------------------------
/** Converts a free-form gym name into a URL-safe slug. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Accepts an Indian mobile number and returns E.164 (+91XXXXXXXXXX) or null. */
function normaliseIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  // Accept: 10 digits, or 91 + 10 digits, or 0 + 10 digits
  let core: string;
  if (digits.length === 10) core = digits;
  else if (digits.length === 11 && digits.startsWith('0')) core = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('91')) core = digits.slice(2);
  else return null;

  // First digit of an Indian mobile must be 6–9
  if (!/^[6-9]\d{9}$/.test(core)) return null;

  return `+91${core}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Adds N calendar months to a date without rolling past month-end. */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);
  // If the target month is shorter, setMonth rolls over — correct that.
  if (result.getDate() < day) result.setDate(0);
  return result;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------
export async function onboardGymAction(
  _prevState: OnboardGymState,
  formData: FormData
): Promise<OnboardGymState> {
  // Defense in depth — never trust the middleware alone for a mutation.
  const admin = await requireSuperAdmin();

  // ---------- Extract ----------
  const gymName = String(formData.get('gym_name') ?? '').trim();
  const ownerName = String(formData.get('owner_name') ?? '').trim();
  const rawPhone = String(formData.get('owner_phone') ?? '').trim();
  const ownerEmail = String(formData.get('owner_email') ?? '').trim().toLowerCase();
  const plan = String(formData.get('subscription_plan') ?? '1_month');
  const startDateRaw = String(formData.get('subscription_start_date') ?? '').trim();
  const endDateRaw = String(formData.get('subscription_end_date') ?? '').trim();
  const priceRaw = String(formData.get('subscription_price') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'INR').trim().toUpperCase();

  // ---------- Validate ----------
  const fieldErrors: OnboardGymState['fieldErrors'] = {};

  if (gymName.length < 2) {
    fieldErrors.gym_name = 'Gym name must be at least 2 characters.';
  }

  if (ownerName.length < 2) {
    fieldErrors.owner_name = 'Owner name must be at least 2 characters.';
  }

  const normalisedPhone = normaliseIndianPhone(rawPhone);
  if (!normalisedPhone) {
    fieldErrors.owner_phone =
      'Enter a valid Indian mobile number (10 digits, starting with 6–9).';
  }

  if (!isValidEmail(ownerEmail)) {
    fieldErrors.owner_email = 'Enter a valid email address.';
  }

  const validPlans = ['1_month', '2_months', '3_months', 'custom'] as const;
  type Plan = (typeof validPlans)[number];
  if (!validPlans.includes(plan as Plan)) {
    fieldErrors.subscription_plan = 'Select a valid subscription plan.';
  }

  const startDate = startDateRaw ? new Date(startDateRaw) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    fieldErrors.subscription_start_date = 'Invalid start date.';
  }

  let endDate: Date | null = null;
  if (plan === 'custom') {
    if (!endDateRaw) {
      fieldErrors.subscription_end_date = 'Pick a custom end date.';
    } else {
      const parsed = new Date(endDateRaw);
      if (Number.isNaN(parsed.getTime())) {
        fieldErrors.subscription_end_date = 'Invalid end date.';
      } else if (parsed < startDate) {
        fieldErrors.subscription_end_date =
          'End date must be on or after the start date.';
      } else {
        endDate = parsed;
      }
    }
  } else if (!Number.isNaN(startDate.getTime())) {
    const monthMap: Record<Exclude<Plan, 'custom'>, number> = {
      '1_month': 1,
      '2_months': 2,
      '3_months': 3,
    };
    endDate = addMonths(startDate, monthMap[plan as Exclude<Plan, 'custom'>]);
  }

  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    fieldErrors.subscription_price = 'Enter a valid non-negative price.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      fieldErrors,
    };
  }

  // ---------- Insert ----------
  // At this point all values are validated. TypeScript needs the `!` on
  // endDate because it can't track the branch analysis above.
  const supabase = createRouteHandlerClient();

  const baseSlug = slugify(gymName) || 'gym';
  const uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await supabase.from('tenants').insert({
    gym_name: gymName,
    slug: uniqueSlug,
    owner_name: ownerName,
    owner_email: ownerEmail,
    owner_phone: normalisedPhone!,
    owner_phone_country_code: '+91',
    subscription_plan: plan,
    subscription_start_date: toISODate(startDate),
    subscription_end_date: toISODate(endDate!),
    subscription_price: price,
    currency,
    status: 'active',
    operational_status: 'closed',
    onboarded_by: admin.id,
  });

  if (error) {
    // Unique-slug race is the only realistic conflict here.
    if (error.code === '23505') {
      return {
        status: 'error',
        message: 'A gym with this identifier already exists. Please retry.',
      };
    }
    console.error('[onboardGymAction] insert failed:', error.message);
    return {
      status: 'error',
      message: 'Failed to onboard gym. Please try again.',
    };
  }

  // ---------- Success ----------
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/gyms');

  // Redirect to the gyms list (or a future detail page).
  redirect('/admin/gyms?onboarded=1');
}
