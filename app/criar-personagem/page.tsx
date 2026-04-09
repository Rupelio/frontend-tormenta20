'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';
import PersonagemForm from '@/components/PersonagemForm';

function CriarPersonagemContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com navegacao */}
      <header className="bg-gradient-to-r from-red-800 to-red-900 text-white py-4 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Voltar</span>
          </Link>
          <div className="h-4 w-px bg-white/30" />
          <h1 className="text-lg font-bold">
            {editId ? 'Editar Personagem' : 'Criar Novo Personagem'}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <ClientOnly>
          <PersonagemForm editId={editId} />
        </ClientOnly>
      </main>
    </div>
  );
}

export default function CriarPersonagemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Carregando formulario...</p>
          </div>
        </div>
      }
    >
      <CriarPersonagemContent />
    </Suspense>
  );
}
