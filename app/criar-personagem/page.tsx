// app/criar-personagem/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import PersonagemForm from '@/components/PersonagemForm';

export default function CriarPersonagemPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  return (
    <ClientOnly>
      <PersonagemForm editId={editId} />
    </ClientOnly>
  );
}
