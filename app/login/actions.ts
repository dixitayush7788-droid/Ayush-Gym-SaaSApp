'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export interface LoginActionState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

export const INITIAL_LOGIN_STATE: LoginActionState = { status: 'idle' };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeRedirectTarget(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw : '';
  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  return '/admin/dashboard';
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = safeRedirectTarget(formData.get('redirectTo'));

  const fieldErrors: LoginActionState['fieldErrors'] = {};

  if (!email) {
    fieldErrors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (!password) {
    fieldErrors.password = 'Password is required.';
  } else if (password.length < 6) {
    fieldErrors.password = 'Password must be at least 6 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      fieldErrors,
    };
  }

  let supabase: ReturnType<typeof createRouteHandlerClient>;

  try {
    supabase = createRouteHandlerClient();
  } catch (error) {
    console.error('[loginAction] failed to create Supabase client:', error);
    return {
      status: 'error',
      message: 'Authentication service is temporarily unavailable. Please try again.',
    };
  }

  let data;
  let error;

  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    data = result.data;
    error = result.error;
  } catch (error) {
    console.error('[loginAction] sign-in request threw:', error);
    return {
      status: 'error',
      message: 'Unable to sign in right now. Please try again.',
    };
  }

  if (error || !data.user) {
    const message =
      error?.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : error?.message === 'Email not confirmed'
          ? 'Please confirm your email before signing in.'
          : 'Unable to sign in right now. Please try again.';

    return { status: 'error', message };
  }

  let roleRow: { role: 'super_admin' } | null = null;
  let roleError: { message: string } | null = null;

  try {
    const result = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'super_admin')
      .maybeSingle<{ role: 'super_admin' }>();

    roleRow = result.data;
    roleError = result.error;
  } catch (error) {
    console.error('[loginAction] role lookup threw:', error);
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('[loginAction] cleanup sign-out failed:', signOutError);
    }

    return {
      status: 'error',
      message: 'Unable to verify Super Admin access right now. Please try again.',
    };
  }

  if (roleError || !roleRow || roleRow.role !== 'super_admin') {
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('[loginAction] cleanup sign-out failed:', signOutError);
    }

    return {
      status: 'error',
      message: 'This account does not have Super Admin access.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}
