let quantidade = 1;
const taxaEntregaPadrao = 5;
let taxaEntregaAtual = taxaEntregaPadrao;

function getTamanhoSelecionado() {
    const tamanhoSelecionado = document.querySelector('input[name="tamanho_card"]:checked');

    if (!tamanhoSelecionado) {
        return { valor: 17, texto: "300ml - R$17" };
    }

    return {
        valor: Number(tamanhoSelecionado.value),
        texto: tamanhoSelecionado.dataset.texto
    };
}

function getTipoEntrega() {
    const selecionado = document.querySelector('input[name="tipo_entrega"]:checked');
    return selecionado ? selecionado.value : "Entrega";
}

function atualizarTaxaEntrega() {
    taxaEntregaAtual = getTipoEntrega() === "Retirar" ? 0 : taxaEntregaPadrao;
}

function formatarDataAtual() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

function formatarDataHoraBonita() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

function gerarNumeroPedido() {
    const hoje = formatarDataAtual();
    let dataSalva = localStorage.getItem("acai_data_pedido");
    let contador = Number(localStorage.getItem("acai_contador_pedido")) || 0;

    if (dataSalva !== hoje) {
        contador = 0;
        localStorage.setItem("acai_data_pedido", hoje);
    }

    contador += 1;
    localStorage.setItem("acai_contador_pedido", contador);
    return String(contador).padStart(3, "0");
}

function atualizarResumoLista(id, itens, vazio) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = "";
    if (itens.length) {
        itens.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            el.appendChild(li);
        });
    } else {
        el.innerHTML = `<li>${vazio}</li>`;
    }
}

function atualizarEnderecoResumo() {
    const rua = document.getElementById("endereco").value.trim();
    const bairro = document.getElementById("bairro").value;

    let texto = "—";

    if (rua && bairro) {
        texto = `${rua} - ${bairro}`;
    } else if (rua) {
        texto = rua;
    }

    const resumoEndereco = document.getElementById("resumo-endereco");
    if (resumoEndereco) {
        resumoEndereco.textContent = texto;
    }
}

function atualizarResumoTela() {
    const tamanho = getTamanhoSelecionado();
    atualizarTaxaEntrega();

    document.getElementById("resumo-tamanho").textContent = tamanho.texto;
    document.getElementById("resumo-qtd").textContent = quantidade;
    document.getElementById("entrega").textContent = taxaEntregaAtual.toFixed(2);
    document.getElementById("resumo-entrega-texto").textContent = getTipoEntrega();

    const complementos = [...document.querySelectorAll(".complemento:checked")].map(i => i.dataset.nome);
    const frutas = [...document.querySelectorAll(".fruta:checked")].map(i => {
        const preco = Number(i.dataset.preco);
        return preco > 0 ? `${i.dataset.nome} (+R$${preco.toFixed(2).replace(".", ",")})` : `${i.dataset.nome}`;
    });
    const acrescimos = [...document.querySelectorAll(".acrescimo:checked")].map(i => {
        return `${i.dataset.nome} (+R$${Number(i.dataset.preco).toFixed(2).replace(".", ",")})`;
    });

    atualizarResumoLista("resumo-complementos", complementos, "Nenhum selecionado");
    atualizarResumoLista("resumo-frutas", frutas, "Nenhuma selecionada");
    atualizarResumoLista("resumo-acrescimos", acrescimos, "Nenhum selecionado");

    const cobertura = document.getElementById("cobertura").value || "Sem cobertura";
    document.getElementById("resumo-cobertura").textContent = cobertura;

    atualizarEnderecoResumo();
}

function calcularTotal() {
    atualizarTaxaEntrega();

    const tamanho = getTamanhoSelecionado();
    let total = tamanho.valor;

    document.querySelectorAll(".fruta:checked").forEach((item) => {
        total += Number(item.dataset.preco);
    });

    document.querySelectorAll(".acrescimo:checked").forEach((item) => {
        total += Number(item.dataset.preco);
    });

    total = total * quantidade;
    total += taxaEntregaAtual;

    document.getElementById("total").textContent = total.toFixed(2);
    atualizarResumoTela();
}

