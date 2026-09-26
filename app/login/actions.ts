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
  return '/admin';
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

  const supabase = createRouteHandlerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const message =
      error?.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : error?.message === 'Email not confirmed'
          ? 'Please confirm your email before signing in.'
          : 'Unable to sign in right now. Please try again.';

    return { status: 'error', message };
  }

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'super_admin')
    .maybeSingle();

  if (roleError || !roleRow || roleRow.role !== 'super_admin') {
    await supabase.auth.signOut();
    return {
      status: 'error',
      message: 'This account does not have Super Admin access.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}
