import React, { useState, useEffect } from 'react';
import { Poder } from '@shared/types';

interface PoderesOrigemAutomaticosProps {
  origemId: number | null;
}

const PoderesOrigemAutomaticos: React.FC<PoderesOrigemAutomaticosProps> = ({
  origemId
}) => {
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origemId) {
      setPoderes([]);
      return;
    }

    const carregarPoderesOrigem = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `http://localhost:8080/api/v1/poderes/origem/${origemId}`;
        console.log('Carregando poderes da origem:', url);

        const response = await fetch(url);
        console.log('Resposta da API:', response.status, response.statusText);

        if (response.ok) {
          const poderesData = await response.json();
          console.log('Poderes de origem recebidos:', poderesData);
          setPoderes(poderesData);
        } else {
          const errorText = await response.text();
          console.error('Erro na resposta:', response.status, errorText);
          setError('Erro ao carregar poderes da origem');
        }
      } catch (err) {
        setError('Erro de conexão ao carregar poderes');
        console.error('Erro ao carregar poderes:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarPoderesOrigem();
  }, [origemId]);

  if (!origemId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-md font-medium mb-2 text-green-800">Poderes de Origem</h4>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-600 text-sm">Carregando poderes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h4 className="text-md font-medium mb-2 text-red-800">Poderes de Origem</h4>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (poderes.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium mb-2 text-gray-800">Poderes de Origem</h4>
        <p className="text-gray-600 text-sm">Nenhum poder especial encontrado para esta origem.</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <h4 className="text-md font-medium mb-3 text-green-800">
        Poderes de Origem ({poderes.length})
      </h4>
      <p className="text-sm text-green-700 mb-3">
        Estes poderes são concedidos automaticamente pela sua origem:
      </p>

      <div className="space-y-2">
        {poderes.map((poder) => {
          const poderId = poder.ID || poder.id || 0;

          return (
            <div
              key={poderId}
              className="p-3 border border-green-300 bg-green-100 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-sm text-gray-900">{poder.nome}</h5>
                <div className="flex gap-1">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {poder.tipo}
                  </span>
                  <span className="text-xs bg-green-300 px-2 py-1 rounded">
                    Automático
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                {poder.descricao}
              </p>
              {poder.requisitos && poder.requisitos !== 'Nenhum' && (
                <p className="text-xs text-gray-500 italic">
                  <strong>Requisitos:</strong> {poder.requisitos}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoderesOrigemAutomaticos;
