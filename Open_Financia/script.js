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
function anexarCliqueBanco(elBanco) {
    elBanco.addEventListener("click", (e) => {
        // clique no botão de remover é tratado à parte, não alterna conexão
        if (e.target.closest(".btn-remover-banco")) return;

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

    const btnRemover = elBanco.querySelector(".btn-remover-banco");
    if (btnRemover) {
        btnRemover.addEventListener("click", (e) => {
            e.stopPropagation();
            removerBanco(elBanco);
        });
    }
}

function removerBanco(elBanco) {
    const nome = elBanco.dataset.banco;
    const index = bancos.findIndex(b => b.nome === nome);
    if (index !== -1) bancos.splice(index, 1);
    elBanco.remove();

    // remove também o cartão correspondente do carrossel
    const indiceCartao = cartoes.findIndex(c => c.banco === nome);
    if (indiceCartao !== -1) {
        cartoes.splice(indiceCartao, 1);
        if (indiceCartaoAtual >= cartoes.length) {
            indiceCartaoAtual = Math.max(0, cartoes.length - 1);
        }
        renderizarCartoes();
    }

    atualizarDashboard();
}

function inicializarConexoes() {
    document.querySelectorAll(".banco[data-banco]").forEach(anexarCliqueBanco);
}

// ===== ADICIONAR BANCO (catálogo de bancos que ainda não estão conectados) =====

// gera um número "hash" simples e consistente a partir do nome do banco
// (mesmo nome sempre gera o mesmo resultado, então os dados não mudam a cada recarregamento)
function hashTexto(texto) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
        hash = texto.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
    }
    return Math.abs(hash);
}

// dados financeiros fictícios, gerados a partir do nome (dentro de faixas realistas)
function gerarDadosFinanceiros(nome) {
    const h = hashTexto(nome);
    return {
        saldo:        2000 + (h % 9000),
        receita:      800  + (h % 3500),
        despesas:     400  + (h % 1300),
        investimento: 500  + (h % 6000)
    };
}

// cores/bandeira dos 4 bancos que já vêm conectados por padrão no app —
// preservadas aqui pra manter a aparência original caso sejam removidos e adicionados de novo
const estiloCartoesPadrao = {
    "Nubank":       { cor1: "#8A05BE", cor2: "#4B0082", bandeira: "Mastercard" },
    "Bradesco":     { cor1: "#E4002B", cor2: "#7A0019", bandeira: "Visa" },
    "Banco Pan":    { cor1: "#0057B8", cor2: "#00234F", bandeira: "Mastercard" },
    "Mercado Pago": { cor1: "#00B1EA", cor2: "#0047BB", bandeira: "Visa" }
};

// cor e bandeira do cartão: usa a cor "oficial" se o banco for um dos padrão,
// senão gera uma cor consistente a partir do nome
function gerarEstiloCartao(nome) {
    if (estiloCartoesPadrao[nome]) return estiloCartoesPadrao[nome];

    const h = hashTexto(nome);
    const matiz = h % 360;
    const bandeiras = ["Visa", "Mastercard", "Elo"];

    return {
        cor1: `hsl(${matiz}, 72%, 50%)`,
        cor2: `hsl(${(matiz + 30) % 360}, 72%, 28%)`,
        bandeira: bandeiras[h % bandeiras.length]
    };
}

