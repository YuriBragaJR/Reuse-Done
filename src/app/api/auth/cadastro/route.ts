import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha } = body;

    // 1. Validação simples para garantir que nada vem vazio
    if (!nome || !email || !senha) {
      return NextResponse.json({ erro: 'Por favor, preencha todos os campos.' }, { status: 400 });
    }

    // 2. Verifica se já existe alguém com este e-mail na Base de Dados
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: email }
    });

    if (usuarioExistente) {
      return NextResponse.json({ erro: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    // 3. Cria o novo utilizador no banco de dados Neon
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha, // Nota: Numa aplicação de produção real, encriptaríamos esta senha (ex: usando bcrypt)
      }
    });

    return NextResponse.json({ 
      mensagem: 'Conta criada com sucesso!', 
      user: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ erro: 'Erro interno do servidor.' }, { status: 500 });
  }
}