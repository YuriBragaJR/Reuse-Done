"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import ItemCard from '@/components/ui/ItemCard';
import { Tag, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MeusDesapegos() {
  const [meusItens, setMeusItens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDesapegos();
  }, []);

  const carregarDesapegos = async () => {
    try {
      // 1. Pegamos os dados do usuário logado usando a chave correta identificada no login
      const storageUser = localStorage.getItem('reuse_user');
      const usuarioLogado = JSON.parse(storageUser || '{}');
      const meuId = usuarioLogado.id;

      // 2. Mandamos o ID na URL para o Prisma filtrar lá no backend
      const url = meuId ? `/api/desapegos?userId=${meuId}` : '/api/desapegos';
      
      const res = await fetch(url, { cache: 'no-store' }); // Evita cache no frontend
      
      if (res.ok) {
        const dados = await res.json();
        
        console.log("Dados que vieram da Base de Dados (Filtrados):", dados);

        const dadosFormatados = dados.map((dbItem: any) => ({
          id: dbItem.id,
          title: dbItem.titulo,
          description: dbItem.descricao,
          category: dbItem.categoria,
          condition: dbItem.condicao,
          type: dbItem.tipo,
          price: dbItem.preco,
          imageUrl: dbItem.imagem || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
          status: dbItem.status,
          userId: dbItem.userId, // Importante trazer o userId
          seller: 'Você'
        }));

        setMeusItens(dadosFormatados);
      } else {
        console.error("Erro ao buscar desapegos");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Tem certeza de que deseja apagar este anúncio?")) {
      try {
        const res = await fetch(`/api/desapegos/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          const novosCriados = meusItens.filter(item => item.id !== id);
          setMeusItens(novosCriados);
          
          const cesta = JSON.parse(localStorage.getItem('minha_cesta') || '[]');
          localStorage.setItem('minha_cesta', JSON.stringify(cesta.filter((i: any) => i.id !== id)));

          const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
          localStorage.setItem('itens_salvos', JSON.stringify(salvos.filter((i: any) => i.id !== id)));
        } else {
          alert("Erro ao excluir o anúncio da base de dados.");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Ocorreu um erro ao tentar excluir.");
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-900">Meus Desapegos</h1>
        <Link href="/desapegar" className="bg-eco-100 text-eco-700 hover:bg-eco-200 px-4 py-2 rounded-lg text-sm font-bold transition">
          + Novo Anúncio
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
        </div>
      ) : meusItens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {meusItens.map(item => (
            <div key={item.id} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
              <div className="absolute top-3 left-3 z-20 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-md">
                Seu Anúncio
              </div>

              {/* Botão de Exclusão */}
              <button 
                onClick={(e) => handleDeletar(item.id, e)}
                className="absolute top-3 right-3 z-30 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition cursor-pointer flex items-center justify-center"
                title="Apagar este anúncio"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ItemCard item={item} showFavorite={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Você ainda não desapegou</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">Comece a liberar espaço e promover a economia circular.</p>
          <Link href="/desapegar" className="bg-eco-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-eco-700 transition">
            Começar a Desapegar
          </Link>
        </div>
      )}
    </div>
  );
}
