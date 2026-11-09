import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // 1. Validação simples dos dados recebidos
    if (!email || !senha) {
      return NextResponse.json({ erro: 'Por favor, informe o e-mail e a senha.' }, { status: 400 });
    }

    // 2. Procura o utilizador na base de dados pelo e-mail
    const usuario = await prisma.user.findUnique({
      where: { email: email }
    });

    // 3. Verifica se o utilizador existe e se a senha está correta
    if (!usuario || usuario.senha !== senha) {
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 400 });
    }

    // 4. Retorna os dados do utilizador (sem enviar a senha de volta)
    return NextResponse.json({
      mensagem: 'Login realizado com sucesso!',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ erro: 'Erro interno do servidor.' }, { status: 500 });
  }
}