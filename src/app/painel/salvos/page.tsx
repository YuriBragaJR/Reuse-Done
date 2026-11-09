"use client";

import { useEffect, useState } from 'react';
import ItemCard from '@/components/ui/ItemCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function ItensSalvos() {
  const [itensSalvos, setItensSalvos] = useState<any[]>([]);

  useEffect(() => {
    // Busca os itens que foram salvos no LocalStorage
    const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
    setItensSalvos(salvos);
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Meus Itens Salvos</h1>

      {itensSalvos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {itensSalvos.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Nenhum item salvo</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">Você ainda não marcou nenhum item como favorito.</p>
          <Link href="/explorar" className="bg-eco-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-eco-700 transition">
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  );
}