'use client';

import React, { useState } from 'react';
import { Personagem } from '@/types';
import { exportarPDF } from '@/lib/pdfExporter';

interface ExportadorPDFProps {
  personagem: Personagem;
  onExport?: () => void;
}

const ExportadorPDF: React.FC<ExportadorPDFProps> = ({ personagem, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const blob = await exportarPDF(personagem);

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${personagem.nome || 'personagem'}-ficha-t20.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onExport?.();
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      setError('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Exportar Ficha PDF</h3>
      <p className="text-sm text-gray-600 mb-4">
        Gera a ficha oficial do T20 preenchida com os dados do personagem.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 disabled:bg-gray-400 transition-colors"
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Gerando PDF...
          </span>
        ) : (
          'Baixar Ficha T20 (PDF)'
        )}
      </button>
    </div>
  );
};

export default ExportadorPDF;
