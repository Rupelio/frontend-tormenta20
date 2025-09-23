// app/criar-personagem/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ClientOnly from '@/components/ClientOnly';
import PersonagemForm from '@/components/PersonagemForm';

function CriarPersonagemContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  return (
    <ClientOnly>
      <PersonagemForm editId={editId} />
    </ClientOnly>
  );
}

export default function CriarPersonagemPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CriarPersonagemContent />
    </Suspense>
  );
}
