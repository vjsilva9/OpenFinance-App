console.log("Open Finance iniciado!");

const temaWhite = document.getElementById("temaWhite");
const temaBlack = document.getElementById("temaBlack");

const usuario = {
    nome: "Jon",
    idade: 22,
    cidade: "São Paulo"
};

// ===== BANCOS (dados batendo com os cards exibidos em "Conexão") =====
const bancos = [
    { nome: "Nubank",       saldo: 9200,  receita: 4200, despesas: 1600, investimento: 6200, conectado: true },
    { nome: "Bradesco",     saldo: 6100,  receita: 2800, despesas: 1100, investimento: 4300, conectado: true },
    { nome: "Banco Pan",    saldo: 4390,  receita: 2390, despesas: 990,  investimento: 3200, conectado: true },
    { nome: "Mercado Pago", saldo: 5300,  receita: 1600, despesas: 800,  investimento: 2790, conectado: true }
];

function selecionarTema(temaSelecionado) {
    document.querySelectorAll(".tema-tela").forEach(t => t.classList.remove("ativo"));
    temaSelecionado.classList.add("ativo");
}

temaBlack.addEventListener("click", () => {
    document.body.classList.add("dark");
    localStorage.setItem("tema", "dark");
    selecionarTema(temaBlack);
});

temaWhite.addEventListener("click", () => {
    document.body.classList.remove("dark");
    localStorage.setItem("tema", "white");
    selecionarTema(temaWhite);
});
function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("tema");
    if (temaSalvo === "dark") {
        document.body.classList.add("dark");
        selecionarTema(temaBlack);
    } else {
        selecionarTema(temaWhite);
    }
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularPatrimonio() {
    const conectados = bancos.filter(b => b.conectado);

    const saldoTotal        = conectados.reduce((acc, b) => acc + b.saldo, 0);
    const receitaTotal      = conectados.reduce((acc, b) => acc + b.receita, 0);
    const despesasTotal     = conectados.reduce((acc, b) => acc + b.despesas, 0);
    const investimentoTotal = conectados.reduce((acc, b) => acc + b.investimento, 0);

    return { saldoTotal, receitaTotal, despesasTotal, investimentoTotal };
}

// ===== GRÁFICO =====
function atualizarGrafico(saldoAtual) {
    
    const proporcoes = [0.35, 0.55, 0.48, 0.70, 0.62, 1];
    const alturaMaxima = 170; // precisa bater com a altura da .b6 no CSS

    const barras = document.querySelectorAll(".barra");
    barras.forEach((barra, i) => {
        barra.style.height = `${alturaMaxima * proporcoes[i]}px`;
    });

    atualizarEixoY(saldoAtual);
}

function atualizarEixoY(valorMaximo) {
    const eixo = document.querySelectorAll(".eixo-y span");
    const passos = [1, 0.66, 0.33, 0]; // topo -> base

    eixo.forEach((span, i) => {
        const valor = valorMaximo * passos[i];
        span.textContent = valor >= 1000 ? `${Math.round(valor / 1000)}k` : `${Math.round(valor)}`;
    });
}

// ===== DASHBOARD (dados reais, recalculados sempre que um banco conecta/desconecta) =====
function atualizarDashboard() {
    const dados = calcularPatrimonio();

    document.getElementById("saldoTotal").textContent   = formatarMoeda(dados.saldoTotal);
    document.getElementById("receita").textContent      = formatarMoeda(dados.receitaTotal);
    document.getElementById("despesas").textContent     = formatarMoeda(dados.despesasTotal);
    document.getElementById("investimento").textContent = formatarMoeda(dados.investimentoTotal);

    atualizarGrafico(dados.saldoTotal);
}

const toggleSaldo = document.querySelector(".toggle-saldo");
let saldoVisivel = true;

toggleSaldo.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;
    document.querySelectorAll(".card h2, #saldoTotal, #receita, #despesas, #investimento")
        .forEach(el => el.classList.toggle("valor-oculto", !saldoVisivel));
    toggleSaldo.classList.toggle("fa-eye");
    toggleSaldo.classList.toggle("fa-eye-slash");
});

