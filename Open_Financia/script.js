console.log("Open Finance iniciado!");

const temaWhite = document.getElementById("temaWhite");
const temaBlack = document.getElementById("temaBlack");

const usuario = {
    nome: "Jon",
    idade: 22,
    cidade: "São Paulo"
};

const bancos = [
    { nome: "Nubank",   saldo: 8200, receita: 10990, despesas: 4490, investimento: 3200, conectado: true },
    { nome: "Bradesco", saldo: 5000, receita: 8000,  despesas: 2500, investimento: 7000, conectado: true },
    { nome: "Itaú",     saldo: 3000, receita: 6000,  despesas: 1500, investimento: 4000, conectado: true }
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

// DASHBOARD 
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

// INICIALIZAÇÃO 
aplicarTemaSalvo();
atualizarDashboard();