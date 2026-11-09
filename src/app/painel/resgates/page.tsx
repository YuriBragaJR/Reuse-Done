import { Package, Tag, Heart, Settings, PanelLeft } from 'lucide-react';

export default function Resgates() {
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Meus Resgates (Compras)</h1>
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mb-4 text-2xl"><Package className='w-8 h-8 text-orange-400' /></div>
        <h3 className="font-bold text-gray-800">Nenhum resgate feito ainda</h3>
        <p className="text-sm text-gray-500 mt-1">Explore o catálogo e encontre itens incríveis!</p>
      </div>
    </div>
  );
}