function aumentarQtd() {
    quantidade++;
    document.getElementById("qtd").textContent = quantidade;
    calcularTotal();
}

function diminuirQtd() {
    if (quantidade > 1) {
        quantidade--;
        document.getElementById("qtd").textContent = quantidade;
        calcularTotal();
    }
}

function atualizarGrupoAtivo(selector, activeClass, input) {
    document.querySelectorAll(selector).forEach((card) => card.classList.remove(activeClass));
    const card = input.closest(selector);
    if (card) card.classList.add(activeClass);
}

function limparErros() {
    ["nome", "telefone", "endereco", "bairro"].forEach((id) => {
        const input = document.getElementById(id);
        const erro = document.getElementById(`erro-${id}`);
        if (input) input.classList.remove("input-error");
        if (erro) erro.textContent = "";
    });
}

function validarFormulario() {
    limparErros();

    const nome = document.getElementById("nome");
    const telefone = document.getElementById("telefone");
    const endereco = document.getElementById("endereco");
    const bairro = document.getElementById("bairro");
    let valido = true;

    if (!nome.value.trim() || nome.value.trim().length < 2) {
        nome.classList.add("input-error");
        document.getElementById("erro-nome").textContent = "Digite um nome válido.";
        valido = false;
    }

    const numerosTelefone = telefone.value.replace(/\D/g, "");
    if (numerosTelefone.length < 10) {
        telefone.classList.add("input-error");
        document.getElementById("erro-telefone").textContent = "Digite um telefone válido com DDD.";
        valido = false;
    }

    if (getTipoEntrega() === "Entrega") {
        if (!endereco.value.trim() || endereco.value.trim().length < 8) {
            endereco.classList.add("input-error");
            document.getElementById("erro-endereco").textContent = "Digite uma rua e número válidos.";
            valido = false;
        }

        if (!bairro.value.trim()) {
            bairro.classList.add("input-error");
            document.getElementById("erro-bairro").textContent = "Selecione um bairro.";
            valido = false;
        }
    }

    return valido;
}

document.querySelectorAll('input[name="tamanho_card"]').forEach((item) => {
    item.addEventListener("change", function () {
        atualizarGrupoAtivo("[data-size-card]", "active", this);
        calcularTotal();
    });
});

document.querySelectorAll(".complemento").forEach((item) => {
    item.addEventListener("change", function () {
        const aviso = document.getElementById("aviso-complementos");
        const selecionados = document.querySelectorAll(".complemento:checked");

        if (selecionados.length > 3) {
            this.checked = false;
            aviso.textContent = "Você pode escolher no máximo 3 complementos.";
            return;
        }

        aviso.textContent = "";
        this.closest(".option-card").classList.toggle("active", this.checked);
        atualizarResumoTela();
    });
});

document.querySelectorAll(".fruta, .acrescimo").forEach((item) => {
    item.addEventListener("change", function () {
        this.closest(".option-card").classList.toggle("active", this.checked);
        calcularTotal();
    });
});

document.getElementById("cobertura").addEventListener("change", atualizarResumoTela);
document.getElementById("endereco").addEventListener("input", atualizarEnderecoResumo);
document.getElementById("bairro").addEventListener("change", atualizarEnderecoResumo);

document.querySelectorAll('input[name="colher"]').forEach((item) => {
    item.addEventListener("change", function () {
        atualizarGrupoAtivo(".spoon-card", "active-radio", this);
    });
});

document.querySelectorAll('input[name="tipo_entrega"]').forEach((item) => {
    item.addEventListener("change", function () {
        atualizarGrupoAtivo(".delivery-card", "active-radio", this);

        const endereco = document.getElementById("endereco");
        const bairro = document.getElementById("bairro");
        const erroEndereco = document.getElementById("erro-endereco");
        const erroBairro = document.getElementById("erro-bairro");

        if (this.value === "Retirar") {
            endereco.value = "Retirada no local";
            bairro.value = "";
            endereco.setAttribute("readonly", "true");
            bairro.setAttribute("disabled", "true");
            endereco.classList.remove("input-error");
            bairro.classList.remove("input-error");
            erroEndereco.textContent = "";
            erroBairro.textContent = "";
        } else {
            endereco.value = "";
            bairro.value = "";
            endereco.removeAttribute("readonly");
            bairro.removeAttribute("disabled");
        }

        calcularTotal();
    });
});

