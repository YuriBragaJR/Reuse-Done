"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ShoppingBag, Heart, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ItemDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [erro, setErro] = useState(false);

  // Pega o ID do usuário logado instantaneamente na inicialização
  const [meuId, setMeuId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storageUser = localStorage.getItem('reuse_user');
      if (storageUser) {
        try {
          return JSON.parse(storageUser).id;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  useEffect(() => {
    // Busca o item diretamente da nossa Base de Dados via API
    const buscarItem = async () => {
      try {
        const res = await fetch(`/api/desapegos/${params.id}`);
        if (res.ok) {
          const dbItem = await res.json();
          
          // Formata os dados para o padrão que o ecrã espera
          const itemFormatado = {
            id: dbItem.id,
            title: dbItem.titulo,
            description: dbItem.descricao,
            category: dbItem.categoria,
            condition: dbItem.condicao,
            type: dbItem.tipo,
            price: dbItem.preco,
            imageUrl: dbItem.imagem || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            status: dbItem.status,
            userId: dbItem.userId, // ID do dono do anúncio
            seller: dbItem.user?.nome || 'Utilizador',
          };

          setItem(itemFormatado);

          // Verifica se o item já está nos favoritos locais
          const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
          if (salvos.some((i: any) => i.id === itemFormatado.id)) {
            setFavorito(true);
          }
        } else {
          setErro(true);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        setErro(true);
      }
    };

    buscarItem();
  }, [params.id]);

  const toggleFavorito = () => {
    if (!item) return;
    
    const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
    let novosSalvos;

    if (favorito) {
      novosSalvos = salvos.filter((i: any) => i.id !== item.id);
    } else {
      novosSalvos = [...salvos, item];
    }

    localStorage.setItem('itens_salvos', JSON.stringify(novosSalvos));
    setFavorito(!favorito);
  };

  const handleAdicionarCesta = () => {
    if (!item) return;
    const cestaAtual = JSON.parse(localStorage.getItem('minha_cesta') || '[]');
    if (!cestaAtual.find((i: any) => i.id === item.id)) {
      cestaAtual.push(item);
      localStorage.setItem('minha_cesta', JSON.stringify(cestaAtual));
    }
    setAdicionado(true);
    setTimeout(() => router.push('/cesta'), 800);
  };

  const handleEnviarMensagem = () => {
    if (!meuId) {
      alert("Faça login para enviar mensagens!");
      router.push('/login');
      return;
    }

    // Redireciona para o painel de mensagens passando o vendedor e o item
    router.push(`/painel/mensagens?vendedor=${item.userId}&item=${item.id}`);
  };

  // Verifica se o anúncio pertence ao próprio usuário logado
  const ehMeuAnuncio = meuId && item && String(meuId) === String(item.userId);

  if (erro) return (
    <div className="p-20 text-center flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Item não encontrado</h2>
      <p className="text-gray-500 mb-6">Este anúncio pode ter sido removido ou não existe mais.</p>
      <Link href="/painel/desapegos" className="text-eco-600 hover:underline font-bold">Voltar para meus desapegos</Link>
    </div>
  );

  if (!item) return <div className="p-20 text-center text-gray-500 font-bold">Carregando detalhes do item...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/explorar" className="text-eco-600 hover:underline mb-6 inline-block text-sm font-bold">
        &larr; Voltar para o catálogo
      </Link>
      
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="md:w-1/2 bg-earth-100 relative">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover min-h-[400px]" />
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-eco-600 bg-eco-50 px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
            
            <button 
              onClick={toggleFavorito}
              className={`flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer ${
                favorito ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 transition-colors ${favorito ? 'fill-red-500' : ''}`} />
              {favorito ? 'Salvo' : 'Salvar'}
            </button>
            
          </div>
          
          <h1 className="text-3xl font-black mt-3 leading-tight text-gray-900">{item.title}</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">{item.condition}</p>
          
          <div className="my-6">
            {item.price > 0 ? (
              <div className="text-4xl font-black text-earth-900">R$ {item.price.toFixed(2)}</div>
            ) : (
              <div className="text-4xl font-black text-eco-600">Item para {item.type}</div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 mt-auto">
            {/* O botão de Adicionar à Cesta / Solicitar Resgate só aparece se NÃO for o seu anúncio */}
            {!ehMeuAnuncio ? (
              <button 
                onClick={handleAdicionarCesta} 
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  adicionado ? 'bg-earth-900 text-white' : 'bg-eco-600 hover:bg-eco-700 text-white shadow-lg shadow-eco-600/20'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {adicionado ? 'Adicionando à Cesta...' : (item.price > 0 ? 'Adicionar à Cesta' : 'Solicitar Resgate')}
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl font-bold text-center bg-gray-100 text-gray-500 border border-gray-200 text-sm">
                Este anúncio é seu (Gerencie no Painel)
              </div>
            )}

            {/* Botão de Enviar Mensagem (Também oculto se for seu anúncio) */}
            {!ehMeuAnuncio && (
              <button 
                onClick={handleEnviarMensagem}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-eco-50 text-eco-700 hover:bg-eco-100 transition border border-eco-200 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                Enviar Mensagem ao Vendedor
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center font-black text-eco-700">{item.seller[0]}</div>
                <div>
                  <div className="font-bold text-sm">{item.seller}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> São Paulo, SP</p>
                </div>
              </div>
            </div>
            
            <h3 className="font-bold text-sm mb-2 text-gray-900">Descrição</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}