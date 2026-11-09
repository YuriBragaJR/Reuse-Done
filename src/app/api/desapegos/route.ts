import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    // 1. Pega os parâmetros da URL
    const { searchParams } = new URL(request.url);
    const userIdUrl = searchParams.get('userId');

    // 2. Cria a regra de filtro: Se mandou userId na URL, filtra por ele. Senão, traz todos.
    const filtro = userIdUrl ? { userId: userIdUrl } : {};

    const desapegos = await prisma.desapego.findMany({
      where: filtro, // Aplica o filtro aqui!
      orderBy: { criadoEm: 'desc' },
      include: {
        user: {
          select: { nome: true }
        }
      }
    });
    return NextResponse.json(desapegos);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao buscar desapegos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, descricao, categoria, condicao, tipo, preco, imagem, userId } = body;

    if (!titulo || !categoria) {
      return NextResponse.json({ erro: 'Título e categoria são obrigatórios.' }, { status: 400 });
    }

    const novoDesapego = await prisma.desapego.create({
      data: {
        titulo,
        descricao: descricao || '',
        categoria,
        condicao: condicao || 'Usado',
        tipo: tipo || 'venda',
        preco: Number(preco) || 0,
        imagem: imagem || null,
        userId: userId || null, 
      },
    });

    return NextResponse.json(novoDesapego, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar desapego:', error);
    return NextResponse.json({ erro: 'Erro interno ao cadastrar desapego.' }, { status: 500 });
  }
}