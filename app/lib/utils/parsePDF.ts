import pdf from 'pdf-parse';
import { RawTransaction, RawHeader } from '../../dataInterfaces'

interface Detalhe {
  descricao: string;
  valor: string;
}

interface ParsedPDF {
  header: RawHeader[];
  transacoes: RawTransaction[];
}

const regexDetalhamentoGanhos = /Relatório semanal\r?\n(.+?)\r?\nDetalhamento de Seus ganhos\r?\n([\s\S]+?)(?=(?:\r?\n){2,}[^\r\n]* of \d+|\r?\nSeus ganhosR\$)/gi;

function processarDetalhes(conteudo: string): Detalhe[] {
  const linhas = conteudo.split(/\r?\n/g)
    .filter(linha => {
      const limpa = linha.trim();
      return limpa && !limpa.startsWith('Para mais informações');
    });

  const contador: Record<string, number> = {};
  const detalhesUnicos: Detalhe[] = [];

  linhas.forEach(linha => {
    const [descricaoBruta, valorBruto] = linha.split(/(?=R\$)/);
    const descricao = descricaoBruta.replace(/[^\w\sà-ú]/gi, ' ').trim();
    const valor = valorBruto?.replace(/\s/g, '') || '';

    const count = (contador[descricao] || 0) + 1;
    contador[descricao] = count;

    const descricaoFormatada = count > 1 
      ? `${descricao} ${count}` 
      : descricao;

    detalhesUnicos.push({
      descricao: descricaoFormatada,
      valor: valor
    });
  });

  return detalhesUnicos;
}

function extrairDetalhamento(resumo: string): RawHeader[] {
  try {
    const matches = [...resumo.matchAll(regexDetalhamentoGanhos)];
    
    return matches.map(([, periodo, conteudo]) => {
      const detalhes = processarDetalhes(conteudo);
      const totalMatch = resumo.match(/Seus ganhosR\$\s*([\d.,]+)/);
      
      return {
        periodo: periodo.trim(),
        detalhes: detalhes,
        total: totalMatch?.[1] ? `R$${totalMatch[1]}` : ""
      };
    });
    
  } catch (error) {
    console.error('Erro na extração:', error);
    return [];
  }
}

function processarTransacoes(texto: string): RawTransaction[] {
  const linhas = texto
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const transacoes: RawTransaction[] = [];
  let i = 0;

  try {
    while (i < linhas.length) {
      if (linhas[i].match(
        /^(seg|ter|qua|qui|sex|sáb|dom)\.?, \d{1,2} de [a-zç]{3}\.?/,
      )) {
        const transacao: RawTransaction = {
          date_end: linhas[i++],
          time_end: linhas[i++],
          type: "",
          datetime_start: "",
          ganho: "",
          saldo_atual: "",
        };

        const typeParts: string[] = [];

        while (
          i < linhas.length &&
          !linhas[i].match(/^\d{1,2} de [a-zç]{3}\. \d+/)
        ) {
          typeParts.push(linhas[i++]);
        }
        transacao.type = typeParts.join(" ").replace(/\s+/g, " ").trim();

        if (i + 3 < linhas.length) {
          transacao.datetime_start = linhas[i++];
          transacao.ganho = linhas[i++];
          transacao.saldo_atual = linhas[i++];

          transacoes.push(transacao);
        }
      } else {
        i++;
      }
    }
  } catch (e) {
    console.error("Erro no processamento manual:", e, "Na posição:", i);
  }

  return transacoes
    .map((transacao) => ({
      ...transacao,
      time_end: formatarHora(transacao.time_end),
      datetime_start: formatarDataHora(transacao.datetime_start),
    }))
    .filter((transacao) => transacao.type === "UberX");
}

function formatarHora(rawTime: string): string {
  const digits = rawTime.replace(/[^\d]/g, '');
  return digits.padStart(4, '0');
}

function formatarDataHora(rawDateTime: string): string {
  const [datePart,] = rawDateTime.split('.');
  const timePart = rawDateTime.split(' ').pop();
  
  const formattedTime = formatarHora(timePart || '');
  
  // Remove espaços extras e reconstrói
  return `${datePart.trim()} ${formattedTime}`;
}

export const parsePDF = async (buffer: Buffer): Promise<ParsedPDF> => {
  try {
    const data = await pdf(buffer);
    const [_, headerContent, transacoesContent] = data.text.match(/(.*?)(Transações[\s\S]*)/s) || [];

    if (!transacoesContent) {
      console.log("Nenhuma transação encontrada no documento");
      return { header: [], transacoes: [] };
    }

    return {
      header: extrairDetalhamento(headerContent || ''),
      transacoes: processarTransacoes(transacoesContent),
    };
  } catch (error) {
    console.error('Erro na extração de texto:', error);
    throw new Error('Falha ao processar o PDF');
  }
};