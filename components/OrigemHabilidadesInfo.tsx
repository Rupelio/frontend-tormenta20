import React, { useState, useEffect } from 'react';
import { Habilidade } from '../../shared/types';

interface OrigemHabilidadesInfoProps {
  origemId: number | null;
}

const OrigemHabilidadesInfo: React.FC<OrigemHabilidadesInfoProps> = ({ origemId }) => {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origemId) {
      setHabilidades([]);
      return;
    }

    const carregarHabilidades = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8080/api/v1/habilidades/origem/${origemId}`);
        if (response.ok) {
          const data = await response.json();
          setHabilidades(data || []);
        } else {
          setError('Erro ao carregar habilidades da origem');
        }
      } catch (err) {
        setError('Erro de conexão ao carregar habilidades');
        console.error('Erro ao carregar habilidades da origem:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarHabilidades();
  }, [origemId]);

  const getIdHabilidade = (habilidade: Habilidade): number => {
    return habilidade.id || habilidade.ID || 0;
  };

  if (!origemId) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-4 p-3 bg-amber-50 rounded text-sm">
        <div className="animate-pulse">Carregando habilidades da origem...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 rounded text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (habilidades.length === 0) {
    return (
      <div className="mt-4 p-3 bg-amber-50 rounded text-sm text-gray-500">
        Esta origem não possui habilidades especiais.
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-amber-50 rounded text-sm text-gray-700 border border-amber-200">
      <h4 className="font-semibold text-amber-800 mb-2">Habilidades da Origem</h4>
      <div className="space-y-2">
        {habilidades.map((habilidade) => (
          <div key={getIdHabilidade(habilidade)} className="border-l-2 border-amber-300 pl-3">
            <div className="flex justify-between items-start mb-1">
              <h5 className="font-semibold text-sm text-gray-900">{habilidade.nome}</h5>
              {habilidade.opcional && (
                <span className="text-xs bg-amber-200 px-2 py-1 rounded">
                  Opcional
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {habilidade.descricao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrigemHabilidadesInfo;
