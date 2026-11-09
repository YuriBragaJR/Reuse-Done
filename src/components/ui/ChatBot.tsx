"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';

type Action = { label: string; route: string };
// Correção aplicada aqui: text agora é opcional (text?: string) para aceitar mensagens contendo apenas botões de ação
type Message = { sender: 'user' | 'bot'; text?: string; action?: Action };

export default function ChatBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Sequência de boas-vindas inicial (mantida com animação segundo a segundo)
  useEffect(() => {
    if (!isOpen) return;
    setMessages([]);

    const t1 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Olá! Sou o assistente virtual ReUse. Como posso te ajudar hoje?' }]);
    }, 200);

    const t2 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Escolha uma das opções rápidas abaixo ou digite onde deseja ir:' }]);
    }, 1200);

    const t3 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', action: { label: '🎁 Registrar Doação/Venda', route: '/desapegar' } }]);
    }, 2200);

    const t4 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', action: { label: '📦 Meus Desapegos', route: '/painel/desapegos' } }]);
    }, 3200);

    const t5 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', action: { label: '🎟️ Meus Resgates', route: '/painel' } }]);
    }, 4200);

    const t6 = setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', action: { label: '❤️ Itens Salvos', route: '/painel/salvos' } }]);
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [isOpen]);

  const handleActionClick = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg }),
      });

      const data = await res.json();

      if (data.reply && data.reply.length > 0) {
        data.reply.forEach((r: any) => {
          if (r.response_type === 'text') {
            setMessages(prev => [...prev, { sender: 'bot', text: r.text }]);
          }
        });
      }

      // Se a IA detectou para onde o usuário quer ir, navega automaticamente!
      if (data.route) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Redirecionando você agora...' }]);
        setTimeout(() => {
          setIsOpen(false);
          router.push(data.route);
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao falar com o assistente", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Desculpe, tive um problema ao processar seu pedido.' }]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-eco-600 text-white p-4 rounded-full shadow-lg hover:bg-eco-700 z-50 flex items-center gap-2 font-bold transition-transform hover:scale-105">
        <Bot className="w-5 h-5 text-white" />
        Ajuda
      </button>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(-15px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-message {
          animation: slideInLeft 0.3s ease-out forwards;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 w-80 md:w-[350px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col h-[500px] z-50 overflow-hidden">
        <div className="bg-earth-900 text-white p-4 font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2"><Bot className="w-5 h-5 text-white" /> Assistente ReUse</span>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 font-bold text-xl leading-none">&times;</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-sm bg-gray-50 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.text && (
                <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm animate-slide-message mb-1 ${
                  msg.sender === 'user' 
                    ? 'bg-eco-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              )}
              
              {msg.action && (
                <div className="w-[85%] animate-slide-message">
                  <button 
                    onClick={() => handleActionClick(msg.action!.route)}
                    className="text-left bg-white border border-eco-200 hover:border-eco-500 hover:bg-eco-50 text-eco-700 font-semibold py-2 px-3 rounded-lg text-xs transition-colors shadow-sm w-full"
                  >
                    {msg.action.label}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t bg-white flex gap-2">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-eco-600 focus:ring-1 focus:ring-eco-600 text-sm text-black transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite onde deseja ir..."
          />
          <button 
            onClick={sendMessage} 
            className="bg-eco-600 hover:bg-eco-700 text-white px-4 py-2 rounded-full font-bold transition-colors shadow-sm"
          >
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}