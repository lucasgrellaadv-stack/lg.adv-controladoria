// =============================================
// CONFIGURAÇÃO SUPABASE
// Substitua com suas credenciais do projeto Supabase
// Dashboard → Settings → API
// =============================================

import { createClient } from '@supabase/supabase-js'

// ⚠️  SUBSTITUA ESSES VALORES com os do seu projeto Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper: retorna o usuário logado ou null
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper: logout
export async function signOut() {
  await supabase.auth.signOut()
}
