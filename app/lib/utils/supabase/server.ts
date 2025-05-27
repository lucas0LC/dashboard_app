import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método `setAll` foi chamado de um componente de servidor.
            // Isso pode ser ignorado se você tiver um middleware atualizando
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  // Para o service role, os cookies são menos relevantes para a sessão do cliente
  // mas o createServerClient do @supabase/ssr ainda espera a interface.
  // Eles podem ser no-op se o cliente de serviço não estiver gerenciando cookies de sessão de usuário.
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método `setAll` foi chamado de um componente de servidor.
            // Isso pode ser ignorado se você tiver um middleware atualizando
            // user sessions.
          }
        },
      },
      auth: { //configurar para não gerenciar sessão com o cliente de serviço(ROLE_KEY)
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};