import { NextResponse } from 'next/server';
import { parsePDF } from '../../lib/utils/parsePDF';
import { groqClient } from '../../lib/utils/groqClient';
import { processData } from '../../lib/utils/processParsedData'
import { insertDataToSupabase } from '../../lib/utils/supabase/supabaseClient';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    // Extrair os dados do formulário enviado
    const formData = await request.formData();
    const fileField = formData.get('file');

    // Verificar se o campo "file" existe e se é um arquivo (Blob/File)
    if (!fileField || typeof fileField === 'string') {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Envie um PDF.' },
        { status: 400 }
      );
    }

    // Verifica se o tipo do arquivo é PDF
    if (fileField.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Envie um PDF.' },
        { status: 400 }
      );
    }

    // Converter o arquivo para Buffer
    const arrayBuffer = await fileField.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extrair texto do PDF
    const parsedData = await parsePDF(buffer);
    
    // Verificar se o texto foi extraído
    if (!parsedData.transacoes.length && !parsedData.header.length) {
      return NextResponse.json(
        { error: 'Nenhum dado estruturado encontrado no PDF' },
        { status: 400 }
      );
    }

    const extractedText = JSON.stringify(parsedData);
    const dadosProcessado = await processData(extractedText)
    console.log(dadosProcessado);
    
    // Chamar a função para inserir os dados no Supabase
    const insertResult = await insertDataToSupabase(dadosProcessado);

    if (insertResult.error) {
      return NextResponse.json(

        { error: 'Erro ao inserir dados no banco' },
        { status: 500 }
      );

    }


    return NextResponse.json({ message: 'Dados inseridos com sucesso', data: insertResult.data });
    

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}