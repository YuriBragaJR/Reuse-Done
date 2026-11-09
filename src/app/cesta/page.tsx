"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function Cesta() {
    const [itensCesta, setItensCesta] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const cestaSalva = JSON.parse(localStorage.getItem('minha_cesta') || '[]');
        setItensCesta(cestaSalva);
    }, []);

    const removerItem = (id: string) => {
        const novaCesta = itensCesta.filter(item => item.id !== id);
        setItensCesta(novaCesta);
        localStorage.setItem('minha_cesta', JSON.stringify(novaCesta));
    };

    const subtotal = itensCesta.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    const taxaPlataforma = subtotal > 0 ? subtotal * 0.05 : 0; // Taxa simbólica de 5%
    const total = subtotal + taxaPlataforma;

    if (!isClient) {
        return null; // Evita hidration mismatch error no Next.js ao ler o localStorage
    }

    if (itensCesta.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Sua Cesta está vazia</h1>
                <p className="text-gray-500 mb-8">O que acha de resgatar itens incríveis e ajudar o planeta?</p>
                <Link href="/explorar" className="bg-eco-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-eco-700 transition">
                    Explorar Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-eco-600" /> Cesta de Resgate
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Lista de Produtos na Cesta */}
                <div className="flex-1 space-y-4">
                    {itensCesta.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
                            <img 
                                src={item.imageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='} 
                                alt={item.title} 
                                className="w-full sm:w-28 h-28 object-cover rounded-xl bg-gray-100" 
                            />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-bold text-eco-600 bg-eco-50 px-2 py-1 rounded uppercase">{item.category}</span>
                                        <h3 className="font-bold text-lg text-gray-900 mt-1">{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Vendido por: <span className="font-semibold">{item.seller || 'Usuário'}</span></p>
                                    </div>

                                    <button
                                        onClick={() => removerItem(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Remover da cesta"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md">Condição: {item.condition}</span>
                                    {Number(item.price) > 0 ? (
                                        <span className="font-black text-xl text-earth-900">R$ {Number(item.price).toFixed(2)}</span>
                                    ) : (
                                        <span className="font-black text-lg text-eco-600">Grátis ({item.type})</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumo Financeiro (Checkout) */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
                        <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-4 mb-4">Resumo do Resgate</h3>

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal ({itensCesta.length} {itensCesta.length === 1 ? 'item' : 'itens'})</span>
                                <span className="font-bold text-gray-900">R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Frete</span>
                                <span>A combinar no chat</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Taxa de sustentabilidade (5%)</span>
                                <span>R$ {taxaPlataforma.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-black text-2xl text-eco-600">R$ {total.toFixed(2)}</span>
                        </div>

                        <button className="w-full bg-eco-600 text-white font-bold py-4 rounded-xl hover:bg-eco-700 transition active:scale-[0.98] shadow-lg shadow-eco-600/20">
                            Finalizar Resgate Seguramente
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <ShieldCheck className="w-4 h-4 text-eco-500" />
                            <span>Transação protegida pelo ReUse!</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}