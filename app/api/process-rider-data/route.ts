import { NextResponse } from 'next/server';
import { createAdminClient } from '../../lib/utils/supabase/server';
import { hashApiKey } from '../../lib/utils/APIKey';

interface reqBody {
  apiKey: string;
  Geo?: {
    latitude?: number;
    longitude?: number;
  };
  categoria?: string;
  valor_corrida?: number;
  nota_passageiro?: number;
  endereco_destino?: {
    endereco?: string;
    estado?: string;
    cep?: string;
  };
  [key: string]: any; 
}

interface tripData {
  user_id: string;
  latitude: number;
  longitude: number;
  categoria?: string | null;
  valor_corrida?: number | null;
  nota_passageiro?: number | null;
  endereco_destino?: object | null;
}

export async function POST(req: Request) {
  let requestBody: reqBody;

  try {
    requestBody = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Corpo da requisição inválido: não é JSON válido.' }, { status: 400 });
  }

  const { apiKey, Geo, categoria, valor_corrida, nota_passageiro, endereco_destino } = requestBody;

  if (!apiKey) {
    return NextResponse.json({ error: 'apiKey é obrigatória.' }, { status: 400 });
  }

  // Validar a API Key
  const supabaseAdmin = await createAdminClient();
  const hashedReceivedApiKey = hashApiKey(apiKey);

  const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
    .from('api_keys')
    .select('user_id') // Seleciona o user_id associado à chave
    .eq('key_hash', hashedReceivedApiKey) // Compara os hash
    .single();

  if (apiKeyError || !apiKeyData) {
    console.error('Erro ao validar API key ou chave não encontrada:', apiKeyError?.message);
    return NextResponse.json({ error: 'apiKey inválida ou não encontrada.' }, { status: 401 });
  }

  const userId = apiKeyData.user_id;

  if (!Geo || typeof Geo.latitude !== 'number' || typeof Geo.longitude !== 'number') {
    return NextResponse.json({ error: 'Dados de GeoLocalização (latitude, longitude) são obrigatórios e devem ser números.' }, { status: 400 });
  }

  const dataToStore: tripData = {
    user_id: userId,
    latitude: Geo.latitude,
    longitude: Geo.longitude,
    categoria: categoria || null,
    valor_corrida: typeof valor_corrida === 'number' ? valor_corrida : null,
    nota_passageiro: typeof nota_passageiro === 'number' ? nota_passageiro : null,
    endereco_destino: endereco_destino || null, // Armazena o objeto inteiro ou null
  };

  const { data: insertedData, error: insertError } = await supabaseAdmin
    .from('corridas_registradas')
    .insert(dataToStore);

  if (insertError) {
    console.error('Erro ao inserir dados da corrida no Supabase:', insertError.message);
    return NextResponse.json({ error: `Falha ao armazenar dados da corrida: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json(
    { message: 'Dados recebidos e armazenados com sucesso!' },
    { status: 201 }
  );
}