"use client";
import React from "react";
import EscolhasRaca from "../EscolhasRaca";

export default function StepRace({ personagem, setPersonagem, racas, racaSelecionada, escolhasRaca, setEscolhasRaca, atributosLivresEscolhidos, setAtributosLivresEscolhidos, errors, getId }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Escolha sua Raca</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Raca</label>
        <select
          value={personagem.raca_id ? String(personagem.raca_id) : ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            if (value !== personagem.raca_id) {
              setEscolhasRaca({});
              setAtributosLivresEscolhidos([]);
            }
            setPersonagem((prev: any) => ({ ...prev, raca_id: value }));
          }}
          className={`w-full p-3 border rounded-lg text-black ${errors?.raca_id ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Selecione uma raca</option>
          {racas.map((raca: any) => (
            <option key={getId(raca)} value={getId(raca)}>{raca.nome}</option>
          ))}
        </select>
      </div>

      {racaSelecionada && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm text-gray-700">
          <p className="font-medium text-green-800 mb-1">{racaSelecionada.nome}</p>
          <p>Tamanho: {racaSelecionada.tamanho} | Deslocamento: {racaSelecionada.deslocamento}m</p>
          {racaSelecionada.atributo_bonus_1 && (
            <p className="mt-1">
              Bonus: +{racaSelecionada.valor_bonus_1} {racaSelecionada.atributo_bonus_1?.toUpperCase()}
              {racaSelecionada.atributo_bonus_2 && `, +${racaSelecionada.valor_bonus_2} ${racaSelecionada.atributo_bonus_2?.toUpperCase()}`}
            </p>
          )}
          {racaSelecionada.atributo_penalidade && (
            <p className="text-red-600">{racaSelecionada.valor_penalidade} {racaSelecionada.atributo_penalidade?.toUpperCase()}</p>
          )}
        </div>
      )}

      {personagem.raca_id && (
        <EscolhasRaca
          racaId={personagem.raca_id}
          escolhasAtuais={escolhasRaca}
          onEscolhasChange={setEscolhasRaca}
        />
      )}
    </div>
  );
}
