'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function TestePage() {
  const [status, setStatus] = useState('testando...');
  const [dados, setDados] = useState<any[]>([]);

  useEffect(() => {
    const testarConexao = async () => {
      try {
        setStatus('Testando conexão com backend...');

        // Teste direto com fetch
        const response = await fetch(`${API_BASE_URL}/api/v1/divindades`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDados(data);
        setStatus(`Sucesso! Carregadas ${data.length} divindades`);

      } catch (error) {
        console.error('Erro no teste:', error);
        setStatus(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    testarConexao();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Backend</h1>
      <p className="mb-4">Status: <span className="font-mono">{status}</span></p>

      {dados.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Primeiras 3 divindades:</h2>
          <ul className="list-disc list-inside space-y-1">
            {dados.slice(0, 3).map((div: any) => (
              <li key={div.ID}>
                <strong>{div.nome}</strong> - {div.dominio} ({div.alinhamento})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
