"use server";
import { NextResponse } from 'next/server';
import { createClient } from '../../lib/utils/supabase/server';
import { generateNewApiKey, hashApiKey } from '../../lib/utils/APIKey';

interface SuccessResponseData {
  message: string;
  apiKey: string;
  keyName: string;
  keyHint: string;
}

interface ErrorResponseData {
  error: string;
}

export async function POST(req: Request): Promise<NextResponse<SuccessResponseData | ErrorResponseData>> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Erro de autenticação:', userError?.message || 'Usuário não encontrado');
    return NextResponse.json({ error: 'Não autorizado: Usuário não autenticado.' }, { status: 401 });
  }

  const userId = user.id;
  let keyNameInput: string;

  try {
    const body = await req.json();
    keyNameInput = body.keyName?.trim() || `Chave API Padrão`; // Nome padrão
  } catch (e: any) {
    return NextResponse.json({ error: 'Corpo da requisição inválido ou ausente.' }, { status: 400 });
  }

  try {
    const newApiKey = generateNewApiKey();
    const hashedApiKey = hashApiKey(newApiKey);
    const keyHint = `${newApiKey.substring(0, 4)}...${newApiKey.substring(newApiKey.length - 4)}`;
    const now = new Date().toISOString();

    const { data: upsertedData, error: upsertError } = await supabase
      .from('api_keys')
      .upsert(
        {
          user_id: userId,
          key_hash: hashedApiKey,
          key_name: keyNameInput,
          key_hint: keyHint
        },
        {
          onConflict: 'user_id'
        }
      )
      .select('key_name, key_hint, updated_at')
      .single();

    if (upsertError) {
      console.error('Erro no upsert da chave API no Supabase:', upsertError.message);
      return NextResponse.json(
        { error: `Falha ao salvar a chave API: ${upsertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: upsertedData ? 'Chave de API atualizada com sucesso!' : 'Chave de API gerada com sucesso!',
      apiKey: newApiKey,
      keyName: upsertedData?.key_name || keyNameInput,
      keyHint: upsertedData?.key_hint || keyHint,
      updatedAt: upsertedData?.updated_at ? new Date(upsertedData.updated_at).toISOString() : now,
    });

  } catch (error: any) {
    console.error('Erro inesperado na geração/atualização da chave de API:', error.message);
    return NextResponse.json(
      { error: error.message || 'Falha ao processar a chave de API.' },
      { status: 500 }
    );
  }
}