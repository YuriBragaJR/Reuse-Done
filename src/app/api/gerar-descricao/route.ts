import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { titulo, categoria, condicao, tipo, preco } = await req.json();

    if (!titulo) {
      return NextResponse.json({ error: 'Título não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `Você é um copywriter especialista em e-commerce e economia circular da plataforma ReUse.
Sua missão é criar uma descrição única, realista e altamente adaptada às especificações exatas do produto fornecido pelo usuário.

REGRAS DE CONTEXTO E ESPECIFICIDADE (OBRIGATÓRIO):
- Analise os dados recebidos (Título, Categoria, Condição, Tipo e Preço) e adapte completamente o vocabulário.
- Se for Eletrônicos: use tom focado em desempenho, conservação e usabilidade.
- Se for Livros: use tom cultural, envolvente ou literário.
- Se for Roupas/Móveis: destaque estilo, preservação, estética e utilidade no dia a dia.
- Se o tipo for "doação": enfatize a oportunidade de presente e o gesto de doação sem custos.
- Se o tipo for "venda": mencione o excelente custo-benefício em relação à condição ("${condicao}").
- NUNCA use clichês repetitivos como "Dando uma nova vida", "Ótima oportunidade", "Ajudar o meio ambiente".
- Escreva de 2 a 4 frases diretas, cativantes e autênticas.
- Gere de 3 a 5 hashtags específicas do Nicho/Produto.

Responda EXATAMENTE neste formato JSON estrito:
{
  "descricao": "Texto da descrição aqui...",
  "tags": "#tag1 #tag2 #tag3"
}`;

        const promptUsuario = `Gere uma descrição altamente específica para o seguinte item:
- Título: ${titulo}
- Categoria: ${categoria || 'Não informada'}
- Condição do produto: ${condicao || 'Usado'}
- Tipo de anúncio: ${tipo === 'doacao' ? 'Doação Gratuita' : 'Venda'}
${tipo === 'venda' && preco ? `- Preço definido: R$ ${preco}` : ''}`;

        const apiDomain = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        const response = await fetch(`${apiDomain}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptUsuario }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.85,
              topP: 0.95,
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  descricao: { type: 'STRING' },
                  tags: { type: 'STRING' }
                },
                required: ['descricao', 'tags']
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json(parsed);
          }
        }
      } catch (apiError) {
        console.warn('API do Google com instabilidade no gerador de descrições. Usando fallback.');
      }
    }

    // Fallback inteligente com dados específicos caso a API fique indisponível
    const detalhePreco = tipo === 'doacao' ? 'Disponível gratuitamente para retirada.' : `Em ótimo estado por apenas R$ ${preco || 'um preço especial'}.`;
    return NextResponse.json({
      descricao: `${titulo} em condição ${condicao.toLowerCase()}. Excelente opção na categoria de ${categoria.toLowerCase() || 'desapegos'}. ${detalhePreco}`,
      tags: `#ReUse #${categoria.replace(/\s+/g, '') || 'Desapego'} #${condicao.replace(/\s+/g, '')}`
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}