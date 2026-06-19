"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Estoque.module.css";
import { supabase } from "../../lib/supabase";  
import ProtectedRoute from "../components/ProtectedRoute";

const ITENS_POR_PAGINA = 8;

const categoriasPadrao = [
  "Produtos",
  "Insumos",
  "Revenda",
  "Serviços",
  "Embalagens",
  "Outros",
];

const produtoInicial = {
  nome: "",
  sku: "",
  codigoBarras: "",
  categoria: "Produtos",
  fornecedor: "",
  custo: "",
  venda: "",
  quantidade: "",
  estoqueMinimo: "",
};

const movimentoInicial = {
  produtoId: "",
  tipo: "entrada",
  quantidade: "",
  observacao: "",
};

function gerarSKU(nome, categoria) {
  const baseNome = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();

  const baseCategoria = categoria.substring(0, 3).toUpperCase();
  const numero = Math.floor(10000 + Math.random() * 90000);

  return `${baseCategoria}-${baseNome || "PROD"}-${numero}`;
}

function gerarCodigoBarras() {
  return String(Math.floor(1000000000000 + Math.random() * 9000000000000));
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function EstoquePage() {
  const [carregado, setCarregado] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [form, setForm] = useState(produtoInicial);
  const [movimento, setMovimento] = useState(movimentoInicial);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [produtoEditando, setProdutoEditando] = useState(null);

  

useEffect(() => {
  carregarProdutos();
  carregarMovimentacoes();
}, []);

async function carregarProdutos() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    setCarregado(true);
    return;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    setCarregado(true);
    return;
  }

  setProdutos(data || []);
  setCarregado(true);
}
async function carregarMovimentacoes() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  const { data, error } = await supabase
    .from("movimentacoes")
    .select(`
      *,
      produtos (
        nome
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  setMovimentacoes(data || []);
}

    async function cadastrarProduto(e) {
    e.preventDefault();

    if (!form.nome || !form.custo || !form.venda || !form.quantidade) {
      alert("Preencha nome, custo, venda e quantidade.");
      return;
    }

    const novoProduto = {
      id: crypto.randomUUID(),
      nome: form.nome,
      sku: form.sku || gerarSKU(form.nome, form.categoria),
      codigoBarras: form.codigoBarras || gerarCodigoBarras(),
      categoria: form.categoria,
      fornecedor: form.fornecedor || "Não informado",
      custo: Number(form.custo),
      venda: Number(form.venda),
      quantidade: Number(form.quantidade),
      estoqueMinimo: Number(form.estoqueMinimo || 0),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const novaMovimentacao = {
  id: crypto.randomUUID(),
  produtoId: novoProduto.id,
  produtoNome: novoProduto.nome,
  tipo: "entrada",
  quantidade: novoProduto.quantidade,
  observacao: "Cadastro inicial do produto",
  data: new Date().toISOString(),
};

const {
  data: { session },
} = await supabase.auth.getSession();

const produtoSupabase = {
  id: novoProduto.id,
  user_id: session.user.id,
  nome: novoProduto.nome,
  sku: novoProduto.sku,
  codigo_barras: novoProduto.codigoBarras,
  categoria: novoProduto.categoria,
  fornecedor: novoProduto.fornecedor,
  custo: novoProduto.custo,
  venda: novoProduto.venda,
  quantidade: novoProduto.quantidade,
  estoque_minimo: novoProduto.estoqueMinimo,
};

const { error } = await supabase
  .from("produtos")
  .insert([produtoSupabase]);

if (error) {
  console.log(error);
  alert("Erro ao salvar produto no Supabase");
  return;
}

setProdutos((atual) => [novoProduto, ...atual]);
setMovimentacoes((atual) => [novaMovimentacao, ...atual]);
setForm(produtoInicial);
}
  

  async function registrarMovimento(e) {
  e.preventDefault();

  const produto = produtos.find((item) => item.id === movimento.produtoId);

  if (!produto || !movimento.quantidade) {
    alert("Selecione um produto e informe a quantidade.");
    return;
  }

  const quantidadeMovimento = Number(movimento.quantidade);

  if (quantidadeMovimento <= 0) {
    alert("A quantidade precisa ser maior que zero.");
    return;
  }

  const quantidadeAtual = Number(produto.quantidade);

  if (movimento.tipo === "saida" && quantidadeMovimento > quantidadeAtual) {
    alert("Quantidade de saída maior que o estoque disponível.");
    return;
  }

  const novaQuantidade =
    movimento.tipo === "entrada"
      ? quantidadeAtual + quantidadeMovimento
      : quantidadeAtual - quantidadeMovimento;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error: erroProduto } = await supabase
    .from("produtos")
    .update({ quantidade: novaQuantidade })
    .eq("id", produto.id)
    .eq("user_id", session.user.id);

  if (erroProduto) {
    console.log(erroProduto);
    alert("Erro ao atualizar estoque.");
    return;
  }

  const { error: erroMovimento } = await supabase.from("movimentacoes").insert({
    user_id: session.user.id,
    produto_id: produto.id,
    tipo: movimento.tipo,
    quantidade: quantidadeMovimento,
    observacao: movimento.observacao || "Sem observação",
  });

  if (erroMovimento) {
    console.log(erroMovimento);
    alert("Erro ao registrar movimentação.");
    return;
  }

  setMovimento(movimentoInicial);
  await carregarProdutos();
  await carregarMovimentacoes();
}

  function abrirEdicao(produto) {
    setProdutoEditando({
      ...produto,
      custo: String(produto.custo),
      venda: String(produto.venda),
      quantidade: String(produto.quantidade),
      estoqueMinimo: String(produto.estoqueMinimo),
    });
  }


  async function salvarEdicao(e) {
    e.preventDefault();
    const { error } = await supabase
    .from("produtos")
    .update({
      nome: produtoEditando.nome,
      sku: produtoEditando.sku,
      codigo_barras: produtoEditando.codigoBarras,
      categoria: produtoEditando.categoria,
      fornecedor: produtoEditando.fornecedor,
      custo: Number(produtoEditando.custo),
      venda: Number(produtoEditando.venda),
      quantidade: Number(produtoEditando.quantidade),
      estoque_minimo: Number(produtoEditando.estoqueMinimo),
    })
    .eq("id", produtoEditando.id);

if (error) {
  console.log(error);
  alert("Erro ao salvar alterações");
  return;
}
    setProdutos((atual) =>
      atual.map((produto) =>
        produto.id === produtoEditando.id
          ? {
              ...produtoEditando,
              custo: Number(produtoEditando.custo),
              venda: Number(produtoEditando.venda),
              quantidade: Number(produtoEditando.quantidade),
              estoqueMinimo: Number(produtoEditando.estoqueMinimo),
              atualizadoEm: new Date().toISOString(),
            }
          : produto
      )
    );

    setProdutoEditando(null);
  }

  async function excluirProduto(id) {
    const confirmar = confirm("Deseja excluir este produto do estoque?");
    if (!confirmar) return;

    const { error } = await supabase
  .from("produtos")
  .delete()
  .eq("id", id);

if (error) {
  console.log(error);
  alert("Erro ao excluir produto");
  return;
}

    setProdutos((atual) => atual.filter((produto) => produto.id !== id));
    setMovimentacoes((atual) =>
      atual.filter((movimentacao) => movimentacao.produtoId !== id)
    );
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = pesquisa.toLowerCase();

      const busca =
        produto.nome.toLowerCase().includes(texto) ||
        produto.sku.toLowerCase().includes(texto) ||
        produto.codigoBarras.includes(pesquisa) ||
        produto.fornecedor.toLowerCase().includes(texto);

      const categoriaOk =
        categoriaFiltro === "Todas" || produto.categoria === categoriaFiltro;

      return busca && categoriaOk;
    });
  }, [produtos, pesquisa, categoriaFiltro]);

  const totalPaginas = Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA) || 1;

  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  const totalProdutos = produtos.length;

  const valorTotalCusto = produtos.reduce(
    (total, produto) => total + produto.custo * produto.quantidade,
    0
  );

  const valorTotalVenda = produtos.reduce(
    (total, produto) => total + produto.venda * produto.quantidade,
    0
  );

  const lucroPotencial = valorTotalVenda - valorTotalCusto;

  const produtosEstoqueBaixo = produtos.filter(
    (produto) => produto.quantidade <= produto.estoqueMinimo
  );

  const categoriasResumo = categoriasPadrao.map((categoria) => {
    const total = produtos
      .filter((produto) => produto.categoria === categoria)
      .reduce((soma, produto) => soma + produto.quantidade, 0);

    return {
      categoria,
      total,
    };
  });

  const maiorCategoria = Math.max(...categoriasResumo.map((item) => item.total), 1);

  return (
  <ProtectedRoute recurso="estoque">
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.badge}>BrumFlow ERP</span>
          <h1>Controle de Estoque</h1>
          <p>
            Produtos, SKU, código de barras, entradas, saídas, alertas e
            movimentações em uma interface profissional.
          </p>
        </div>
      </section>

      <section className={styles.cards}>
        <div className={styles.card}>
          <span>Total de produtos</span>
          <strong>{totalProdutos}</strong>
        </div>

        <div className={styles.card}>
          <span>Valor de custo em estoque</span>
          <strong>{moeda(valorTotalCusto)}</strong>
        </div>

        <div className={styles.card}>
          <span>Potencial de venda</span>
          <strong>{moeda(valorTotalVenda)}</strong>
        </div>

        <div className={styles.cardAlert}>
          <span>Produtos com estoque baixo</span>
          <strong>{produtosEstoqueBaixo.length}</strong>
        </div>
      </section>

      <section className={styles.analyticsGrid}>
        <div className={styles.panel}>
          <h2>Resumo por categoria</h2>

          <div className={styles.chartList}>
            {categoriasResumo.map((item) => (
              <div className={styles.chartItem} key={item.categoria}>
                <div className={styles.chartTop}>
                  <span>{item.categoria}</span>
                  <strong>{item.total}</strong>
                </div>

                <div className={styles.chartTrack}>
                  <div
                    className={styles.chartBar}
                    style={{
                      width: `${(item.total / maiorCategoria) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Indicadores estratégicos</h2>

          <div className={styles.kpiList}>
            <div>
              <span>Lucro potencial</span>
              <strong>{moeda(lucroPotencial)}</strong>
            </div>

            <div>
              <span>Últimas movimentações</span>
              <strong>{movimentacoes.length}</strong>
            </div>

            <div>
              <span>Status geral</span>
              <strong>
                {produtosEstoqueBaixo.length > 0 ? "Atenção" : "Saudável"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <form className={styles.panel} onSubmit={cadastrarProduto}>
          <h2>Cadastrar produto</h2>

          <input
            placeholder="Nome do produto"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <div className={styles.row}>
            <input
              placeholder="SKU automático"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />

            <input
              placeholder="Código de barras automático"
              value={form.codigoBarras}
              onChange={(e) =>
                setForm({ ...form, codigoBarras: e.target.value })
              }
            />
          </div>

          <div className={styles.row}>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {categoriasPadrao.map((categoria) => (
                <option key={categoria}>{categoria}</option>
              ))}
            </select>

            <input
              placeholder="Fornecedor"
              value={form.fornecedor}
              onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <input
              type="number"
              placeholder="Preço de custo"
              value={form.custo}
              onChange={(e) => setForm({ ...form, custo: e.target.value })}
            />

            <input
              type="number"
              placeholder="Preço de venda"
              value={form.venda}
              onChange={(e) => setForm({ ...form, venda: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <input
              type="number"
              placeholder="Quantidade inicial"
              value={form.quantidade}
              onChange={(e) =>
                setForm({ ...form, quantidade: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Estoque mínimo"
              value={form.estoqueMinimo}
              onChange={(e) =>
                setForm({ ...form, estoqueMinimo: e.target.value })
              }
            />
          </div>

          <button type="submit">Cadastrar produto</button>
        </form>

        <form className={styles.panel} onSubmit={registrarMovimento}>
          <h2>Entrada / Saída</h2>

          <select
            value={movimento.produtoId}
            onChange={(e) =>
              setMovimento({ ...movimento, produtoId: e.target.value })
            }
          >
            <option value="">Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} — Estoque: {produto.quantidade}
              </option>
            ))}
          </select>

          <div className={styles.row}>
            <select
              value={movimento.tipo}
              onChange={(e) =>
                setMovimento({ ...movimento, tipo: e.target.value })
              }
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

            <input
              type="number"
              placeholder="Quantidade"
              value={movimento.quantidade}
              onChange={(e) =>
                setMovimento({ ...movimento, quantidade: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="Observação da movimentação"
            value={movimento.observacao}
            onChange={(e) =>
              setMovimento({ ...movimento, observacao: e.target.value })
            }
          />

          <button type="submit">Registrar movimentação</button>

          <div className={styles.futureBox}>
          </div>
        </form>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <div>
            <h2>Produtos cadastrados</h2>
            <p>{produtosFiltrados.length} produto(s) encontrado(s)</p>
          </div>

          <div className={styles.filters}>
            <input
              placeholder="Pesquisar por nome, SKU, código ou fornecedor"
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setPaginaAtual(1);
              }}
            />

            <select
              value={categoriaFiltro}
              onChange={(e) => {
                setCategoriaFiltro(e.target.value);
                setPaginaAtual(1);
              }}
            >
              <option>Todas</option>
              {categoriasPadrao.map((categoria) => (
                <option key={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Código</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Custo</th>
                <th>Venda</th>
                <th>Qtd.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtosPaginados.map((produto) => {
                const estoqueBaixo =
                  produto.quantidade <= produto.estoqueMinimo;

                return (
                  <tr key={produto.id}>
                    <td>
                      <strong>{produto.nome}</strong>
                    </td>
                    <td>{produto.sku}</td>
                    <td>{produto.codigoBarras}</td>
                    <td>{produto.categoria}</td>
                    <td>{produto.fornecedor}</td>
                    <td>{moeda(produto.custo)}</td>
                    <td>{moeda(produto.venda)}</td>
                    <td>{produto.quantidade}</td>
                    <td>
                      <span
                        className={
                          estoqueBaixo ? styles.lowStock : styles.okStock
                        }
                      >
                        {estoqueBaixo ? "Estoque baixo" : "Normal"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => abrirEdicao(produto)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => excluirProduto(produto.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {produtosPaginados.length === 0 && (
                <tr>
                  <td colSpan="10" className={styles.empty}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            type="button"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((atual) => atual - 1)}
          >
            Anterior
          </button>

          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            type="button"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual((atual) => atual + 1)}
          >
            Próxima
          </button>
        </div>
      </section>

      <section className={styles.tablePanel}>
        <h2>Histórico de movimentações</h2>

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Observação</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoes.slice(0, 12).map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString("pt-BR")}</td>
                  <td>{item.produtos?.nome || "Produto removido"}</td>
                  <td>
                    <span
                      className={
                        item.tipo === "entrada" ? styles.entry : styles.exit
                      }
                    >
                      {item.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td>{item.quantidade}</td>
                  <td>{item.observacao}</td>
                </tr>
              ))}

              {movimentacoes.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {produtoEditando && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={salvarEdicao}>
            <div className={styles.modalHeader}>
              <h2>Editar produto</h2>

              <button type="button" onClick={() => setProdutoEditando(null)}>
                ×
              </button>
            </div>

            <input
              placeholder="Nome"
              value={produtoEditando.nome}
              onChange={(e) =>
                setProdutoEditando({
                  ...produtoEditando,
                  nome: e.target.value,
                })
              }
            />

            <div className={styles.row}>
              <input
                placeholder="SKU"
                value={produtoEditando.sku}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    sku: e.target.value,
                  })
                }
              />

              <input
                placeholder="Código de barras"
                value={produtoEditando.codigoBarras}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    codigoBarras: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.row}>
              <select
                value={produtoEditando.categoria}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    categoria: e.target.value,
                  })
                }
              >
                {categoriasPadrao.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>

              <input
                placeholder="Fornecedor"
                value={produtoEditando.fornecedor}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    fornecedor: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.row}>
              <input
                type="number"
                placeholder="Custo"
                value={produtoEditando.custo}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    custo: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Venda"
                value={produtoEditando.venda}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    venda: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.row}>
              <input
                type="number"
                placeholder="Quantidade"
                value={produtoEditando.quantidade}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    quantidade: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Estoque mínimo"
                value={produtoEditando.estoqueMinimo}
                onChange={(e) =>
                  setProdutoEditando({
                    ...produtoEditando,
                    estoqueMinimo: e.target.value,
                  })
                }
              />
            </div>

            <button type="submit">Salvar alterações</button>
          </form>
        </div>
      )}
      
    </main>
    </ProtectedRoute>
  );
}