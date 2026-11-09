"use client";

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Desapegar() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tipo, setTipo] = useState('venda');
  const [imagem, setImagem] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [condicao, setCondicao] = useState('Novo');
  const [preco, setPreco] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverImagem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

const gerarDescricaoMagica = async () => {
    if (!titulo.trim()) {
      alert("Por favor, digite um título primeiro para a IA saber o que é o item!");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gerar-descricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titulo, 
          categoria, 
          condicao, 
          tipo, 
          preco 
        }),
      });

      const data = await res.json();
      
      if (data.descricao) {
        const textoGerado = `${data.descricao}\n\n${data.tags || ''}`;
        setDescricao(textoGerado);
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      alert("Ocorreu um erro ao tentar gerar a descrição. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!titulo || !descricao || !categoria || !imagem) {
      alert("Preencha todos os campos obrigatórios e envie uma foto!");
      return;
    }

    setIsSubmitting(true);

    // 1. Obtém o utilizador logado no localStorage
    const userStorage = localStorage.getItem('reuse_user');
    const user = userStorage ? JSON.parse(userStorage) : null;

    // 2. Monta o objeto incluindo o userId
    const novoItem = {
      titulo: titulo,
      descricao: descricao,
      categoria: categoria,
      condicao: condicao,
      tipo: tipo,
      preco: tipo === 'venda' ? Number(preco) : 0,
      imagem: imagem,
      userId: user?.id || null // Vincular ao ID do utilizador conectado
    };

    try {
      const res = await fetch('/api/desapegos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoItem),
      });

      if (res.ok) {
        setSucesso(true);
        setTimeout(() => {
          router.push('/painel/desapegos');
        }, 2000);
      } else {
        const data = await res.json();
        alert(`Erro: ${data.erro || 'Não foi possível guardar o anúncio.'}`);
      }
    } catch (error) {
      console.error("Erro ao guardar o desapego:", error);
      alert("Ocorreu um erro ao tentar enviar os dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sucesso) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle className="w-20 h-20 text-eco-500 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Anúncio Publicado!</h1>
        <p className="text-gray-500">Seu desapego já está disponível na plataforma.</p>
        <p className="text-sm text-eco-600 font-bold mt-4 animate-pulse">Redirecionando para seus desapegos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2">Novo Desapego</h1>
      <p className="text-gray-500 mb-8">Passe para frente o que não usa mais. Venda, doe ou troque.</p>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Fotos do Produto *</label>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          
          <div 
            onClick={() => !imagem && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl overflow-hidden relative flex flex-col items-center justify-center transition cursor-pointer ${
              imagem ? 'border-transparent h-64' : 'border-gray-300 p-8 h-40 hover:bg-eco-50 hover:border-eco-400 text-gray-500'
            }`}
          >
            {imagem ? (
              <>
                <img src={imagem} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={handleRemoverImagem}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="font-bold text-sm">Clique para enviar foto</span>
                <span className="text-xs mt-1">Formatos suportados: JPG, PNG</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Título do Anúncio *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} type="text" placeholder="Ex: Monitor Dell 24 polegadas..." className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-eco-500" />
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-bold">Descrição detalhada *</label>
              <button 
                type="button"
                onClick={gerarDescricaoMagica}
                disabled={isGenerating || !titulo}
                className="text-xs flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1.5 px-3 rounded-full transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Mágica em andamento... ⏳" : "✨ Gerar com IA"}
              </button>
            </div>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={6} placeholder="Conte os detalhes, tempo de uso, se tem avarias..." className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-eco-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Categoria *</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-eco-500">
                <option value="">Selecione...</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Livros">Livros</option>
                <option value="Roupas">Roupas</option>
                <option value="Móveis">Móveis</option>
                <option value="Art. Esportivos">Art. Esportivos</option>
                <option value="Decoração">Decoração</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Condição</label>
              <select value={condicao} onChange={e => setCondicao(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-eco-500">
                <option value="Novo">Novo / Como Novo</option>
                <option value="Usado - Excelente">Usado - Excelente</option>
                <option value="Usado - Marcas de uso">Marcas de uso / Bom</option>
              </select>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-bold mb-3">Como quer repassar?</label>
            
            <div className="flex gap-4 mb-5">
              <label className={`flex-1 border p-3 rounded-lg flex items-center gap-2 cursor-pointer hover:border-eco-500 transition-colors ${tipo === 'venda' ? 'border-eco-500 bg-eco-50/50' : ''}`}>
                <input type="radio" name="tipo" checked={tipo === 'venda'} onChange={() => setTipo('venda')} className="accent-eco-600 w-4 h-4" /> 
                <span className="font-semibold text-gray-800">Venda</span>
              </label>
              <label className={`flex-1 border p-3 rounded-lg flex items-center gap-2 cursor-pointer hover:border-eco-500 transition-colors ${tipo === 'doacao' ? 'border-eco-500 bg-eco-50/50' : ''}`}>
                <input type="radio" name="tipo" checked={tipo === 'doacao'} onChange={() => setTipo('doacao')} className="accent-eco-600 w-4 h-4" /> 
                <span className="font-semibold text-gray-800">Doação</span>
              </label>
            </div>
            {tipo === 'venda' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold mb-1">Preço (R$)</label>
                  <input value={preco} onChange={e => setPreco(e.target.value)} type="number" placeholder="0,00" min="1" className="w-full md:w-1/2 border border-gray-300 p-3 rounded-lg outline-none focus:border-eco-500" />
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="accent-eco-600 w-5 h-5 mt-0.5 cursor-pointer" />
                    <div>
                      <span className="block font-bold text-sm text-gray-800">Aceito propostas de troca</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        Deixe marcado se você topa receber ofertas de outros usuários.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full bg-eco-600 text-white font-bold py-4 rounded-xl mt-6 hover:bg-eco-700 transition active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'A Publicar...' : 'Publicar Anúncio'}
          </button>
        </div>
      </div>
    </div>
  );
}