function atualizarStatusLoja() {
    const status = document.getElementById("status-loja");
    const hora = new Date().getHours();
    status.textContent = hora >= 10 && hora < 22 ? "Aberto hoje até 22h" : "Fechado no momento";
}

function finalizarPedido() {
  if (!validarFormulario()) return;

  const btn = document.getElementById("btn-finalizar");
  const textoOriginal = btn.textContent;
  btn.textContent = "Abrindo WhatsApp...";
  btn.disabled = true;

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const bairro = document.getElementById("bairro").value;
  const pagamento = document.getElementById("pagamento").value;
  const observacao = document.getElementById("observacao").value.trim();
  const cobertura = document.getElementById("cobertura").value || "Sem cobertura";

  const tamanho = getTamanhoSelecionado();
  const tipoEntrega = getTipoEntrega();
  const colher = document.querySelector('input[name="colher"]:checked')?.value || "Sim";

  const complementos = [...document.querySelectorAll(".complemento:checked")].map(i => i.dataset.nome);
  const frutas = [...document.querySelectorAll(".fruta:checked")].map(i => i.dataset.nome);
  const acrescimos = [...document.querySelectorAll(".acrescimo:checked")].map(i => i.dataset.nome);

  const total = document.getElementById("total").textContent;
  const numeroPedido = gerarNumeroPedido();
  const dataHora = formatarDataHoraBonita();

  const enderecoCompleto = tipoEntrega === "Retirar"
    ? "Retirada no local"
    : `${endereco} - ${bairro}`;

  const mensagem = `*NOVO PEDIDO - AÇAÍ SUPREMO*

Pedido #${numeroPedido}
Data: ${dataHora}

CLIENTE
Nome: ${nome}
Telefone: ${telefone}

PEDIDO
- Tamanho: ${tamanho.texto}
- Quantidade: ${quantidade}
- Complementos: ${complementos.length ? complementos.join(", ") : "Nenhum"}
- Frutas: ${frutas.length ? frutas.join(", ") : "Nenhuma"}
- Acréscimos pagos: ${acrescimos.length ? acrescimos.join(", ") : "Nenhum"}
- Cobertura: ${cobertura}
- Colher: ${colher}

ENTREGA
- Tipo: ${tipoEntrega}
- Endereço: ${enderecoCompleto}
- Taxa de entrega: R$ ${taxaEntregaAtual.toFixed(2).replace(".", ",")}

PAGAMENTO
- Forma: ${pagamento}

OBSERVAÇÃO
- ${observacao || "Nenhuma"}

TOTAL FINAL: R$ ${total.replace(".", ",")}`;

  const numero = "5522999023944";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  setTimeout(() => {
    window.open(url, "_blank");
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }, 400);
}
const elementosReveal = document.querySelectorAll(".reveal");

function animarAoScroll() {
    const trigger = window.innerHeight * 0.88;
    elementosReveal.forEach((elemento) => {
        const topo = elemento.getBoundingClientRect().top;
        if (topo < trigger) elemento.classList.add("show");
    });
}

function controlarBotaoFlutuante() {
    const botao = document.getElementById("floating-order");
    if (window.scrollY > 500) {
        botao.classList.add("show-float");
        botao.classList.remove("hidden-float");
    } else {
        botao.classList.add("hidden-float");
        botao.classList.remove("show-float");
    }
}

window.addEventListener("scroll", () => {
    animarAoScroll();

    const topbar = document.querySelector(".topbar");
    topbar.style.background = window.scrollY > 50
        ? "rgba(62, 16, 120, 0.96)"
        : "rgba(62, 16, 120, 0.88)";

    controlarBotaoFlutuante();
});

window.addEventListener("load", () => {
    document.getElementById("qtd").textContent = quantidade;
    atualizarStatusLoja();
    calcularTotal();
    animarAoScroll();
    controlarBotaoFlutuante();
    atualizarEnderecoResumo();
});