function atualizarProgressoCategorias() {
    const categorias = document.querySelectorAll(".Categoria");
    const total = Array.from(categorias)
        .reduce((acc, cat) => acc + Number(cat.dataset.valor), 0);

    categorias.forEach(cat => {
        const porcentagem = (Number(cat.dataset.valor) / total) * 100;
        cat.querySelector(".progresso-fill").style.width = `${porcentagem}%`;
    });
}

// ===== CONECTAR / DESCONECTAR BANCO (clique no card do banco) =====
function inicializarConexoes() {
    document.querySelectorAll(".banco[data-banco]").forEach(elBanco => {
        elBanco.addEventListener("click", () => {
            const nome = elBanco.dataset.banco;
            const banco = bancos.find(b => b.nome === nome);
            if (!banco) return;

            banco.conectado = !banco.conectado;

            const status = elBanco.querySelector(".status");
            status.classList.toggle("conectado", banco.conectado);
            status.classList.toggle("desconectado", !banco.conectado);
            elBanco.style.opacity = banco.conectado ? "1" : ".5";

            atualizarDashboard();
        });
    });
}

// ===== CARTÕES (carrossel futurista) =====
const cartoes = [
    { banco: "Nubank",       bandeira: "Mastercard", numero: "•••• •••• •••• 4821", titular: "JON VITOR", cor1: "#8A05BE", cor2: "#4B0082" },
    { banco: "Bradesco",     bandeira: "Visa",       numero: "•••• •••• •••• 1093", titular: "JON VITOR", cor1: "#E4002B", cor2: "#7A0019" },
    { banco: "Banco Pan",    bandeira: "Mastercard", numero: "•••• •••• •••• 7345", titular: "JON VITOR", cor1: "#0057B8", cor2: "#00234F" },
    { banco: "Mercado Pago", bandeira: "Visa",       numero: "•••• •••• •••• 5620", titular: "JON VITOR", cor1: "#00B1EA", cor2: "#0047BB" }
];

let indiceCartaoAtual = 0;
const stackEl = document.getElementById("cartoesStack");
const dotsEl  = document.getElementById("cartoesDots");

function criarElementoCartao(dados) {
    const el = document.createElement("div");
    el.className = "cartao";
    el.style.background = `linear-gradient(135deg, ${dados.cor1}, ${dados.cor2})`;
    el.innerHTML = `
        <div class="cartao-topo">
            <span class="cartao-banco">${dados.banco}</span>
            <span class="cartao-chip"><i class="fa-solid fa-microchip"></i></span>
        </div>
        <div class="cartao-numero">${dados.numero}</div>
        <div class="cartao-base">
            <div class="cartao-titular">Titular<strong>${dados.titular}</strong></div>
            <span class="cartao-bandeira">${dados.bandeira}</span>
        </div>
    `;
    return el;
}

function renderizarCartoes() {
    if (!stackEl) return;
    stackEl.innerHTML = "";
    dotsEl.innerHTML = "";

    const total = cartoes.length;
    // renderiza do fundo pra frente pra empilhamento (z-index) ficar certo
    for (let offset = Math.min(3, total - 1); offset >= 0; offset--) {
        const idx = (indiceCartaoAtual + offset) % total;
        const el = criarElementoCartao(cartoes[idx]);
        el.classList.add(`pos-${offset}`);
        if (offset === 0) {
            el.addEventListener("click", proximoCartao);
        }
        stackEl.appendChild(el);
    }

    cartoes.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "cartao-dot" + (i === indiceCartaoAtual ? " ativo" : "");
        dotsEl.appendChild(dot);
    });
}

function proximoCartao() {
    const total = cartoes.length;
    const frente = stackEl.querySelector(".pos-0");

    // efeito: cartão da frente "pula" pra trás antes de reordenar o stack
    if (frente) {
        frente.classList.add("saindo");
    }

    setTimeout(() => {
        indiceCartaoAtual = (indiceCartaoAtual + 1) % total;
        renderizarCartoes();
    }, 260);
}

