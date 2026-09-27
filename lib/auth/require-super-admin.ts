import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface SuperAdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export async function requireSuperAdmin(): Promise<SuperAdminProfile> {
  let supabase: ReturnType<typeof createClient>;

  try {
    supabase = createClient();
  } catch (error) {
    console.error('[requireSuperAdmin] failed to create Supabase client:', error);
    redirect('/login');
  }

  let user: User | null = null;
  let authError: { message: string } | null = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  } catch (error) {
    console.error('[requireSuperAdmin] session check threw:', error);
    redirect('/login');
  }

  if (authError || !user) {
    redirect('/login');
  }

  let roleRow: { role: 'super_admin' } | null = null;
  let roleError: { message: string } | null = null;
  let profileRow: { full_name: string | null } | null = null;
  let profileError: { message: string } | null = null;

  try {
    const [roleResult, profileResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle<{ role: 'super_admin' }>(),
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle<{ full_name: string | null }>(),
    ]);

    roleRow = roleResult.data;
    roleError = roleResult.error;
    profileRow = profileResult.data;
    profileError = profileResult.error;
  } catch (error) {
    console.error('[requireSuperAdmin] role/profile lookup threw:', error);
    redirect('/login');
  }

  if (roleError || !roleRow || roleRow.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return {
    id: user.id,
    email: user.email ?? '',
    full_name: profileError ? null : profileRow?.full_name ?? null,
    is_active: true,
  };
}

export async function getSuperAdminOrNull(): Promise<SuperAdminProfile | null> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle<{ role: 'super_admin' }>();

    if (!roleRow || roleRow.role !== 'super_admin') return null;

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle<{ full_name: string | null }>();

    return {
      id: user.id,
      email: user.email ?? '',
      full_name: profileRow?.full_name ?? null,
      is_active: true,
    };
  } catch (error) {
    console.error('[getSuperAdminOrNull] lookup failed:', error);
    return null;
  }
}
