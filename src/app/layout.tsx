import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import ChatBot from '@/components/ui/ChatBot';

export const metadata: Metadata = {
  title: "ReUse! | Economia Circular",
  description: "Resgate, troque e doe."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-earth-100 text-earth-900">
        <Navbar />

        <main className="flex-1 w-full">{children}</main>

        {/* Rodapé Minimalista e Bem Estruturado */}
        <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-1">
                <Link href="/" className="flex items-center">
                  <img src="/logo-footer.png" alt="Logo ReUse!" className="h-10 w-auto object-contain" />
                </Link>
                <p className="text-sm text-gray-500 leading-relaxed pr-4">
                  Dando um novo propósito ao que você não usa mais. Economia circular na prática.
                </p>
              </div>

              {/* Coluna 1: Explorar */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Explorar</h3>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="/explorar" className="hover:text-eco-600 transition-colors">Catálogo Completo</Link></li>
                  <li><Link href="/explorar" className="hover:text-eco-600 transition-colors">Apenas Doações</Link></li>
                  <li><Link href="/desapegar" className="hover:text-eco-600 transition-colors">Quero Desapegar</Link></li>
                </ul>
              </div>

              {/* Coluna 2: A Plataforma */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="/painel" className="hover:text-eco-600 transition-colors">Meu Painel</Link></li>
                  <li><Link href="#" className="hover:text-eco-600 transition-colors">Quem Somos</Link></li>
                  <li><Link href="#" className="hover:text-eco-600 transition-colors">Impacto e Sustentabilidade</Link></li>
                </ul>
              </div>

              {/* Coluna 3: Ajuda */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Ajuda</h3>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="#" className="hover:text-eco-600 transition-colors">Perguntas Frequentes</Link></li>
                  <li><Link href="#" className="hover:text-eco-600 transition-colors">Termos de Uso</Link></li>
                  <li><Link href="#" className="hover:text-eco-600 transition-colors">Fale Conosco</Link></li>
                </ul>
              </div>
            </div>

            {/* Linha Inferior: Copyright e Redes Sociais */}
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} ReUse! Plataforma. Todos os direitos reservados.
              </p>

              <div className="flex items-center gap-5 text-gray-400">
                <a href="#" aria-label="Instagram" className="hover:text-eco-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Twitter" className="hover:text-eco-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="LinkedIn" className="hover:text-eco-600 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </footer>
        <ChatBot/>
      </body>
    </html>
  );
}