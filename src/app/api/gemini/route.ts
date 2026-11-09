import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let userText = '';
  
  try {
    const body = await req.json();
    userText = (body.text || '').trim();
    const mensagemLower = userText.toLowerCase();

    // Detecção local de intenções comuns de navegação
    let targetRoute = '';
    if (mensagemLower.includes('desapegar') || mensagemLower.includes('doar') || mensagemLower.includes('vender') || mensagemLower.includes('cadastrar')) {
      targetRoute = '/desapegar';
    } else if (mensagemLower.includes('meus desapegos') || mensagemLower.includes('meus anúncios')) {
      targetRoute = '/painel/desapegos';
    } else if (mensagemLower.includes('resgates')) {
      targetRoute = '/painel/resgates';
    } else if (mensagemLower.includes('salvos') || mensagemLower.includes('favoritos')) {
      targetRoute = '/painel/salvos';
    } else if (mensagemLower.includes('cesta') || mensagemLower.includes('carrinho')) {
      targetRoute = '/cesta';
    } else if (mensagemLower.includes('painel') || mensagemLower.includes('perfil')) {
      targetRoute = '/painel';
    } else if (mensagemLower.includes('mensagens') || mensagemLower.includes('perfil')) {
      targetRoute = '/painel/mensagens';
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        // ADICIONADO: A rota /cesta agora está listada nas instruções da IA
        const systemInstruction = `Você é o assistente virtual da plataforma ReUse, focado em economia circular, trocas e doações.
Sua função é orientar os usuários e identificar para qual página eles desejam ir.
As rotas disponíveis no site são:
- "/desapegar" (para criar doações, cadastrar itens ou vender)
- "/painel/desapegos" (para ver os desapegos cadastrados pelo usuário)
- "/painel/resgates" (para ver itens resgatados)
- "/painel/salvos" (para ver itens salvos/favoritos)
- "/painel" (para o painel geral)
- "/cesta" (para ver os itens adicionados na cesta ou carrinho)
- "/painel/mensagens" (para ver as mensagens)

Analise a mensagem do usuário e preencha "reply" com a resposta amigável e "route" com a URL exata para onde ele deve ser redirecionado (se houver intenção clara de navegação). Se não houver, deixe "route" como string vazia.
Responda sempre em formato JSON estrito:
{
  "reply": "Texto da resposta...",
  "route": "/caminho-ou-vazio"
}`;

        const apiDomain = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        const response = await fetch(`${apiDomain}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  reply: { type: 'STRING' },
                  route: { type: 'STRING' },
                },
                required: ['reply', 'route'],
              },
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              reply: [{ response_type: 'text', text: parsed.reply || 'Como posso ajudar?' }],
              route: parsed.route || targetRoute,
            });
          }
        }
      } catch (apiError) {
        console.warn('API do Google instável. Usando inteligência local.');
      }
    }

    // Fallback inteligente caso a API falhe
    let respostaTexto = "Entendido! Como posso te ajudar com isso?";
    if (targetRoute === '/desapegar') respostaTexto = "Claro! Vou te levar para a página de cadastro de desapegos...";
    else if (targetRoute === '/painel/desapegos') respostaTexto = "Abrindo seus desapegos...";
    else if (targetRoute === '/painel/resgates') respostaTexto = "Indo para os seus resgates...";
    else if (targetRoute === '/cesta') respostaTexto = "Abrindo sua cesta...";
    else if (targetRoute === '/painel/salvos') respostaTexto = "Mostrando seus itens salvos...";
    else if (targetRoute === '/painel/mensagens') respostaTexto = "Ir para as suas mensagens...";

    return NextResponse.json({
      reply: [{ response_type: 'text', text: respostaTexto }],
      route: targetRoute,
    });

  } catch (error) {
    console.error('Erro na rota do assistente:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}