"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import SeletorPoderesDivinos from "../SeletorPoderesDivinos";

export default function StepOriginDeity({ personagem, setPersonagem, origens, divindades, beneficiosOrigem, setBeneficiosOrigem, poderesDivinosSelecionados, setPoderesDivinosSelecionados, errors, getId }: any) {
  const origemSelecionada = origens.find((o: any) => getId(o) === personagem.origem_id);
  const divindadeSelecionada = divindades.find((d: any) => getId(d) === personagem.divindade_id);

  // Carregar pericias e poderes de origem para o SeletorBeneficiosOrigem inline
  const [periciasOrigem, setPericiasOrigem] = useState<any[]>([]);
  const [poderesOrigem, setPoderesOrigem] = useState<any[]>([]);

  useEffect(() => {
    if (personagem.origem_id) {
      api.getPericiasOrigem(personagem.origem_id).then((data: any) => {
        setPericiasOrigem(Array.isArray(data) ? data : []);
      }).catch(() => setPericiasOrigem([]));

      api.getPoderesOrigem(personagem.origem_id).then((data: any) => {
        setPoderesOrigem(Array.isArray(data) ? data : []);
      }).catch(() => setPoderesOrigem([]));
    }
  }, [personagem.origem_id]);

  const toggleBeneficioPericia = (id: number) => {
    const total = (beneficiosOrigem.pericias?.length || 0) + (beneficiosOrigem.poderes?.length || 0);
    if (beneficiosOrigem.pericias?.includes(id)) {
      setBeneficiosOrigem({ ...beneficiosOrigem, pericias: beneficiosOrigem.pericias.filter((p: number) => p !== id) });
    } else if (total < 2) {
      setBeneficiosOrigem({ ...beneficiosOrigem, pericias: [...(beneficiosOrigem.pericias || []), id] });
    }
  };

  const toggleBeneficioPoder = (id: number) => {
    const total = (beneficiosOrigem.pericias?.length || 0) + (beneficiosOrigem.poderes?.length || 0);
    if (beneficiosOrigem.poderes?.includes(id)) {
      setBeneficiosOrigem({ ...beneficiosOrigem, poderes: beneficiosOrigem.poderes.filter((p: number) => p !== id) });
    } else if (total < 2) {
      setBeneficiosOrigem({ ...beneficiosOrigem, poderes: [...(beneficiosOrigem.poderes || []), id] });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Origem e Divindade</h2>

      {/* Origem */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
        <select
          value={personagem.origem_id ? String(personagem.origem_id) : ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            if (value !== personagem.origem_id) {
              setBeneficiosOrigem({ pericias: [], poderes: [] });
            }
            setPersonagem((prev: any) => ({ ...prev, origem_id: value }));
          }}
          className={`w-full p-3 border rounded-lg text-black ${errors?.origem_id ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Selecione uma origem</option>
          {origens.map((o: any) => (
            <option key={getId(o)} value={getId(o)}>{o.nome}</option>
          ))}
        </select>
      </div>

      {origemSelecionada && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-700">
          <p className="font-medium text-purple-800">{origemSelecionada.nome}</p>
          {origemSelecionada.descricao && <p className="mt-1 text-xs">{origemSelecionada.descricao}</p>}
        </div>
      )}

      {/* Beneficios de origem inline */}
      {personagem.origem_id && (periciasOrigem.length > 0 || poderesOrigem.length > 0) && (
        <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
          <h3 className="text-sm font-semibold text-purple-800 mb-2">
            Beneficios de Origem (escolha 2)
            <span className="text-xs font-normal text-purple-600 ml-2">
              {(beneficiosOrigem.pericias?.length || 0) + (beneficiosOrigem.poderes?.length || 0)}/2 selecionados
            </span>
          </h3>

          {periciasOrigem.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Pericias:</p>
              <div className="flex flex-wrap gap-2">
                {periciasOrigem.map((p: any) => (
                  <button
                    key={getId(p)}
                    type="button"
                    onClick={() => toggleBeneficioPericia(getId(p))}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      beneficiosOrigem.pericias?.includes(getId(p))
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {poderesOrigem.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Poderes:</p>
              <div className="flex flex-wrap gap-2">
                {poderesOrigem.map((p: any) => (
                  <button
                    key={getId(p)}
                    type="button"
                    onClick={() => toggleBeneficioPoder(getId(p))}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      beneficiosOrigem.poderes?.includes(getId(p))
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <hr className="border-gray-200" />

      {/* Divindade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Divindade (opcional)</label>
        <select
          value={personagem.divindade_id ? String(personagem.divindade_id) : ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            setPersonagem((prev: any) => ({ ...prev, divindade_id: value }));
            setPoderesDivinosSelecionados([]);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg text-black"
        >
          <option value="">Nenhuma divindade</option>
          {divindades.map((d: any) => (
            <option key={getId(d)} value={getId(d)}>{d.nome}</option>
          ))}
        </select>
      </div>

      {divindadeSelecionada && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-700">
          <p className="font-medium text-yellow-800">{divindadeSelecionada.nome}</p>
          {divindadeSelecionada.dominio && <p className="text-xs">Dominio: {divindadeSelecionada.dominio}</p>}
        </div>
      )}

      {personagem.divindade_id && (
        <SeletorPoderesDivinos
          divindadeId={personagem.divindade_id}
          nivelPersonagem={personagem.nivel || 1}
          classeId={personagem.classe_id || null}
          poderesSelecionados={poderesDivinosSelecionados}
          onPoderesSelecionados={setPoderesDivinosSelecionados}
        />
      )}
    </div>
  );
}
