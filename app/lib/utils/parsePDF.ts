import pdf from 'pdf-parse';

export const parsePDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Erro na extração de texto:', error);
    throw new Error('Falha ao processar o PDF');
  }
};