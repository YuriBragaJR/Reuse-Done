export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// 1. FUNÇÃO GET: Lê os dados de um único item (Para a tela de detalhes)
// ============================================================================
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const desapego = await prisma.desapego.findUnique({
      where: { id: id },
      include: {
        user: {
          select: { nome: true }
        }
      }
    });

    if (!desapego) {
      return NextResponse.json({ erro: 'Item não encontrado' }, { status: 404 });
    }

    return NextResponse.json(desapego);
  } catch (error) {
    console.error("Erro ao buscar detalhes do anúncio:", error);
    return NextResponse.json({ erro: 'Erro ao buscar o anúncio' }, { status: 500 });
  }
}

// ============================================================================
// 2. FUNÇÃO DELETE: Apaga o item (Para o botão da lixeira)
// ============================================================================
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const desapegoId = params.id;

    await prisma.desapego.delete({
      where: { id: desapegoId }
    });

    return NextResponse.json({ mensagem: 'Anúncio apagado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ erro: 'Erro ao apagar o anúncio' }, { status: 500 });
  }
}
