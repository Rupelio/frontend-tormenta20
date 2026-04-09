"use client";
import React, { useState } from "react";
import { PersonagemItem } from "@/types";

export default function StepExtras({ personagem, setPersonagem }: any) {
  const [novoItem, setNovoItem] = useState({ nome: '', tipo: 'item', quantidade: 1, peso: 0, valor: 0, descricao: '' });

  const itens: PersonagemItem[] = personagem.itens || [];

  const adicionarItem = () => {
    if (!novoItem.nome.trim()) return;
    const novosItens = [...itens, { ...novoItem, id: Date.now() }];
    setPersonagem((prev: any) => ({ ...prev, itens: novosItens }));
    setNovoItem({ nome: '', tipo: 'item', quantidade: 1, peso: 0, valor: 0, descricao: '' });
  };

  const removerItem = (index: number) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setPersonagem((prev: any) => ({ ...prev, itens: novosItens }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800">Inventario e Extras</h2>

      {/* Dinheiro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dinheiro (T$)</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={personagem.dinheiro || 0}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, dinheiro: parseFloat(e.target.value) || 0 }))}
          className="w-full p-3 border border-gray-300 rounded-lg text-black"
        />
      </div>

      {/* Inventario */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Inventario</h3>

        {/* Lista de itens */}
        {itens.length > 0 && (
          <div className="mb-3 space-y-2">
            {itens.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-sm">
                <span className="flex-1 text-gray-800 font-medium">{item.nome}</span>
                <span className="text-gray-500">x{item.quantidade}</span>
                {item.peso > 0 && <span className="text-gray-400">{item.peso}kg</span>}
                {item.valor > 0 && <span className="text-yellow-600">T${item.valor}</span>}
                <button onClick={() => removerItem(i)} className="text-red-500 hover:text-red-700 text-xs px-2">X</button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar item */}
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Nome do item"
            value={novoItem.nome}
            onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
            className="col-span-5 p-2 border border-gray-300 rounded text-sm text-black"
          />
          <select
            value={novoItem.tipo}
            onChange={(e) => setNovoItem(prev => ({ ...prev, tipo: e.target.value }))}
            className="col-span-2 p-2 border border-gray-300 rounded text-sm text-black"
          >
            <option value="item">Item</option>
            <option value="arma">Arma</option>
            <option value="armadura">Armadura</option>
            <option value="consumivel">Consumivel</option>
          </select>
          <input
            type="number" min={1} placeholder="Qtd"
            value={novoItem.quantidade}
            onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
            className="col-span-1 p-2 border border-gray-300 rounded text-sm text-black"
          />
          <input
            type="number" min={0} step={0.1} placeholder="Peso"
            value={novoItem.peso || ''}
            onChange={(e) => setNovoItem(prev => ({ ...prev, peso: parseFloat(e.target.value) || 0 }))}
            className="col-span-2 p-2 border border-gray-300 rounded text-sm text-black"
          />
          <button
            onClick={adicionarItem}
            disabled={!novoItem.nome.trim()}
            className="col-span-2 p-2 bg-red-700 text-white rounded text-sm hover:bg-red-800 disabled:bg-gray-300"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Anotacoes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Anotacoes</label>
        <textarea
          rows={4}
          value={personagem.anotacoes || ''}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, anotacoes: e.target.value }))}
          placeholder="Anotacoes gerais sobre seu personagem..."
          className="w-full p-3 border border-gray-300 rounded-lg text-black text-sm"
        />
      </div>

      {/* Historico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Historico / Background</label>
        <textarea
          rows={4}
          value={personagem.historico || ''}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, historico: e.target.value }))}
          placeholder="Conte a historia do seu personagem..."
          className="w-full p-3 border border-gray-300 rounded-lg text-black text-sm"
        />
      </div>
    </div>
  );
}
