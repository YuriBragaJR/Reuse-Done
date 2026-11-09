"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, LogOut, ShieldCheck } from 'lucide-react';

export default function Configuracoes() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Busca os dados do utilizador logado no localStorage
        const userData = localStorage.getItem('reuse_user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            // Se tentar aceder a esta página sem estar logado, expulsa para o login
            router.push('/login');
        }
    }, [router]);

    // Função que faz o Logout
    const handleLogout = () => {
        if (confirm('Tem certeza que deseja sair da sua conta?')) {
            // 1. Limpa os dados do utilizador do navegador
            localStorage.removeItem('reuse_user');

            // 2. Manda o utilizador de volta para a página inicial
            router.push('/');

            // 3. Atualiza a página rapidamente para o Menu (Navbar) voltar ao botão de "Entrar"
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    // Ecrã de carregamento rápido enquanto lê os dados
    if (!user) return <div className="p-10 text-center font-bold text-gray-500">Carregando configurações...</div>;

    return (
        <div className="animate-in fade-in duration-500 max-w-2xl">
            <h1 className="text-2xl font-black text-gray-900 mb-6">Configurações da Conta</h1>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">

                {/* Cabeçalho do Perfil */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-black text-2xl uppercase shadow-inner">
                        {user.nome ? user.nome[0] : 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.nome}</h2>
                        <p className="text-sm text-eco-600 flex items-center gap-1 font-medium mt-1">
                            <ShieldCheck className="w-4 h-4" /> Conta Segura
                        </p>
                    </div>
                </div>

                {/* Formulário de Dados Cadastrais (Apenas leitura para já) */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nome de Exibição</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                disabled
                                value={user.nome}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-mail Cadastrado</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                disabled
                                value={user.email}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Por motivos de segurança, seus dados base não podem ser alterados por aqui no momento.
                        </p>
                    </div>
                </div>
            </div>

            {/* Zona de Perigo / Logout */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-red-800 text-lg">Encerrar Sessão</h3>
                    <p className="text-sm text-red-600 mt-1">Sair da sua conta de forma segura neste dispositivo.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/20 active:scale-95 w-full sm:w-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}