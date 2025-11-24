// script.js (versão robusta)
document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = "5511956614592";

  let carrinho = [];
  let total = 0;

  // sabores por produto
  const sabores = {
    "Morango do amor": ["Convencional", "coxinha de chocolate melkine", "ninho com morango"],
    "Cone": ["Ninho com nutella", "Brigadeiro", "Prestígio", "Maracujá", "Oreo", "Ferrero"],
    "Bolo de pote": ["Chocolate", "Ninho com morango", "Prestígio", "Doce de leite"],
    "Brigadeiro": ["5 Unidades"],
    "Coxinha": ["Pistache"],
    "Copo":["chocobrownie"]
  };

  let produtoSelecionado = null;
  let precoSelecionado = 0;

  // ---- FUNÇÕES ----
  function adicionar(nome, preco) {
    produtoSelecionado = nome;
    precoSelecionado = Number(preco);

    const modal = document.getElementById("modalSabores");
    const lista = document.getElementById("listaSabores");
    const titulo = document.getElementById("modalTitulo");

    if (!modal || !lista || !titulo) {
      console.warn("Modal de sabores não encontrado. Verifique se o HTML do modal está presente com ids: modalSabores, listaSabores, modalTitulo");
      // fallback: adicionar direto ao carrinho se modal não existir
      adicionarComSaborFallback();
      return;
    }

    titulo.textContent = `Escolha o sabor do ${nome}`;
    lista.innerHTML = "";

    const opcoes = sabores[nome] || ["Padrão"];
    opcoes.forEach(sabor => {
      const btn = document.createElement("button");
      btn.textContent = sabor;
      btn.style.cssText = `
        padding:10px;
        width:100%;
        border:none;
        border-radius:10px;
        background:#ffd6ec;
        margin:6px 0;
        font-weight:700;
        cursor:pointer;
      `;
      btn.onclick = () => adicionarComSabor(sabor);
      lista.appendChild(btn);
    });

    modal.style.display = "flex";
  }

  function adicionarComSabor(sabor) {
    const item = {
      nome: `${produtoSelecionado} — ${sabor}`,
      preco: precoSelecionado,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    };

    carrinho.push(item);
    total += Number(precoSelecionado);

    atualizar();
    fecharModal();
    console.log("Item adicionado:", item);
  }

  // se modal não existir, adiciona com sabor genérico
  function adicionarComSaborFallback() {
    const item = {
      nome: `${produtoSelecionado} — ${"Padrão"}`,
      preco: precoSelecionado,
      id: Date.now().toString(36)
    };
    carrinho.push(item);
    total += Number(precoSelecionado);
    atualizar();
    console.log("Item adicionado (fallback):", item);
  }

  function fecharModal() {
    const modal = document.getElementById("modalSabores");
    if (modal) modal.style.display = "none";
  }

  function atualizar() {
    const lista = document.getElementById('lista');
    if (!lista) {
      console.warn("Elemento #lista não encontrado no HTML");
      return;
    }
    lista.innerHTML = "";

    carrinho.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <span>${item.nome} — R$ ${item.preco.toFixed(2)}</span>
          <button class="remove" data-id="${item.id}">remover</button>
        </div>
      `;
      lista.appendChild(li);
    });

    // attach remove listeners (delegação simples)
    lista.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        remover(id);
      });
    });

    const countEl = document.getElementById('count');
    const totalText = document.getElementById('totalText');
    if (countEl) countEl.textContent = carrinho.length;
    if (totalText) totalText.textContent = `Total: R$ ${total.toFixed(2)}`;
  }

  function remover(id) {
    const idx = carrinho.findIndex(i => i.id === id);
    if (idx >= 0) {
      total -= carrinho[idx].preco;
      carrinho.splice(idx, 1);
      atualizar();
      console.log("Item removido:", id);
    } else {
      console.warn("Id para remover não encontrado:", id);
    }
  }

  function finalizar() {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    let msg = "Olá! Gostaria de fazer um pedido.%0A%0A";
    carrinho.forEach((item, i) => {
      msg += `${i + 1}. ${item.nome} — R$ ${item.preco.toFixed(2)}%0A`;
    });
    msg += `%0ATotal: R$ ${total.toFixed(2)}%0A`;

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${msg}`;
    window.open(url, "_blank");
    console.log("Finalizando pedido. URL:", url);
  }

  // expõe funções no escopo global para chamadas inline via onclick se você usa
  window.adicionar = adicionar;
  window.remover = remover;
  window.finalizar = finalizar;
  window.fecharModal = fecharModal;

  // ---- inicialização: conectar botões .btn-add (se existirem com data attrs) ----
  const botoes = document.querySelectorAll('.btn-add');
  if (botoes.length === 0) {
    console.info("Nenhum .btn-add encontrado. Se você usa onclick inline (ex: onclick=\"adicionar('Cone',7)\"), tudo bem.");
  } else {
    botoes.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // tenta ler data attributes, se faltar, tenta ler atributos html
        const nome = btn.dataset.nome || btn.getAttribute('data-nome') || btn.getAttribute('data-name');
        const precoRaw = btn.dataset.preco || btn.getAttribute('data-preco') || btn.getAttribute('data-price');
        const preco = precoRaw ? Number(precoRaw) : null;

        if (nome && preco !== null && !isNaN(preco)) {
          // abre modal para escolher sabor
          adicionar(nome, preco);
        } else {
          console.warn("Botão .btn-add sem data-nome/data-preco válidos. Você pode usar: <button class=\"btn-add\" data-nome=\"Cone\" data-preco=\"7\">");
        }
      });
    });
  }

  // conectar botão finalizar (por id ou por classe)
  const btnFinalizar = document.getElementById('btnFinalizar') || document.querySelector('.finalizar');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', finalizar);
  } else {
    console.warn("Botão finalizar não encontrado (id='btnFinalizar' ou class='finalizar').");
  }

  // chamada inicial para renderizar carrinho vazio
  atualizar();
  console.log("script.js inicializado com sucesso");
});
