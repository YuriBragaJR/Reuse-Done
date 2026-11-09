"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Tag, Heart, Settings, PanelLeft, ShoppingBag, MessageSquare } from 'lucide-react';

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Busca os dados do utilizador logado no localStorage
    const userData = localStorage.getItem('reuse_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const nome = user?.nome || 'Usuário';
  const inicial = nome[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          
          {/* Cabeçalho dinâmico do utilizador */}
          <div className="p-5 border-b bg-eco-50 flex items-center gap-3">
            <div className="w-12 h-12 bg-eco-600 text-white rounded-full flex items-center justify-center font-black text-xl uppercase shadow-inner">
              {inicial}
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-snug">{nome}</div>
              <div className="text-xs text-eco-600 font-semibold">Conta ativa</div>
            </div>
          </div>

          {/* Navegação do Painel */}
          <nav className="flex flex-col py-2">
            <Link href="/painel" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <PanelLeft className="w-4 h-4" /> Meu Painel
            </Link>
            <Link href="/painel/resgates" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <Package className="w-4 h-4"/> Meus Resgates
            </Link>
            <Link href="/painel/desapegos" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <Tag className="w-4 h-4"/> Meus Desapegos
            </Link>
            <Link href="/painel/salvos" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <Heart className="w-4 h-4"/> Itens Salvos
            </Link>
            <Link href="/cesta" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <ShoppingBag className="w-4 h-4"/> Minha Cesta
            </Link>
            <Link href="/painel/mensagens" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <MessageSquare className="w-4 h-4"/> Mensagens
            </Link>
            <Link href="/painel/configuracoes" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-600 flex items-center gap-3 transition">
              <Settings className="w-4 h-4"/> Configurações
            </Link>
            
          </nav>
        </div>
      </aside>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}