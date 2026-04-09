"use client";
import React, { useState, useEffect } from "react";
import { PersonagemItem } from "@/types";
import { categoriasItens, ItemPreDefinido, todosOsItens, itensIniciaisPorOrigem } from "@/data/itensT20";

export default function StepExtras({ personagem, setPersonagem, origens, getId }: any) {
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [modoManual, setModoManual] = useState(false);
  const [novoItem, setNovoItem] = useState({ nome: '', tipo: 'item', quantidade: 1, peso: 0, valor: 0, descricao: '' });

  const itens: PersonagemItem[] = personagem.itens || [];

  const origemNome = origens?.find((o: any) => getId(o) === personagem.origem_id)?.nome || '';

  // Aplicar kit inicial AUTOMATICAMENTE quando o step abre (nivel 1, sem itens)
  useEffect(() => {
    if (personagem.nivel === 1 && (!personagem.itens || personagem.itens.length === 0)) {
      const itensIniciais: PersonagemItem[] = [];

      // Itens base de todo personagem nivel 1 (regra T20)
      const itensBase = ['Mochila', 'Saco de dormir', 'Traje de viajante'];
      itensBase.forEach(nome => {
        const item = todosOsItens.find(i => i.nome === nome);
        if (item) {
          itensIniciais.push({ nome: item.nome, tipo: item.tipo, quantidade: 1, peso: item.peso, valor: item.preco, descricao: '' });
        }
      });

      // Itens da origem
      if (origemNome) {
        const itensOrigem = itensIniciaisPorOrigem[origemNome] || [];
        itensOrigem.forEach(nomeItem => {
          // Se tem "ou", pega o primeiro como sugestao
          const nomeReal = nomeItem.includes(' ou ') ? nomeItem.split(' ou ')[0].trim() : nomeItem;
          const item = todosOsItens.find(i => i.nome === nomeReal);
          if (item) {
            itensIniciais.push({ nome: item.nome, tipo: item.tipo, quantidade: 1, peso: item.peso, valor: item.preco, descricao: '' });
          } else {
            // Item nao encontrado no catalogo, adicionar como texto
            itensIniciais.push({ nome: nomeReal, tipo: 'equipamento', quantidade: 1, peso: 0, valor: 0, descricao: 'Item da origem' });
          }
        });
      }

      if (itensIniciais.length > 0) {
        setPersonagem((prev: any) => ({ ...prev, itens: itensIniciais }));
      }
    }
  }, []); // Roda uma vez ao montar o step

  const adicionarItemPreDefinido = (item: ItemPreDefinido) => {
    const existente = itens.findIndex(i => i.nome === item.nome);
    if (existente >= 0) {
      const novosItens = [...itens];
      novosItens[existente] = { ...novosItens[existente], quantidade: novosItens[existente].quantidade + 1 };
      setPersonagem((prev: any) => ({ ...prev, itens: novosItens }));
    } else {
      const novoPersonagemItem: PersonagemItem = {
        nome: item.nome,
        tipo: item.tipo,
        quantidade: 1,
        peso: item.peso,
        valor: item.preco,
        descricao: [item.dano, item.critico, item.tipoDano, item.alcance, item.bonusDefesa ? `Def +${item.bonusDefesa}` : ''].filter(Boolean).join(' | '),
      };
      setPersonagem((prev: any) => ({ ...prev, itens: [...(prev.itens || []), novoPersonagemItem] }));
    }
  };

  const adicionarItemManual = () => {
    if (!novoItem.nome.trim()) return;
    setPersonagem((prev: any) => ({ ...prev, itens: [...(prev.itens || []), { ...novoItem }] }));
    setNovoItem({ nome: '', tipo: 'item', quantidade: 1, peso: 0, valor: 0, descricao: '' });
  };

  const removerItem = (index: number) => {
    const novosItens = itens.filter((_: any, i: number) => i !== index);
    setPersonagem((prev: any) => ({ ...prev, itens: novosItens }));
  };

  const itensFiltrados = busca.trim()
    ? categoriasItens.map(cat => ({
        ...cat,
        itens: cat.itens.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()))
      })).filter(cat => cat.itens.length > 0)
    : categoriasItens;

  const pesoTotal = itens.reduce((acc: number, item: PersonagemItem) => acc + (item.peso * item.quantidade), 0);
  const valorTotal = itens.reduce((acc: number, item: PersonagemItem) => acc + (item.valor * item.quantidade), 0);

  return (
    <div className="space-y-6">
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
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
        />
      </div>

      {/* Inventario atual */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Inventario</h3>
          <div className="text-xs text-gray-500">
            {itens.length} itens | {pesoTotal} espacos | T$ {valorTotal.toFixed(2)} valor
          </div>
        </div>

        {itens.length > 0 ? (
          <div className="space-y-1 mb-4">
            {itens.map((item: PersonagemItem, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-sm">
                <span className="flex-1 text-gray-800 font-medium">{item.nome}</span>
                <span className="text-gray-500 text-xs">x{item.quantidade}</span>
                {item.peso > 0 && <span className="text-gray-400 text-xs">{item.peso * item.quantidade} esp</span>}
                {item.valor > 0 && <span className="text-yellow-600 text-xs">T${item.valor}</span>}
                {item.descricao && <span className="text-gray-400 text-xs hidden sm:inline">{item.descricao}</span>}
                <button onClick={() => removerItem(i)} className="text-red-400 hover:text-red-600 text-xs px-1 font-bold">X</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-4">Nenhum item adicionado. Escolha abaixo.</p>
        )}
      </div>

      {/* Catalogo de itens T20 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Catalogo T20</h3>
          <button
            onClick={() => setModoManual(!modoManual)}
            className="text-xs text-red-600 hover:text-red-800 underline ml-auto"
          >
            {modoManual ? 'Voltar ao catalogo' : 'Adicionar item manual'}
          </button>
        </div>

        {modoManual ? (
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border">
            <input
              type="text" placeholder="Nome do item" value={novoItem.nome}
              onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
              className="col-span-5 p-2 border border-gray-300 rounded text-sm text-gray-800"
            />
            <select
              value={novoItem.tipo}
              onChange={(e) => setNovoItem(prev => ({ ...prev, tipo: e.target.value }))}
              className="col-span-2 p-2 border border-gray-300 rounded text-sm text-gray-800"
            >
              <option value="item">Item</option>
              <option value="arma">Arma</option>
              <option value="armadura">Armadura</option>
              <option value="consumivel">Consumivel</option>
            </select>
            <input
              type="number" min={1} placeholder="Qtd" value={novoItem.quantidade}
              onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
              className="col-span-1 p-2 border border-gray-300 rounded text-sm text-gray-800"
            />
            <input
              type="number" min={0} step={0.1} placeholder="Peso" value={novoItem.peso || ''}
              onChange={(e) => setNovoItem(prev => ({ ...prev, peso: parseFloat(e.target.value) || 0 }))}
              className="col-span-2 p-2 border border-gray-300 rounded text-sm text-gray-800"
            />
            <button
              onClick={adicionarItemManual} disabled={!novoItem.nome.trim()}
              className="col-span-2 p-2 bg-red-700 text-white rounded text-sm hover:bg-red-800 disabled:bg-gray-300"
            >
              Adicionar
            </button>
          </div>
        ) : (
          <>
            <input
              type="text" placeholder="Buscar item..." value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 mb-3"
            />

            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {itensFiltrados.map(cat => (
                <div key={cat.key}>
                  <button
                    onClick={() => setCategoriaAberta(categoriaAberta === cat.key ? null : cat.key)}
                    className="w-full flex items-center justify-between p-2.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
                  >
                    <span>{cat.label} ({cat.itens.length})</span>
                    <span className="text-gray-400">{categoriaAberta === cat.key ? '\u25B2' : '\u25BC'}</span>
                  </button>
                  {(categoriaAberta === cat.key || busca.trim()) && (
                    <div className="pl-2 py-1 space-y-0.5">
                      {cat.itens.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => adicionarItemPreDefinido(item)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-red-50 rounded text-left text-sm transition-colors group"
                        >
                          <span className="text-green-600 font-bold text-xs opacity-0 group-hover:opacity-100">+</span>
                          <span className="flex-1 text-gray-800">{item.nome}</span>
                          {item.dano && <span className="text-red-600 text-xs">{item.dano}</span>}
                          {item.bonusDefesa && <span className="text-blue-600 text-xs">+{item.bonusDefesa} Def</span>}
                          <span className="text-yellow-600 text-xs">T${item.preco}</span>
                          <span className="text-gray-400 text-xs">{item.peso} esp</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Anotacoes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Anotacoes</label>
        <textarea
          rows={3} value={personagem.anotacoes || ''}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, anotacoes: e.target.value }))}
          placeholder="Anotacoes gerais sobre seu personagem..."
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 text-sm"
        />
      </div>

      {/* Historico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Historico / Background</label>
        <textarea
          rows={3} value={personagem.historico || ''}
          onChange={(e) => setPersonagem((prev: any) => ({ ...prev, historico: e.target.value }))}
          placeholder="Conte a historia do seu personagem..."
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 text-sm"
        />
      </div>
    </div>
  );
}