function cartaoAnterior() {
    const total = cartoes.length;
    indiceCartaoAtual = (indiceCartaoAtual - 1 + total) % total;
    renderizarCartoes();
}

const btnCartaoProximo = document.getElementById("btnCartaoProximo");
const btnCartaoAnterior = document.getElementById("btnCartaoAnterior");
if (btnCartaoProximo) btnCartaoProximo.addEventListener("click", proximoCartao);
if (btnCartaoAnterior) btnCartaoAnterior.addEventListener("click", cartaoAnterior);

// ===== NAV MOBILE (barra inferior funcional, com suporte a arrastar o dedo) =====
function inicializarNavMobile() {
    const navItens = document.querySelectorAll(".nav-item");
    const nav = document.querySelector(".mobile-nav");
    const overlay = document.getElementById("overlayMobile");
    const painéis = document.querySelectorAll(".painel-mobile");

    function fecharTodosPaineis() {
        painéis.forEach(p => p.classList.remove("aberto"));
        if (overlay) overlay.classList.remove("ativo");
        if (nav) nav.classList.remove("recolhida");
    }

    function ativarBotao(botaoAtivo) {
        navItens.forEach(b => b.classList.remove("active"));
        botaoAtivo.classList.add("active");
    }

    // ação central: abre/fecha o painel correspondente ao botão informado
    function ativarNavItem(botao) {
        const alvo = botao.dataset.painel;

        if (alvo === "inicio") {
            fecharTodosPaineis();
            ativarBotao(botao);
            return;
        }

        const painelAlvo = document.getElementById(alvo);
        if (!painelAlvo) return;

        const jaAberto = painelAlvo.classList.contains("aberto");

        fecharTodosPaineis();

        if (!jaAberto) {
            painelAlvo.classList.add("aberto");
            if (nav) nav.classList.add("recolhida");
            ativarBotao(botao);
        } else {
            ativarNavItem(document.querySelector('.nav-item[data-painel="inicio"]'));
        }
    }

    // ===== interação: tanto toque simples quanto arrastar o dedo funcionam =====
    let arrastando = false;
    let botaoEmFoco = null;

    function botaoNoPonto(x, y) {
        const el = document.elementFromPoint(x, y);
        return el ? el.closest(".nav-item") : null;
    }

    function destacar(botao) {
        if (botaoEmFoco === botao) return;
        navItens.forEach(b => b.classList.remove("arrastando-hover"));
        if (botao) botao.classList.add("arrastando-hover");
        botaoEmFoco = botao;
    }

    function limparDestaque() {
        navItens.forEach(b => b.classList.remove("arrastando-hover"));
        botaoEmFoco = null;
    }

    if (nav) {
        nav.style.touchAction = "none";

        nav.addEventListener("pointerdown", (e) => {
            arrastando = true;
            nav.setPointerCapture(e.pointerId);
            destacar(botaoNoPonto(e.clientX, e.clientY));
        });

        nav.addEventListener("pointermove", (e) => {
            if (!arrastando) return;
            destacar(botaoNoPonto(e.clientX, e.clientY));
        });

        nav.addEventListener("pointerup", (e) => {
            arrastando = false;
            const botao = botaoNoPonto(e.clientX, e.clientY);
            limparDestaque();
            if (botao) ativarNavItem(botao);
        });

        nav.addEventListener("pointercancel", () => {
            arrastando = false;
            limparDestaque();
        });
    }

    document.querySelectorAll(".btn-fechar-painel").forEach(btn => {
        btn.addEventListener("click", () => {
            fecharTodosPaineis();
            const botaoInicio = document.querySelector('.nav-item[data-painel="inicio"]');
            navItens.forEach(b => b.classList.remove("active"));
            botaoInicio.classList.add("active");
        });
    });

    if (overlay) {
        overlay.addEventListener("click", () => {
            fecharTodosPaineis();
            ativarNavItem(document.querySelector('.nav-item[data-painel="inicio"]'));
        });
    }
}

// INICIALIZAÇÃO 
aplicarTemaSalvo();
atualizarDashboard();
atualizarProgressoCategorias();
inicializarConexoes();
renderizarCartoes();
inicializarNavMobile();