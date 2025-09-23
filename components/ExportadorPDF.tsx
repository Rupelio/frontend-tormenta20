'use client';

import React, { useState } from 'react';
import { Personagem } from '@/types';

interface PDFExportOptions {
  layout: 'single' | 'double';
  includeImage: boolean;
  showCalculations: boolean;
  extraSections: string[];
  editable: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
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
    customColors: {
      primary: '#1E40AF',    // Azul mais vibrante para melhor contraste
      secondary: '#3B82F6',  // Azul claro complementar
      accent: '#F59E0B'      // Âmbar dourado para destaques
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

      // Construir URL com parâmetros
      const params = new URLSearchParams({
        layout: options.layout,
        include_image: options.includeImage.toString(),
        show_calculations: options.showCalculations.toString(),
        editable: options.editable.toString(),
        extra_sections: options.extraSections.join(',')
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/${personagem.id}/export-pdf?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      // Obter o PDF como blob
      const blob = await response.blob();

      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ficha_${personagem.nome}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpar
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

  const handlePreview = async () => {
    setShowPreview(true);
    // Implementar preview posteriormente
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
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
        <h2 className="text-2xl font-bold">
          📄 Exportar Ficha de Personagem
        </h2>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-sm opacity-90">Personagem:</span>
          <span className="font-semibold">{personagem.nome}</span>
        </div>
      </div>

      {/* Opções de Layout */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-blue-100 p-2 rounded-lg mr-2">📋</span>
          Layout da Ficha
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105 ${
              options.layout === 'single'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setOptions(prev => ({ ...prev, layout: 'single' }))}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📄</div>
              <h4 className="font-semibold text-gray-800">Página Única</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ficha compacta ideal para impressão rápida
              </p>
              {options.layout === 'single' && (
                <div className="mt-2 text-blue-600 font-medium text-sm">✓ Selecionado</div>
              )}
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105 ${
              options.layout === 'double'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setOptions(prev => ({ ...prev, layout: 'double' }))}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📃📃</div>
              <h4 className="font-semibold text-gray-800">Duas Páginas</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ficha completa com inventário e histórico
              </p>
              {options.layout === 'double' && (
                <div className="mt-2 text-blue-600 font-medium text-sm">✓ Selecionado</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formato do PDF */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-green-100 p-2 rounded-lg mr-2">✏️</span>
          Formato do PDF
        </h3>
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
            <input
              type="checkbox"
              checked={options.editable}
              onChange={(e) => setOptions(prev => ({ ...prev, editable: e.target.checked }))}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">PDF Editável</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recomendado</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Cria campos que podem ser preenchidos em Adobe Acrobat, apps mobile, etc.
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
            <input
              type="checkbox"
              checked={options.showCalculations}
              onChange={(e) => setOptions(prev => ({ ...prev, showCalculations: e.target.checked }))}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-800">Mostrar Cálculos</span>
              <p className="text-sm text-gray-600 mt-1">
                Inclui modificadores raciais e cálculos de atributos
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
            <input
              type="checkbox"
              checked={options.includeImage}
              onChange={(e) => setOptions(prev => ({ ...prev, includeImage: e.target.checked }))}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-800">Incluir Imagem do Personagem</span>
              <p className="text-sm text-gray-600 mt-1">
                Adiciona espaço para foto/artwork do personagem
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Seções Extras */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-yellow-100 p-2 rounded-lg mr-2">📚</span>
          Seções Incluídas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'skills', name: 'Perícias', icon: '🎯', description: 'Lista completa de perícias do sistema', color: 'border-green-300 hover:bg-green-50' },
            { id: 'inventory', name: 'Inventário', icon: '🎒', description: 'Tabela para itens e equipamentos', color: 'border-blue-300 hover:bg-blue-50' },
            { id: 'notes', name: 'Anotações', icon: '📝', description: 'Espaço livre para anotações', color: 'border-yellow-300 hover:bg-yellow-50' },
            { id: 'history', name: 'Histórico', icon: '📖', description: 'Background e história do personagem', color: 'border-purple-300 hover:bg-purple-50' }
          ].map(section => (
            <label key={section.id} className={`flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all transform hover:scale-105 ${section.color} ${options.extraSections.includes(section.id) ? 'bg-gray-50 border-gray-400 shadow-md' : ''}`}>
              <input
                type="checkbox"
                checked={options.extraSections.includes(section.id)}
                onChange={() => toggleExtraSection(section.id)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-semibold text-gray-800">{section.name}</span>
                  {options.extraSections.includes(section.id) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Incluído</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Personalização de Cores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="bg-pink-100 p-2 rounded-lg mr-2">🎨</span>
          Personalização de Cores
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Cor Principal</label>
            <div className="space-y-2">
              <input
                type="color"
                value={options.customColors?.primary || '#1E40AF'}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  customColors: { ...prev.customColors, primary: e.target.value }
                }))}
                className="w-full h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-all"
              />
              <p className="text-xs text-gray-600 text-center">Títulos e bordas</p>
            </div>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Cor Secundária</label>
            <div className="space-y-2">
              <input
                type="color"
                value={options.customColors?.secondary || '#3B82F6'}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  customColors: { ...prev.customColors, secondary: e.target.value }
                }))}
                className="w-full h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-all"
              />
              <p className="text-xs text-gray-600 text-center">Fundos e detalhes</p>
            </div>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-all">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Cor de Destaque</label>
            <div className="space-y-2">
              <input
                type="color"
                value={options.customColors?.accent || '#F59E0B'}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  customColors: { ...prev.customColors, accent: e.target.value }
                }))}
                className="w-full h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition-all"
              />
              <p className="text-xs text-gray-600 text-center">Destaques especiais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={handlePreview}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <span className="text-lg">👁️</span>
          <span>Pré-visualizar</span>
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gerando PDF...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📥</span>
              <span>Baixar PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Informações de Compatibilidade */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Dica de Compatibilidade
        </h4>
        <p className="text-sm text-blue-700 leading-relaxed">
          Os PDFs editáveis funcionam melhor no <strong className="bg-blue-200 px-1 rounded">Adobe Acrobat Reader</strong>,
          <strong className="bg-blue-200 px-1 rounded"> PDF24</strong>, <strong className="bg-blue-200 px-1 rounded">Foxit Reader</strong> e apps mobile como
          <strong className="bg-blue-200 px-1 rounded"> Adobe Acrobat Mobile</strong>. Para melhor experiência em dispositivos móveis,
          prefira o formato de página única.
        </p>
      </div>
    </div>
  );
};

export default ExportadorPDF;
