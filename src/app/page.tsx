"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ItemCard from '@/components/ui/ItemCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: "o que não serve mais pra você",
    subtitle: "pode ser o recomeço de alguém",
    image: "https://images.unsplash.com/photo-1550505393-2c5dbec5de87?q=80&w=1170&auto=format&fit=crop",
    link: "/explorar"
  },
  {
    id: 2,
    title: "tem que ter a manha",
    subtitle: "pois a concorrência tá que tá",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1200&auto=format&fit=crop",
    link: "/explorar"
  },
  {
    id: 3,
    title: "economia circular na prática",
    subtitle: "doe, troque e resgate recursos",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop",
    link: "/explorar"
  }
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [itensRecentes, setItensRecentes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para o carrossel de banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Efeito para buscar os itens da base de dados
  useEffect(() => {
    const carregarDesapegos = async () => {
      try {
        const res = await fetch('/api/desapegos');
        if (res.ok) {
          const dados = await res.json();
          
          // Formata os dados para o padrão que o ItemCard espera
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
            seller: dbItem.user?.nome || 'Usuário'
          }));

          // Pega apenas os 8 mais recentes para a tela inicial
          setItensRecentes(dadosFormatados.slice(0, 8));
        }
      } catch (error) {
        console.error("Erro ao carregar desapegos recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDesapegos();
  }, []);

  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);

  const categoriasAtalhos = [
    { nome: 'Eletrônicos', url: '/explorar?categoria=Eletrônicos' },
    { nome: 'Móveis', url: '/explorar?categoria=Móveis' },
    { nome: 'Livros', url: '/explorar?categoria=Livros' },
    { nome: 'Roupas', url: '/explorar?categoria=Roupas' },
    { nome: 'Decoração', url: '/explorar?categoria=Decoração' },
    { nome: 'Doações', url: '/explorar?tipo=doacao' }
  ];

  return (
    <div>
      {/* Carrossel de Banners */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 group h-[280px] md:h-[350px]">
          <div className="flex transition-transform duration-700 ease-out h-full" style={{ transform: `translateX(-${current * 100}%)` }}>
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-full h-full relative flex items-center">
                <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="relative z-10 p-8 md:p-16 max-w-xl text-white">
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wide mb-2">{banner.title}</h2>
                  <p className="text-sm md:text-lg text-gray-200 mb-6">{banner.subtitle}</p>
                  <Link href={banner.link} className="bg-eco-600 hover:bg-eco-500 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg inline-block">
                    Explorar Coleção
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button key={index} onClick={() => setCurrent(index)} className={`h-2 rounded-full transition-all ${current === index ? "w-8 bg-eco-500" : "w-2 bg-white/60"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-black mb-6 text-earth-900">Navegue por categorias</h2>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {categoriasAtalhos.map(cat => (
            <Link key={cat.nome} href={cat.url} className="min-w-[120px] bg-white border border-gray-200 rounded-xl py-4 flex flex-col items-center justify-center hover:border-eco-500 hover:text-eco-600 transition-colors shadow-sm">
              <span className="font-semibold text-sm">{cat.nome}</span>
            </Link>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `.overflow-x-auto::-webkit-scrollbar { display: none; }`}} />
      </section>

      {/* Achadinhos Recentes */}
      <section className="py-8 max-w-7xl mx-auto px-4 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-earth-900">Achadinhos Recentes</h2>
          <Link href="/explorar" className="text-sm font-bold text-eco-600 hover:underline">Ver todos</Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
          </div>
        ) : itensRecentes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {itensRecentes.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Ainda não há anúncios recentes. Seja o primeiro a desapegar!
          </div>
        )}
      </section>
    </div>
  );
}