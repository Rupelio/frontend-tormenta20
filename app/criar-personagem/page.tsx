// app/criar-personagem/page.tsx
'use client';

import ClientOnly from '@/components/ClientOnly';
import PersonagemForm from '@/components/PersonagemForm';

export default function CriarPersonagemPage() {
  return (
    <ClientOnly>
      <PersonagemForm />
    </ClientOnly>
  );
}
