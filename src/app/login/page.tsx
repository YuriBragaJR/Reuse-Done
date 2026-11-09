"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErro('');

        try {
            // Faz o pedido de autenticação à nossa API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await res.json();

            if (res.ok) {
                // Guarda as informações do utilizador no localStorage
                localStorage.setItem('reuse_user', JSON.stringify(data.user));

                // Redireciona para o painel principal
                router.push('/painel');

                // Atualiza a página para a Navbar reconhecer a nova sessão imediatamente
                setTimeout(() => {
                    window.location.href = '/painel';
                }, 100);
            } else {
                setErro(data.erro || 'Erro ao realizar login.');
            }
        } catch (error) {
            console.error("Erro no login:", error);
            setErro('Erro de conexão com o servidor. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">

                <div className="bg-eco-50 p-8 text-center border-b border-gray-100">
                    <h1 className="text-2xl font-black text-gray-900">Bem-vindo de volta!</h1>
                    <p className="text-sm text-gray-500 mt-2">Acesse sua conta para continuar desapegando.</p>
                </div>

                <div className="p-8">
                    {/* Alerta de Erro */}
                    {erro && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{erro}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-colors"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700">Senha</label>
                                <Link href="#" className="text-xs font-bold text-eco-600 hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-eco-600 text-white font-bold py-4 rounded-xl hover:bg-eco-700 transition active:scale-[0.98] mt-2 disabled:opacity-70"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar na conta'}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        Ainda não faz parte do ReUse?{' '}
                        <Link href="/cadastro" className="font-bold text-eco-600 hover:underline">
                            Crie sua conta
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}