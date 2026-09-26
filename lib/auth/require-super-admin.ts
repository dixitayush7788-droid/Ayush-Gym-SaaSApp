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

  const { data, error } = await supabase
    .from('super_admins')
    .select('id, email, full_name, is_active')
    .eq('id', user.id)
    .maybeSingle<SuperAdminProfile>();

  if (error || !data || data.is_active !== true) {
    redirect('/unauthorized');
  }

  return data;
}

export async function getSuperAdminOrNull(): Promise<SuperAdminProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('super_admins')
    .select('id, email, full_name, is_active')
    .eq('id', user.id)
    .maybeSingle<SuperAdminProfile>();

  return data?.is_active ? data : null;
}
