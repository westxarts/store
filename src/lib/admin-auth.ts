import { supabase } from "@/integrations/supabase/client";

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  
  // Check admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  
  if (!roleData) {
    await supabase.auth.signOut();
    throw new Error("You do not have admin access.");
  }
  
  return data;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("role", "admin")
    .maybeSingle();
  
  if (!roleData) return null;
  return session;
}
