"use client";
import React from "react";
import SeletorPericias from "../SeletorPericias";

export default function StepSkills({ personagem, periciasEscolhidas, setPericiasEscolhidas, classeEscolhida }: any) {
  if (!personagem.classe_id) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Selecione uma classe primeiro (Step 3) para ver as pericias disponiveis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Escolha suas Pericias</h2>
      <p className="text-sm text-gray-600">
        Selecione as pericias treinadas do seu personagem.
        {classeEscolhida && (
          <span className="font-medium"> {classeEscolhida.nome} pode escolher {classeEscolhida.pericias_quantidade || 2} pericias.</span>
        )}
      </p>

      <SeletorPericias
        classeId={personagem.classe_id}
        racaId={personagem.raca_id || null}
        periciasEscolhidas={periciasEscolhidas}
        onPericiasChange={setPericiasEscolhidas}
      />
    </div>
  );
}
