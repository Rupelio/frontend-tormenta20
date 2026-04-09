"use client";
import React from "react";
import PointBuyCalculator from "../PointBuyCalculator";
import { StatsCalculator } from "../StatsCalculator";

export default function StepAttributes({ personagem, baseAtributos, setBaseAtributos, racaSelecionada, atributosLivresEscolhidos, setAtributosLivresEscolhidos, temAtributosLivres, calculateTotalPV, calculateTotalPM }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Distribua seus Atributos</h2>

      <PointBuyCalculator
        atributos={baseAtributos}
        onChange={setBaseAtributos}
        racaSelecionada={racaSelecionada}
        atributosLivresEscolhidos={atributosLivresEscolhidos}
        onAtributosLivresChange={temAtributosLivres ? setAtributosLivresEscolhidos : undefined}
      />

      <StatsCalculator
        personagem={personagem}
        racaSelecionada={racaSelecionada}
        atributosLivresEscolhidos={atributosLivresEscolhidos}
      />
    </div>
  );
}
