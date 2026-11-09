"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ItemCard({ item, showFavorite = true }: { item: any; showFavorite?: boolean }) {
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
    if (salvos.some((i: any) => i.id === item.id)) {
      setFavorito(true);
    }
  }, [item.id]);

  const toggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative">
      {/* O botão do coração só aparece se showFavorite for true */}
      {showFavorite && (
        <button 
          type="button"
          onClick={toggleFavorito}
          className="absolute top-3 right-3 z-20 p-2.5 bg-white/90 hover:bg-white backdrop-blur rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" 
            className={`w-4 h-4 transition-transform active:scale-90 ${favorito ? "text-red-500 fill-red-500" : "text-gray-400 fill-none hover:text-red-400"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      )}

      <Link href={`/item/${item.id}`} className="block">
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          {item.type === 'doacao' && <span className="absolute bottom-2 left-2 bg-eco-500 text-white text-xs font-bold px-2 py-1 rounded">DOAÇÃO</span>}
          {item.type === 'troca' && <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">TROCA</span>}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{item.seller}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            {item.price > 0 ? (
              <span className="text-lg font-black text-earth-900">R$ {item.price}</span>
            ) : (
              <span className="text-lg font-black text-eco-600">Grátis</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">{item.condition}</p>
        </div>
      </Link>
    </div>
  );
}