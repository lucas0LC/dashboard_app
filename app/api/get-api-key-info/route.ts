import { NextResponse } from 'next/server';
import { createClient } from '../../lib/utils/supabase/server';

interface KeyInfoResponse {
  keyName: string | null;
  keyHint: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ErrorResponse {
  error: string;
}

export async function GET(): Promise<NextResponse<KeyInfoResponse | ErrorResponse>> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data: apiKeyData, error: selectError } = await supabase
      .from('api_keys')
      .select('key_name, key_hint, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error('Erro ao buscar informações da chave API:', selectError.message);
      return NextResponse.json({ error: 'Falha ao buscar informações da chave.' }, { status: 500 });
    }

    if (apiKeyData) {
      return NextResponse.json({
        keyName: apiKeyData.key_name,
        keyHint: apiKeyData.key_hint,
        createdAt: apiKeyData.created_at ? new Date(apiKeyData.created_at).toISOString() : null,
        updatedAt: apiKeyData.updated_at ? new Date(apiKeyData.updated_at).toISOString() : null,
      });
    } else {
      // Nenhuma chave encontrada
      return NextResponse.json({
        keyName: null,
        keyHint: null,
        createdAt: null,
        updatedAt: null,
      });
    }
  } catch (error: any) {
    console.error('Erro inesperado ao buscar informações da chave:', error.message);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}