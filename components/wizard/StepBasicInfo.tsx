"use client";
import React from "react";

export default function StepBasicInfo({ personagem, setPersonagem, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Informacoes Basicas</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Personagem</label>
        <input
          type="text"
          value={personagem.nome || ''}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Thorin, Alara, Kael..."
          className={`w-full p-3 border rounded-lg text-black ${errors?.nome ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors?.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
        <input
          type="number"
          min={1}
          max={20}
          value={personagem.nivel || 1}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, nivel: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) }))}
          className="w-full p-3 border border-gray-300 rounded-lg text-black"
        />
        <p className="text-xs text-gray-500 mt-1">Nivel 1 a 20. Se voce esta criando um personagem novo, comece com nivel 1.</p>
      </div>
    </div>
  );
}
