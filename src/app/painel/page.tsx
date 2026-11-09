"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tag, Heart, ShoppingBag, PlusCircle, Loader2 } from "lucide-react";

export default function Painel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    desapegosCount: 0,
    salvosCount: 0,
    cestaCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão do utilizador
    const userData = localStorage.getItem("reuse_user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // 2. Carrega métricas reais
    const carregarMetricas = async () => {
      try {
        // Busca desapegos cadastrados via API
        const res = await fetch("/api/desapegos");
        let meusDesapegosCount = 0;

        if (res.ok) {
          const todosDesapegos = await res.json();
          // Filtra os desapegos pertencentes a este utilizador (se houver userId na relação) ou conta do total do utilizador
          const meus = todosDesapegos.filter(
            (item: any) => item.userId === parsedUser.id
          );
          meusDesapegosCount = meus.length;
        }

        // Busca contagem de salvos do localStorage
        const salvos = JSON.parse(localStorage.getItem("itens_salvos") || "[]");

        // Busca contagem de itens na cesta do localStorage
        const cesta = JSON.parse(localStorage.getItem("minha_cesta") || "[]");

        setStats({
          desapegosCount: meusDesapegosCount,
          salvosCount: salvos.length,
          cestaCount: cesta.length,
        });
      } catch (error) {
        console.error("Erro ao carregar métricas do painel:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarMetricas();
  }, [router]);

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
      </div>
    );
  }

  const cardsMetricas = [
    {
      label: "Meus Desapegos",
      value: `${stats.desapegosCount} ${stats.desapegosCount === 1 ? 'item' : 'itens'}`,
      icon: Tag,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      link: "/painel/desapegos",
    },
    {
      label: "Itens Salvos",
      value: `${stats.salvosCount} ${stats.salvosCount === 1 ? 'item' : 'itens'}`,
      icon: Heart,
      color: "bg-rose-50 text-rose-800 border-rose-200",
      link: "/painel/salvos",
    },
    {
      label: "Itens na Cesta",
      value: `${stats.cestaCount} ${stats.cestaCount === 1 ? 'item' : 'itens'}`,
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-800 border-amber-200",
      link: "/cesta",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho do Painel Dinâmico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Olá, {user.nome?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus desapegos, acompanhe itens salvos e publique novos anúncios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/desapegar"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Novo Desapego
          </Link>
        </div>
      </div>

      {/* Cartões de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cardsMetricas.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <Link
              key={i}
              href={stat.link}
              className={`p-5 rounded-2xl border ${stat.color} flex items-center justify-between hover:shadow-md transition cursor-pointer`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {stat.label}
                </p>
                <p className="text-2xl font-black mt-1">{stat.value}</p>
              </div>
              <Icon className="w-8 h-8 opacity-80" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
