"use client";
import React from "react";
import SeletorPoderesClasse from "../SeletorPoderesClasse";

export default function StepClass({ personagem, setPersonagem, classes, classeEscolhida, poderesClasseSelecionados, setPoderesClasseSelecionados, errors, getId }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Escolha sua Classe</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
        <select
          value={personagem.classe_id ? String(personagem.classe_id) : ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            setPersonagem((prev: any) => ({ ...prev, classe_id: value }));
          }}
          className={`w-full p-3 border rounded-lg text-black ${errors?.classe_id ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Selecione uma classe</option>
          {classes.map((c: any) => (
            <option key={getId(c)} value={getId(c)}>{c.nome}</option>
          ))}
        </select>
      </div>

      {classeEscolhida && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
          <p className="font-medium text-blue-800 mb-1">{classeEscolhida.nome}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white p-2 rounded border">
              <span className="text-xs text-gray-500">PV 1o nivel</span>
              <span className="block font-bold text-red-600">{classeEscolhida.pvprimeironivelc || classeEscolhida.pvpornivel} + CON</span>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="text-xs text-gray-500">PV por nivel</span>
              <span className="block font-bold text-red-600">{classeEscolhida.pvpornivel} + CON</span>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="text-xs text-gray-500">PM 1o nivel</span>
              <span className="block font-bold text-blue-600">{classeEscolhida.pmprimeironivelc || classeEscolhida.pmpornivel}</span>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="text-xs text-gray-500">PM por nivel</span>
              <span className="block font-bold text-blue-600">{classeEscolhida.pmpornivel}</span>
            </div>
          </div>
        </div>
      )}

      {personagem.classe_id && classeEscolhida && (
        <SeletorPoderesClasse
          classeId={personagem.classe_id}
          classeNome={classeEscolhida.nome}
          nivel={personagem.nivel || 1}
          poderesSelecionados={poderesClasseSelecionados}
          onPoderesSelecionados={setPoderesClasseSelecionados}
        />
      )}
    </div>
  );
}