// lista com (praticamente) todos os bancos que operam no Brasil
const nomesBancosCatalogo = [
    // bancos públicos / regionais
    "Banco do Brasil", "Caixa Econômica Federal", "Banco da Amazônia", "Banco do Nordeste",
    "BRB (Banco de Brasília)", "Banestes", "Banrisul", "Banese",

    // grandes bancos privados
    "Itaú Unibanco", "Bradesco", "Santander Brasil", "BTG Pactual", "Banco Safra",
    "ABC Brasil", "Daycoval", "Banco Fibra", "Mercantil do Brasil", "Banco Pine",
    "BMG", "Sofisa", "Banco Original", "Banco Master", "C6 Bank", "Banco Inter",
    "Banco BV", "Banco Pan", "Nubank", "Banco Digio", "Banco Bari", "Will Bank",
    "Neon", "Banco BS2", "Mercado Pago",

    // bancos de investimento / câmbio / estrangeiros
    "XP Banco", "Modal", "Banco Alfa", "Banco Ribeirão Preto", "Banco Paulista",
    "Banco Guanabara", "Banco Arbi", "Banco Topázio", "Banco Rendimento",
    "Banco BOCOM BBM", "Banco Fator", "Banco Voiter", "Banco CCB Brasil",
    "Banco Sumitomo Mitsui Brasileiro", "Banco MUFG Brasil", "Banco Mizuho do Brasil",
    "Deutsche Bank Brasil", "BNP Paribas Brasil", "Citibank Brasil", "Bank of China Brasil",
    "ICBC do Brasil", "Scotiabank Brasil", "Bank of America Brasil", "JP Morgan Brasil",
    "Goldman Sachs do Brasil", "Credit Suisse Brasil",

    // cooperativas de crédito
    "Sicredi (Consolidado)", "Sicoob (Consolidado)", "Cresol", "Unicred", "Ailos",

    // contas globais / câmbio / remessas internacionais
    "Wise", "Nomad", "Avenue", "Payoneer", "Husky", "TechFX", "Remessa Online",
    "Travelex Bank", "Ouribank", "Western Union Digital", "Câmbio Store"
];

// monta o catálogo final combinando nome + dados financeiros + estilo do cartão
const catalogoBancosDisponiveis = nomesBancosCatalogo.map(nome => ({
    nome,
    ...gerarDadosFinanceiros(nome),
    ...gerarEstiloCartao(nome)
}));

const btnAdicionarBanco       = document.getElementById("btnAdicionarBanco");
const adicionarBancoModal     = document.getElementById("adicionarBancoModal");
const overlayAdicionarBanco   = document.getElementById("overlayAdicionarBanco");
const fecharAdicionarBancoBtn = document.getElementById("fecharAdicionarBanco");
const listaBancosDisponiveisEl = document.getElementById("listaBancosDisponiveis");
const buscaBancoAdicionarEl    = document.getElementById("buscaBancoAdicionar");

