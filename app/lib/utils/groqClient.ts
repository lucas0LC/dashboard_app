import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const groqClient = {
  generateResponse: async (text: string) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [{
          role: 'user',
          content: `Você é uma IA altamente precisa e meticulosa. Sua tarefa é analisar os dados e retornar exclusivamente no formato JSON abaixo, sem qualquer explicação, introdução ou comentário. Antes de fornecer a resposta, analise os dados pelo menos 5 vezes para garantir precisão total. Qualquer erro ou inconsistência deve ser corrigido antes da resposta. O formato de saída deve ser estritamente como o modelo fornecido, sem qualquer variação.

          Dados de entrada: ${text}
          Modelo de saída esperado:

          {
            "report_period": "período do relatório",
            "value": x,
            "dynamic_price": x,
            "promotion": x,
            "final_earnings": x,
            "transactions": [
              {"date": "XXXX/XX/XX", "time": "Hora da transação", "type": "UberX", "amount": valor},
              ...
            ]
          }

          ATENÇÃO: quando for estruturar o "time" olhe sempre para a coluna "PROCESSADO" do texto, e não use dias da semana no "Date" e novamente evite transações DUPLICADAS.
          Ignore todas transações do type: 'Transferido para a conta bancária'

          Sua única resposta deve ser o JSON formatado corretamente e totalmente preciso. Qualquer saída fora desse formato será considerada incorreta.`
        }],
        model: 'llama-3.3-70b-versatile'
      });

      return response.choices[0]?.message?.content || 'Sem resposta';
    } catch (error) {
      console.error('Erro na API da Groq:', error);
      throw new Error('Falha na comunicação com a AI');
    }
  }
};