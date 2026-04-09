'use client';

import React, { useState } from 'react';
import { Personagem } from '@/types';

interface PDFExportOptions {
  layout: 'single' | 'double';
  includeImage: boolean;
  showCalculations: boolean;
  extraSections: string[];
  editable: boolean;
}

interface ExportadorPDFProps {
  personagem: Personagem;
  onExport?: (options: PDFExportOptions) => void;
}

const ExportadorPDF: React.FC<ExportadorPDFProps> = ({ personagem, onExport }) => {
  const [options, setOptions] = useState<PDFExportOptions>({
    layout: 'single',
    includeImage: false,
    showCalculations: true,
    extraSections: ['skills'],
    editable: true,
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

      const params = new URLSearchParams({
        layout: options.layout,
        include_image: options.includeImage.toString(),
        show_calculations: options.showCalculations.toString(),
        editable: options.editable.toString(),
        extra_sections: options.extraSections.join(',')
      });

      // Enviar header de sessao para autenticacao
      const sessionId = typeof window !== 'undefined' ? window.localStorage.getItem('user_session_id') : null;
      const headers: Record<string, string> = {};
      if (sessionId) {
        headers['X-User-Session-ID'] = sessionId;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/personagens/${personagem.id}/export-pdf?${params}`,
        {
          credentials: 'include',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ficha_${personagem.nome}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (onExport) {
        onExport(options);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExtraSection = (section: string) => {
    setOptions(prev => ({
      ...prev,
      extraSections: prev.extraSections.includes(section)
        ? prev.extraSections.filter(s => s !== section)
        : [...prev.extraSections, section]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-red-800 to-red-900 rounded-lg text-white">
        <h2 className="text-xl font-bold">Exportar Ficha de Personagem</h2>
        <span className="text-sm bg-white/20 rounded-lg px-3 py-1">{personagem.nome}</span>
      </div>

      {/* Layout */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Layout</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['single', 'double'] as const).map(layout => (
            <button
              key={layout}
              type="button"
              onClick={() => setOptions(prev => ({ ...prev, layout }))}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                options.layout === layout
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-800 text-sm">
                {layout === 'single' ? 'Pagina Unica' : 'Duas Paginas'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {layout === 'single'
                  ? 'Ficha compacta para impressao rapida'
                  : 'Ficha completa com inventario e historico'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Opcoes */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Formato</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.editable}
              onChange={(e) => setOptions(prev => ({ ...prev, editable: e.target.checked }))}
              className="w-4 h-4 text-red-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">PDF Editavel</span>
              <span className="text-xs text-green-700 ml-2 bg-green-100 px-1.5 py-0.5 rounded">Recomendado</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showCalculations}
              onChange={(e) => setOptions(prev => ({ ...prev, showCalculations: e.target.checked }))}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm font-medium text-gray-800">Mostrar Calculos</span>
          </label>
        </div>
      </div>

      {/* Secoes */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Secoes Incluidas</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'skills', name: 'Pericias' },
            { id: 'inventory', name: 'Inventario' },
            { id: 'notes', name: 'Anotacoes' },
            { id: 'history', name: 'Historico' },
          ].map(section => (
            <label
              key={section.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                options.extraSections.includes(section.id)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={options.extraSections.includes(section.id)}
                onChange={() => toggleExtraSection(section.id)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700">{section.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Botao de Export */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Gerando PDF...</span>
          </>
        ) : (
          <span>Baixar Ficha em PDF</span>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        PDFs editaveis funcionam melhor no Adobe Acrobat Reader, PDF24 e Foxit Reader.
      </p>
    </div>
  );
};

export default ExportadorPDF;
