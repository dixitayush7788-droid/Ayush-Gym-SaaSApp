import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface SuperAdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export async function requireSuperAdmin(): Promise<SuperAdminProfile> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const [{ data: roleRow, error: roleError }, { data: profileRow, error: profileError }] =
    await Promise.all([
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle<{ full_name: string | null }>(),
    ]);

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
    .maybeSingle();

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
}
