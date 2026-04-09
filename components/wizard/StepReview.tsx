"use client";
import React from "react";

export default function StepReview({ personagem, racaSelecionada, classeEscolhida, origens, divindades, periciasEscolhidas, poderesClasseSelecionados, poderesDivinosSelecionados, beneficiosOrigem, calculateTotalPV, calculateTotalPM, handleSubmit, isSubmitting, isEditing, getId }: any) {
  const origemSelecionada = origens?.find((o: any) => getId(o) === personagem.origem_id);
  const divindadeSelecionada = divindades?.find((d: any) => getId(d) === personagem.divindade_id);
  const defesa = 10 + (personagem.des || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Revisao do Personagem</h2>

      {/* Info basica */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500 uppercase">Nome</span>
          <p className="font-bold text-gray-800 text-lg">{personagem.nome || '-'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500 uppercase">Nivel</span>
          <p className="font-bold text-gray-800 text-lg">{personagem.nivel}</p>
        </div>
      </div>

      {/* Raca, Classe, Origem, Divindade */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <span className="text-xs text-green-600 uppercase">Raca</span>
          <p className="font-semibold text-gray-800">{racaSelecionada?.nome || '-'}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <span className="text-xs text-blue-600 uppercase">Classe</span>
          <p className="font-semibold text-gray-800">{classeEscolhida?.nome || '-'}</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
          <span className="text-xs text-purple-600 uppercase">Origem</span>
          <p className="font-semibold text-gray-800">{origemSelecionada?.nome || '-'}</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <span className="text-xs text-yellow-600 uppercase">Divindade</span>
          <p className="font-semibold text-gray-800">{divindadeSelecionada?.nome || 'Nenhuma'}</p>
        </div>
      </div>

      {/* Stats de combate */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 bg-red-600 text-white rounded-lg">
          <div className="text-2xl font-bold">{calculateTotalPV()}</div>
          <div className="text-xs uppercase mt-1">PV</div>
        </div>
        <div className="text-center p-4 bg-blue-600 text-white rounded-lg">
          <div className="text-2xl font-bold">{calculateTotalPM()}</div>
          <div className="text-xs uppercase mt-1">PM</div>
        </div>
        <div className="text-center p-4 bg-green-600 text-white rounded-lg">
          <div className="text-2xl font-bold">{defesa}</div>
          <div className="text-xs uppercase mt-1">Defesa</div>
        </div>
      </div>

      {/* Atributos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Atributos</h3>
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: 'FOR', value: personagem.for },
            { label: 'DES', value: personagem.des },
            { label: 'CON', value: personagem.con },
            { label: 'INT', value: personagem.int },
            { label: 'SAB', value: personagem.sab },
            { label: 'CAR', value: personagem.car },
          ].map(attr => (
            <div key={attr.label} className="text-center p-2 bg-gray-100 rounded">
              <div className="text-xs text-gray-500">{attr.label}</div>
              <div className="font-bold text-gray-800">{attr.value >= 0 ? '+' : ''}{attr.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo de selecoes */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>Pericias selecionadas: <span className="font-medium text-gray-800">{periciasEscolhidas?.length || 0}</span></p>
        {poderesClasseSelecionados?.length > 0 && <p>Poderes de classe: <span className="font-medium text-gray-800">{poderesClasseSelecionados.length}</span></p>}
        {poderesDivinosSelecionados?.length > 0 && <p>Poderes divinos: <span className="font-medium text-gray-800">{poderesDivinosSelecionados.length}</span></p>}
        {(beneficiosOrigem?.pericias?.length > 0 || beneficiosOrigem?.poderes?.length > 0) && (
          <p>Beneficios de origem: <span className="font-medium text-gray-800">{(beneficiosOrigem?.pericias?.length || 0) + (beneficiosOrigem?.poderes?.length || 0)}</span></p>
        )}
        {personagem.itens?.length > 0 && <p>Itens no inventario: <span className="font-medium text-gray-800">{personagem.itens.length}</span></p>}
      </div>

      {/* Botao principal */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-red-700 text-white rounded-lg font-bold text-lg hover:bg-red-800 disabled:bg-gray-400 shadow-md"
      >
        {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Personagem' : 'Criar Personagem'}
      </button>
    </div>
  );
}