function renderizarBancoNaLista(banco) {
    const el = document.createElement("div");
    el.className = "banco";
    el.dataset.banco = banco.nome;
    el.innerHTML = `
        <div class="info-banco">
            <i class="fa-solid fa-building-columns"></i>
            <span>${banco.nome}</span>
        </div>
        <div class="banco-acoes">
            <span class="status conectado">●</span>
            <button class="btn-remover-banco" title="Remover banco"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    anexarCliqueBanco(el);

    // insere o novo banco logo antes do botão "Adicionar banco"
    btnAdicionarBanco.parentNode.insertBefore(el, btnAdicionarBanco);
}

function gerarNumeroCartao() {
    const ultimosDigitos = Math.floor(1000 + Math.random() * 9000);
    return `•••• •••• •••• ${ultimosDigitos}`;
}

function adicionarBanco(dadosBanco) {
    const novoBanco = {
        nome: dadosBanco.nome,
        saldo: dadosBanco.saldo,
        receita: dadosBanco.receita,
        despesas: dadosBanco.despesas,
        investimento: dadosBanco.investimento,
        conectado: true
    };
    bancos.push(novoBanco);
    renderizarBancoNaLista(novoBanco);

    // cria o cartão correspondente e mostra ele no carrossel "Meus Cartões"
    cartoes.push({
        banco: dadosBanco.nome,
        bandeira: dadosBanco.bandeira || "Mastercard",
        numero: gerarNumeroCartao(),
        titular: nomePerfilPrincipal ? nomePerfilPrincipal.textContent.trim().toUpperCase() : "TITULAR",
        cor1: dadosBanco.cor1 || "#4F46E5",
        cor2: dadosBanco.cor2 || "#312E81"
    });
    indiceCartaoAtual = cartoes.length - 1; // já mostra o cartão recém-adicionado na frente
    renderizarCartoes();

    atualizarDashboard();
    fecharModalAdicionarBanco();
}

function renderizarListaBancosFiltrada(termo = "") {
    listaBancosDisponiveisEl.innerHTML = "";

    const restantes = catalogoBancosDisponiveis.filter(
        cb => !bancos.some(b => b.nome === cb.nome)
    );

    const filtrados = termo
        ? restantes.filter(cb => cb.nome.toLowerCase().includes(termo.toLowerCase()))
        : restantes;

    if (restantes.length === 0) {
        listaBancosDisponiveisEl.innerHTML =
            `<p class="sem-bancos">Você já conectou todos os bancos disponíveis 🎉</p>`;
        return;
    }

    if (filtrados.length === 0) {
        listaBancosDisponiveisEl.innerHTML =
            `<p class="sem-bancos">Nenhum banco encontrado para "${termo}"</p>`;
        return;
    }

    filtrados.forEach(cb => {
        const item = document.createElement("div");
        item.className = "banco-disponivel";
        item.innerHTML = `
            <div class="info-banco">
                <i class="fa-solid fa-building-columns"></i>
                <span>${cb.nome}</span>
            </div>
            <i class="fa-solid fa-plus"></i>
        `;
        item.addEventListener("click", () => adicionarBanco(cb));
        listaBancosDisponiveisEl.appendChild(item);
    });
}

function abrirModalAdicionarBanco() {
    if (buscaBancoAdicionarEl) buscaBancoAdicionarEl.value = "";
    renderizarListaBancosFiltrada();

    adicionarBancoModal.classList.add("aberto");
    overlayAdicionarBanco.classList.add("ativo");
    if (buscaBancoAdicionarEl) buscaBancoAdicionarEl.focus();
}

if (buscaBancoAdicionarEl) {
    buscaBancoAdicionarEl.addEventListener("input", () => {
        renderizarListaBancosFiltrada(buscaBancoAdicionarEl.value.trim());
    });
}

function fecharModalAdicionarBanco() {
    adicionarBancoModal.classList.remove("aberto");
    overlayAdicionarBanco.classList.remove("ativo");
}

if (btnAdicionarBanco) btnAdicionarBanco.addEventListener("click", abrirModalAdicionarBanco);
if (fecharAdicionarBancoBtn) fecharAdicionarBancoBtn.addEventListener("click", fecharModalAdicionarBanco);
if (overlayAdicionarBanco) overlayAdicionarBanco.addEventListener("click", fecharModalAdicionarBanco);

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
    if (total === 0) return;
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
    if (total === 0) return;
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

// ===== EDITAR PERFIL (foto + nome + cidade, persistido em localStorage) =====
const btnEditarPerfil   = document.getElementById("btnEditarPerfil");
const editarPerfilModal = document.getElementById("editarPerfilModal");
const overlayEdicao     = document.getElementById("overlayEdicao");
const fecharEdicaoBtn   = document.getElementById("fecharEdicaoPerfil");
const inputFotoPerfil   = document.getElementById("inputFotoPerfil");
const previewFotoPerfil = document.getElementById("previewFotoPerfil");
const inputNomePerfil   = document.getElementById("inputNomePerfil");
const inputCidadePerfil = document.getElementById("inputCidadePerfil");
const btnSalvarPerfil   = document.getElementById("btnSalvarPerfil");

const fotoPerfilPrincipal = document.querySelector(".perfil .foto-perfil");
const nomePerfilPrincipal = document.querySelector(".perfil h3");

let fotoTemporaria = null;

function abrirEdicaoPerfil() {
    // pré-preenche com os valores atuais
    inputNomePerfil.value = nomePerfilPrincipal.textContent.trim();
    inputCidadePerfil.value = localStorage.getItem("cidadePerfil") || usuario.cidade;
    previewFotoPerfil.src = fotoPerfilPrincipal.src;
    fotoTemporaria = null;

    editarPerfilModal.classList.add("aberto");
    overlayEdicao.classList.add("ativo");
}

function fecharEdicaoPerfil() {
    editarPerfilModal.classList.remove("aberto");
    overlayEdicao.classList.remove("ativo");
}

if (btnEditarPerfil) btnEditarPerfil.addEventListener("click", abrirEdicaoPerfil);
if (fecharEdicaoBtn) fecharEdicaoBtn.addEventListener("click", fecharEdicaoPerfil);
if (overlayEdicao) overlayEdicao.addEventListener("click", fecharEdicaoPerfil);

// pré-visualização da foto escolhida
if (inputFotoPerfil) {
    inputFotoPerfil.addEventListener("change", (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = (evento) => {
            fotoTemporaria = evento.target.result;
            previewFotoPerfil.src = fotoTemporaria;
        };
        leitor.readAsDataURL(arquivo);
    });
}

// salvar alterações
if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener("click", () => {
        const novoNome   = inputNomePerfil.value.trim();
        const novaCidade = inputCidadePerfil.value.trim();

        if (novoNome) {
            nomePerfilPrincipal.textContent = novoNome;
            localStorage.setItem("nomePerfil", novoNome);
        }
        if (novaCidade) {
            localStorage.setItem("cidadePerfil", novaCidade);
        }
        if (fotoTemporaria) {
            fotoPerfilPrincipal.src = fotoTemporaria;
            localStorage.setItem("fotoPerfil", fotoTemporaria);
        }

        fecharEdicaoPerfil();
    });
}

// aplica dados salvos ao carregar a página
function aplicarPerfilSalvo() {
    const nomeSalvo  = localStorage.getItem("nomePerfil");
    const fotoSalva  = localStorage.getItem("fotoPerfil");

    if (nomeSalvo) nomePerfilPrincipal.textContent = nomeSalvo;
    if (fotoSalva) fotoPerfilPrincipal.src = fotoSalva;
}

// ===== SELETOR DE MÊS (usa a data real do dispositivo, sem ficar fixo) =====
const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const btnSeletorMes   = document.getElementById("btnSeletorMes");
const mesAtualTexto   = document.getElementById("mesAtualTexto");
const dropdownMes     = document.getElementById("dropdownMes");

function formatarMesAno(data) {
    return `${nomesMeses[data.getMonth()]} de ${data.getFullYear()}`;
}

function inicializarSeletorMes() {
    const hoje = new Date();
    mesAtualTexto.textContent = formatarMesAno(hoje);

    // gera os últimos 6 meses (incluindo o atual) pra escolher
    dropdownMes.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const opcao = document.createElement("div");
        opcao.className = "opcao-mes" + (i === 0 ? " selecionado" : "");
        opcao.textContent = formatarMesAno(data);
        opcao.addEventListener("click", () => {
            mesAtualTexto.textContent = formatarMesAno(data);
            dropdownMes.querySelectorAll(".opcao-mes").forEach(o => o.classList.remove("selecionado"));
            opcao.classList.add("selecionado");
            dropdownMes.classList.remove("aberto");
        });
        dropdownMes.appendChild(opcao);
    }
}

if (btnSeletorMes) {
    btnSeletorMes.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMes.classList.toggle("aberto");
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".seletor-mes-wrapper")) {
            dropdownMes.classList.remove("aberto");
        }
    });
}

// ===== E-MAIL DE DESTINO (troque pelo seu e-mail real) =====
const EMAIL_DESTINO = "seuemail@exemplo.com";

// ===== NAVEGAÇÃO ENTRE PÁGINAS COMPLETAS =====
function abrirPagina(id) {
    const pagina = document.getElementById(id);
    if (pagina) pagina.classList.add("aberta");
}
function fecharPagina(id) {
    const pagina = document.getElementById(id);
    if (pagina) pagina.classList.remove("aberta");
}

const itemFeedComunidade  = document.getElementById("itemFeedComunidade");
const itemTrabalheConosco = document.getElementById("itemTrabalheConosco");
const itemVendaProdutos   = document.getElementById("itemVendaProdutos");

if (itemFeedComunidade)  itemFeedComunidade.addEventListener("click", () => abrirPagina("paginaFeed"));
if (itemTrabalheConosco) itemTrabalheConosco.addEventListener("click", () => abrirPagina("paginaTrabalhe"));
if (itemVendaProdutos)   itemVendaProdutos.addEventListener("click", () => abrirPagina("paginaVenda"));

document.querySelectorAll(".btn-voltar-pagina").forEach(btn => {
    btn.addEventListener("click", () => fecharPagina(btn.dataset.fechar));
});

// ===== FEED DA COMUNIDADE =====
const comentariosPadrao = [
    { nome: "Marcos T.",  texto: "Seria ótimo ter gráfico de gastos por categoria em pizza, não só as barras de progresso.", curtidas: 24 },
    { nome: "Bia Ferreira", texto: "Poderia ter exportação de extrato em PDF pra declarar Imposto de Renda depois.", curtidas: 18 },
    { nome: "Rodrigo A.", texto: "Notificação quando uma conta fixa (aluguel, internet) tá perto do vencimento seria muito útil!", curtidas: 15 },
    { nome: "Camila S.",  texto: "Adicionar metas por categoria, não só uma meta geral de viagem.", curtidas: 9 }
];

function carregarComentarios() {
    const salvos = JSON.parse(localStorage.getItem("comentariosUsuario") || "[]");
    return [...salvos, ...comentariosPadrao];
}

function renderizarComentarios() {
    const lista = document.getElementById("listaComentarios");
    if (!lista) return;
    lista.innerHTML = "";
    carregarComentarios().forEach(c => {
        const el = document.createElement("div");
        el.className = "comentario-item";
        el.innerHTML = `
            <div class="comentario-topo">
                <span class="comentario-nome">${c.nome}</span>
                <span class="comentario-curtidas"><i class="fa-regular fa-thumbs-up"></i> ${c.curtidas}</span>
            </div>
            <p class="comentario-texto">${c.texto}</p>
        `;
        lista.appendChild(el);
    });
}

const btnEnviarComentario  = document.getElementById("btnEnviarComentario");
const inputNovoComentario  = document.getElementById("inputNovoComentario");
if (btnEnviarComentario) {
    btnEnviarComentario.addEventListener("click", () => {
        const texto = inputNovoComentario.value.trim();
        if (!texto) return;

        const salvos = JSON.parse(localStorage.getItem("comentariosUsuario") || "[]");
        salvos.unshift({ nome: "Você", texto, curtidas: 0 });
        localStorage.setItem("comentariosUsuario", JSON.stringify(salvos));

        inputNovoComentario.value = "";
        renderizarComentarios();
    });
}

// ===== DICAS DE INVESTIMENTO =====
const dicasInvestimento = [
    { icone: "fa-piggy-bank",     titulo: "Comece com a reserva", texto: "Antes de investir em qualquer coisa, tenha de 3 a 6 meses de gastos guardados em algo líquido, tipo Tesouro Selic ou CDB com liquidez diária." },
    { icone: "fa-dollar-sign",    titulo: "Investir em Dólar",    texto: "Fundos cambiais, ETFs internacionais (como IVVB11) ou conta em corretora internacional são formas comuns de se expor ao dólar." },
    { icone: "fa-euro-sign",      titulo: "Investir em Euro",     texto: "Menos comum que o dólar no Brasil — geralmente feito via ETFs europeus ou contas multimoeda em corretoras internacionais." },
    { icone: "fa-scale-balanced", titulo: "Organização financeira", texto: "Regra 50-30-20: 50% para gastos essenciais, 30% para desejos, 20% para investimentos e reserva." },
    { icone: "fa-chart-pie",      titulo: "Diversifique",         texto: "Não coloque tudo em um único tipo de investimento. Combine renda fixa, renda variável e, se fizer sentido pra você, moeda estrangeira." },
    { icone: "fa-calendar-check", titulo: "Invista com constância", texto: "Aportes mensais recorrentes (mesmo pequenos) tendem a render mais no longo prazo do que tentar 'acertar o timing' do mercado." }
];

function renderizarDicasInvestimento() {
    const grid = document.getElementById("gridDicasInvestimento");
    if (!grid) return;
    grid.innerHTML = "";
    dicasInvestimento.forEach(d => {
        const el = document.createElement("div");
        el.className = "dica-card";
        el.innerHTML = `
            <div class="dica-icone"><i class="fa-solid ${d.icone}"></i></div>
            <h4>${d.titulo}</h4>
            <p>${d.texto}</p>
        `;
        grid.appendChild(el);
    });
}

// ===== COMPARATIVO DE BANCOS =====
const bancosComparativo = [
    { nome: "Nubank",        texto: "Bom custo-benefício no dia a dia: conta sem tarifa, cartão sem anuidade e CDB com rendimento automático no saldo." },
    { nome: "Itaú Unibanco", texto: "Rede física ampla e forte estrutura de investimentos (renda fixa, fundos, ações) para quem quer tudo em um lugar só." },
    { nome: "BTG Pactual",   texto: "Voltado a quem já tem mais patrimônio: acesso a produtos de investimento mais sofisticados e assessoria dedicada." },
    { nome: "Inter",         texto: "Conta digital completa com corretora integrada — bom para quem quer banco + investimentos + cartão em um único app." },
    { nome: "C6 Bank",       texto: "Conta 'Global' permite guardar e movimentar dólar diretamente pelo app, sem precisar de corretora à parte." }
];

function renderizarBancosComparativo() {
    const lista = document.getElementById("listaBancosComparativo");
    if (!lista) return;
    lista.innerHTML = "";
    bancosComparativo.forEach(b => {
        const el = document.createElement("div");
        el.className = "banco-comparativo-item";
        el.innerHTML = `
            <h4><i class="fa-solid fa-building-columns"></i> ${b.nome}</h4>
            <p>${b.texto}</p>
        `;
        lista.appendChild(el);
    });

    const textoDolarEuro = document.getElementById("textoDolarEuro");
    if (textoDolarEuro) {
        textoDolarEuro.textContent =
            "Para dólar, contas como C6 Global, Nomad e Avenue costumam ser as mais citadas por facilitarem compra, guarda e transferência da moeda. " +
            "Para euro, o acesso costuma vir mais por corretoras internacionais (como Avenue) ou ETFs específicos, já que poucos bancos brasileiros oferecem conta direta em euro.";
    }
}

// ===== TRABALHE CONOSCO (envia por e-mail via mailto) =====
const formTrabalheConosco = document.getElementById("formTrabalheConosco");
if (formTrabalheConosco) {
    formTrabalheConosco.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome       = document.getElementById("tcNome").value.trim();
        const nascimento = document.getElementById("tcNascimento").value;
        const area       = document.getElementById("tcArea").value;
        const motivo     = document.getElementById("tcMotivo").value.trim();

        const assunto = encodeURIComponent("Nova candidatura - Trabalhe Conosco");
        const corpo = encodeURIComponent(
            `Nome completo: ${nome}\n` +
            `Data de nascimento: ${nascimento}\n` +
            `Área de interesse: ${area}\n\n` +
            `Motivo:\n${motivo}`
        );

        window.location.href = `mailto:${EMAIL_DESTINO}?subject=${assunto}&body=${corpo}`;
    });
}

// ===== VENDA DE PRODUTOS =====
const ebooksDisponiveis = [
    { titulo: "Primeiros Passos no Investimento", desc: "Guia básico para quem nunca investiu: reserva de emergência, renda fixa e primeiros passos.", preco: "R$ 29,90" },
    { titulo: "Guia de Investimento em Dólar",     desc: "Como funciona a exposição cambial, ETFs internacionais e contas multimoeda.", preco: "R$ 39,90" },
    { titulo: "Organização Financeira do Zero",    desc: "Planilhas e métodos práticos para sair das dívidas e organizar o orçamento mensal.", preco: "R$ 24,90" }
];

const cursosDisponiveis = [
    { titulo: "Curso Completo de Investimentos",  desc: "Da reserva de emergência à renda variável, com aulas em vídeo e certificado.", preco: "R$ 197,00" },
    { titulo: "Dólar e Euro na Prática",           desc: "Como montar uma carteira com exposição internacional de forma segura.", preco: "R$ 147,00" },
    { titulo: "Finanças Pessoais Avançado",        desc: "Planejamento financeiro completo: orçamento, metas, aposentadoria e investimentos.", preco: "R$ 167,00" }
];

const professoresDisponiveis = [
    { nome: "Ana Beatriz Costa", especialidade: "Investimentos em Renda Fixa e Reserva de Emergência", preco: "R$ 90/hora" },
    { nome: "Carlos Eduardo Lima", especialidade: "Investimentos internacionais (Dólar e Euro)",        preco: "R$ 120/hora" },
    { nome: "Juliana Marques",    especialidade: "Organização financeira e controle de gastos",         preco: "R$ 80/hora" }
];

function iniciaisNome(nome) {
    return nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function abrirInteressePorEmail(assuntoTexto, itemTexto) {
    const assunto = encodeURIComponent(assuntoTexto);
    const corpo = encodeURIComponent(`Olá! Tenho interesse em: ${itemTexto}\n\nMeu nome:\nMeu e-mail de contato:`);
    window.location.href = `mailto:${EMAIL_DESTINO}?subject=${assunto}&body=${corpo}`;
}

function renderizarProdutos() {
    const listaEbooks = document.getElementById("listaEbooks");
    const listaCursos = document.getElementById("listaCursos");
    const listaProfessores = document.getElementById("listaProfessores");
    if (!listaEbooks || !listaCursos || !listaProfessores) return;

    listaEbooks.innerHTML = "";
    ebooksDisponiveis.forEach(item => {
        const el = document.createElement("div");
        el.className = "produto-card";
        el.innerHTML = `
            <div class="produto-info">
                <h4>${item.titulo}</h4>
                <p>${item.desc}</p>
                <span class="produto-preco">${item.preco}</span>
            </div>
            <button class="btn-comprar">Comprar</button>
        `;
        el.querySelector(".btn-comprar").addEventListener("click", () =>
            abrirInteressePorEmail("Interesse em E-book", item.titulo)
        );
        listaEbooks.appendChild(el);
    });

    listaCursos.innerHTML = "";
    cursosDisponiveis.forEach(item => {
        const el = document.createElement("div");
        el.className = "produto-card";
        el.innerHTML = `
            <div class="produto-info">
                <h4>${item.titulo}</h4>
                <p>${item.desc}</p>
                <span class="produto-preco">${item.preco}</span>
            </div>
            <button class="btn-comprar">Comprar</button>
        `;
        el.querySelector(".btn-comprar").addEventListener("click", () =>
            abrirInteressePorEmail("Interesse em Curso", item.titulo)
        );
        listaCursos.appendChild(el);
    });

    listaProfessores.innerHTML = "";
    professoresDisponiveis.forEach(prof => {
        const el = document.createElement("div");
        el.className = "professor-card";
        el.innerHTML = `
            <div class="professor-avatar">${iniciaisNome(prof.nome)}</div>
            <div class="professor-info">
                <h4>${prof.nome}</h4>
                <span>${prof.especialidade}</span>
                <span class="professor-preco">${prof.preco}</span>
            </div>
            <button class="btn-comprar">Contratar</button>
        `;
        el.querySelector(".btn-comprar").addEventListener("click", () =>
            abrirInteressePorEmail("Interesse em contratar professor", prof.nome)
        );
        listaProfessores.appendChild(el);
    });
}

// INICIALIZAÇÃO 
aplicarTemaSalvo();
aplicarPerfilSalvo();
inicializarSeletorMes();
atualizarDashboard();
atualizarProgressoCategorias();
inicializarConexoes();
renderizarCartoes();
inicializarNavMobile();
renderizarComentarios();
renderizarDicasInvestimento();
renderizarBancosComparativo();
renderizarProdutos();