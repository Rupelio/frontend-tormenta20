"use client";
import React from "react";
import PointBuyCalculator from "../PointBuyCalculator";
import { StatsCalculator } from "../StatsCalculator";

export default function StepAttributes({ personagem, baseAtributos, setBaseAtributos, racaSelecionada, classeEscolhida, atributosLivresEscolhidos, setAtributosLivresEscolhidos, temAtributosLivres }: any) {
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
        classeEscolhida={classeEscolhida}
        racaSelecionada={racaSelecionada}
        atributosLivresEscolhidos={atributosLivresEscolhidos}
      />
    </div>
  );
}
