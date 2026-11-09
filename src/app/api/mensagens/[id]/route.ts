export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.mensagem.deleteMany({
      where: { conversaId: id }
    });

    await prisma.conversa.delete({
      where: { id }
    });

    return NextResponse.json({ mensagem: 'Conversa apagada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao apagar conversa:", error);
    return NextResponse.json({ erro: 'Erro ao apagar conversa' }, { status: 500 });
  }
}