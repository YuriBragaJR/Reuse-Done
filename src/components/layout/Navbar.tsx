"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, PlusCircle, LogIn } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [termoBusca, setTermoBusca] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verifica se existe um utilizador guardado (vamos implementar a lógica real de sessão em breve)
    const user = localStorage.getItem('reuse_user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      router.push(`/explorar?busca=${encodeURIComponent(termoBusca.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo ReUse!" className="h-10 w-auto object-contain" />
        </Link>

        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por monitores, livros, móveis..."
            className="w-full bg-gray-50 border border-gray-200 py-2.5 pl-4 pr-12 rounded-xl text-sm outline-none focus:border-eco-500 focus:bg-white transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-eco-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Ações e Links Rápidos */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/desapegar" className="hidden sm:flex items-center gap-1.5 bg-eco-50 text-eco-700 hover:bg-eco-100 px-4 py-2 rounded-xl font-bold text-sm transition">
            <PlusCircle className="w-4 h-4" /> Desapegar
          </Link>

          <Link href="/cesta" className="p-2.5 text-gray-700 hover:text-eco-600 hover:bg-gray-50 rounded-xl transition relative" title="Cesta">
            <ShoppingBag className="w-5 h-5" />
          </Link>

          {/* Renderização Condicional Baseada no Login */}
          {mounted && isLoggedIn ? (
            <>
              <Link href="/painel/salvos" className="p-2.5 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-xl transition relative" title="Itens Salvos">
                <Heart className="w-5 h-5" />
              </Link>

              <Link href="/painel" className="p-2.5 text-gray-700 hover:text-eco-600 hover:bg-gray-50 rounded-xl transition" title="Meu Painel">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : mounted ? (
            <Link href="/login" className="flex items-center gap-1.5 bg-gray-900 text-white hover:bg-gray-800 px-5 py-2 rounded-xl font-bold text-sm transition ml-2">
              <LogIn className="w-4 h-4" /> Entrar
            </Link>
          ) : (
            <div className="w-24 h-9 bg-gray-100 animate-pulse rounded-xl ml-2"></div>
          )}
        </div>

      </div>

      {/* Barra de Pesquisa mobile*/}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="O que você está procurando?"
            className="w-full bg-gray-50 border border-gray-200 py-2 pl-4 pr-10 rounded-xl text-sm outline-none focus:border-eco-500"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}