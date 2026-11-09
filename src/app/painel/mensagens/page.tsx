export const dynamic = 'force-dynamic';

"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare, Loader2, User, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function MensagensPage() {
    const searchParams = useSearchParams();
    const itemParam = searchParams.get('item');
    const vendedorParam = searchParams.get('vendedor');

    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const [conversas, setConversas] = useState<any[]>([]);
    const [conversaAtiva, setConversaAtiva] = useState<any>(null);
    const [mensagens, setMensagens] = useState<any[]>([]);
    const [novoTexto, setNovoTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const conversaAtivaIdRef = useRef<string | null>(null);

    useEffect(() => {
        conversaAtivaIdRef.current = conversaAtiva?.id || null;
    }, [conversaAtiva]);

    useEffect(() => {
        const storageUser = localStorage.getItem('reuse_user');
        if (storageUser) {
            const user = JSON.parse(storageUser);
            setUsuarioLogado(user);
            carregarConversas(user.id);
        }
    }, []);

    useEffect(() => {
        if (usuarioLogado && itemParam && vendedorParam) {
            iniciarOuAbrirConversa(itemParam, vendedorParam, usuarioLogado.id);

            // Limpa os parâmetros da URL sem recarregar a página
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [usuarioLogado, itemParam, vendedorParam]);

    useEffect(() => {
        if (!usuarioLogado) return;

        const intervalo = setInterval(() => {
            carregarConversasSilencioso(usuarioLogado.id);
            if (conversaAtivaIdRef.current) {
                carregarMensagensSilencioso(conversaAtivaIdRef.current);
            }
        }, 3000);

        return () => clearInterval(intervalo);
    }, [usuarioLogado]);

    const carregarConversas = async (userId: string) => {
        try {
            const res = await fetch(`/api/mensagens?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setConversas(data);
                if (data.length > 0 && !conversaAtiva && !itemParam) {
                    setConversaAtiva(data[0]);
                    carregarMensagens(data[0].id);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar conversas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const carregarConversasSilencioso = async (userId: string) => {
        try {
            const res = await fetch(`/api/mensagens?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setConversas(data);
            }
        } catch (e) { }
    };

    const iniciarOuAbrirConversa = async (desapegoId: string, vendedorId: string, compradorId: string) => {
        try {
            const res = await fetch('/api/mensagens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    desapegoId,
                    compradorId,
                    vendedorId,
                    texto: 'Olá! Tenho interesse neste item.',
                    senderId: compradorId
                })
            });

            if (res.ok) {
                const data = await res.json();
                const resConv = await fetch(`/api/mensagens?userId=${compradorId}`);
                const lista = await resConv.json();
                setConversas(lista);

                const encontrada = lista.find((c: any) => c.id === data.conversaId);
                if (encontrada) {
                    setConversaAtiva(encontrada);
                    carregarMensagens(encontrada.id);
                }
            }
        } catch (error) {
            console.error("Erro ao iniciar chat:", error);
        }
    };

    const carregarMensagens = async (conversaId: string) => {
        try {
            const res = await fetch(`/api/mensagens?conversaId=${conversaId}`);
            if (res.ok) {
                const data = await res.json();
                setMensagens(data);
            }
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
        }
    };

    const carregarMensagensSilencioso = async (conversaId: string) => {
        try {
            const res = await fetch(`/api/mensagens?conversaId=${conversaId}`);
            if (res.ok) {
                const data = await res.json();
                setMensagens(prev => {
                    if (data.length !== prev.length) {
                        return data;
                    }
                    return prev;
                });
            }
        } catch (e) { }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const enviarMensagem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoTexto.trim() || !conversaAtiva || !usuarioLogado) return;

        try {
            const res = await fetch('/api/mensagens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversaId: conversaAtiva.id,
                    senderId: usuarioLogado.id,
                    texto: novoTexto
                })
            });

            if (res.ok) {
                setNovoTexto('');
                const resMsg = await fetch(`/api/mensagens?conversaId=${conversaAtiva.id}`);
                if (resMsg.ok) {
                    const data = await resMsg.json();
                    setMensagens(data);
                    scrollToBottom();
                }
                carregarConversasSilencioso(usuarioLogado.id);
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    // Função para apagar a conversa inteira pela coluna esquerda
    const apagarConversa = async (e: React.MouseEvent, conversaId: string) => {
        e.stopPropagation(); // Evita selecionar a conversa ao clicar na lixeira
        if (!confirm("Deseja apagar esta conversa e todo o seu histórico?")) return;

        try {
            const res = await fetch(`/api/conversas/${conversaId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // Se a conversa apagada era a que estava aberta, limpa o chat ativo
                if (conversaAtiva?.id === conversaId) {
                    setConversaAtiva(null);
                    setMensagens([]);
                }
                if (usuarioLogado) {
                    carregarConversas(usuarioLogado.id);
                }
            } else {
                alert("Erro ao apagar a conversa.");
            }
        } catch (error) {
            console.error("Erro ao deletar conversa:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] max-h-[750px] flex bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Coluna Esquerda: Conversas */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-eco-600" /> Mensagens
                    </h2>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {conversas.length > 0 ? (
                        conversas.map((conv) => {
                            const ultimaMsg = conv.mensagens?.[0]?.texto || 'Iniciar conversa...';
                            const ativo = conversaAtiva?.id === conv.id;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        setConversaAtiva(conv);
                                        carregarMensagens(conv.id);
                                    }}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 flex items-center justify-between group ${ativo ? 'bg-eco-50/70 border-l-4 border-l-eco-600 shadow-xs' : 'hover:bg-gray-50'
                                        }`}>
                                    <div className="flex items-center gap-3 overflow-hidden flex-grow">
                                        <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-xs">
                                            {conv.desapego?.imagem ? (
                                                <img src={conv.desapego.imagem} alt="Item" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-eco-100 text-eco-700 font-bold">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden flex-grow">
                                            <h4 className="font-bold text-sm text-gray-900 truncate">
                                                {conv.desapego?.titulo || 'Conversa sobre Anúncio'}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{ultimaMsg}</p>
                                        </div>
                                    </div>

                                    {/* Botão de lixeira na coluna esquerda (aparece ao passar o mouse) */}
                                    <button
                                        onClick={(e) => apagarConversa(e, conv.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-2 ml-2 cursor-pointer shrink-0"
                                        title="Apagar conversa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Nenhuma conversa por enquanto.
                        </div>
                    )}
                </div>
            </div>

            {/* Coluna Direita: Chat */}
            <div className="w-2/3 flex flex-col bg-gray-50/50">
                {conversaAtiva ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-xs shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shadow-xs">
                                {conversaAtiva.desapego?.imagem && (
                                    <img src={conversaAtiva.desapego.imagem} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{conversaAtiva.desapego?.titulo}</h3>
                                <span className="text-xs text-eco-600 font-medium flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Negociação ativa
                                </span>
                            </div>
                        </div>

                        <div ref={chatContainerRef} className="flex-grow min-h-0 p-4 overflow-y-auto space-y-3">
                            {mensagens.map((msg) => {
                                const minhaMensagem = msg.senderId === usuarioLogado?.id;

                                return (
                                    <div
    key={msg.id}
    className={`flex items-center gap-2 ${minhaMensagem ? 'justify-end' : 'justify-start'}`}
>
    <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-xs transition-all animate-in zoom-in-95 fade-in duration-200 origin-${minhaMensagem ? 'bottom-right' : 'bottom-left'} ${
            minhaMensagem
                ? 'bg-eco-600 text-white rounded-br-xs shadow-eco-600/10'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
        }`}
    >
        <p className="leading-relaxed">{msg.texto}</p>
        <span className={`block text-[10px] mt-1 text-right ${minhaMensagem ? 'text-eco-100' : 'text-gray-400'}`}>
            {new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
    </div>
</div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={enviarMensagem} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
                            <input
                                type="text"
                                value={novoTexto}
                                onChange={(e) => setNovoTexto(e.target.value)}
                                placeholder="Escreva sua mensagem..."
                                className="flex-grow px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-eco-600 hover:bg-eco-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-2 animate-bounce" />
                        <p className="text-sm font-medium">Selecione uma conversa ao lado para começar a negociar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
