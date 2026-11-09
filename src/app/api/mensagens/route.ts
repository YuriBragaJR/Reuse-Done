export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// GET: Retorna estritamente as conversas do usuário logado ou as mensagens de uma conversa específica
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversaId = searchParams.get('conversaId');

    // 1. Se passou conversaId, traz apenas as mensagens daquela conversa específica
    if (conversaId) {
      const mensagens = await prisma.mensagem.findMany({
        where: { conversaId },
        orderBy: { criadoEm: 'asc' }
      });
      return NextResponse.json(mensagens);
    }

    // 2. Se passou userId, filtra estritamente: O usuário DEVE ser o comprador OU o vendedor
    if (userId) {
      const conversas = await prisma.conversa.findMany({
        where: {
          OR: [
            { compradorId: userId },
            { vendedorId: userId }
          ]
        },
        include: {
          desapego: { select: { titulo: true, imagem: true, userId: true } },
          mensagens: { orderBy: { criadoEm: 'desc' }, take: 1 }
        },
        orderBy: { atualizadoEm: 'desc' }
      });
      return NextResponse.json(conversas);
    }

    return NextResponse.json({ erro: 'ID do usuário não informado' }, { status: 400 });
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return NextResponse.json({ erro: 'Erro interno ao buscar mensagens' }, { status: 500 });
  }
}

// POST: Cria ou gerencia o envio de mensagens com travas de segurança
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { desapegoId, compradorId, vendedorId, texto, conversaId, senderId } = body;

    let idConversa = conversaId;

    // Se a mensagem está vindo do botão do anúncio, verificamos se a conversa já existe entre eles
    if (!idConversa && desapegoId && compradorId && vendedorId) {
      
      // Trava de segurança: Ninguém pode iniciar chat consigo mesmo
      if (compradorId === vendedorId) {
        return NextResponse.json({ erro: 'Você não pode enviar mensagens para o seu próprio anúncio.' }, { status: 400 });
      }

      let conversaExistente = await prisma.conversa.findFirst({
        where: {
          desapegoId,
          compradorId,
          vendedorId
        }
      });

      if (!conversaExistente) {
        conversaExistente = await prisma.conversa.create({
          data: {
            desapegoId,
            compradorId,
            vendedorId
          }
        });
      }
      idConversa = conversaExistente.id;
    }

    if (!idConversa || !texto || !senderId) {
      return NextResponse.json({ erro: 'Dados incompletos para enviar mensagem' }, { status: 400 });
    }

    // Cria a mensagem vinculada à conversa correta
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conversaId: idConversa,
        senderId,
        texto
      }
    });

    // Atualiza a data da conversa para ela subir para o topo da lista
    await prisma.conversa.update({
      where: { id: idConversa },
      data: { atualizadoEm: new Date() }
    });

    return NextResponse.json({ mensagem: novaMensagem, conversaId: idConversa }, { status: 201 });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json({ erro: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
