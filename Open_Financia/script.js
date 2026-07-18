console.log("Open Finance iniciado!");

const temaWhite = document.getElementById("temaWhite");
const temaBlack = document.getElementById("temaBlack");

temaBlack.addEventListener("click", () => {
    document.body.classList.add("dark");
});

temaWhite.addEventListener("click", () => {
    document.body.classList.remove("dark");
});

let saldo = 24990;
let receita = 10990;
let despesas = 4490;
let investimento = 16490;

const btnReceber = document.getElementById("btnReceber");
const btnDespesa = document.getElementById("btnDespesa");

btnReceber.addEventListener("click", () => {
    receberDinheiro(1000);
});

btnDespesa.addEventListener("click", () => {
    pagarConta(500);
});

function receberDinheiro(valor) {

    saldo += valor;
    receita += valor;

    atualizarDashboard();
}

function pagarConta(valor) {

    saldo -= valor;
    despesas += valor;

    atualizarDashboard();
}

atualizarDashboard();

function atualizarDashboard() {

    document.getElementById("saldoTotal").innerText =
        `R$ ${saldo.toLocaleString("pt-BR")}`;

    document.getElementById("receita").innerText =
        `R$ ${receita.toLocaleString("pt-BR")}`;

    document.getElementById("despesas").innerText =
        `R$ ${despesas.toLocaleString("pt-BR")}`;

    document.getElementById("investimento").innerText =
        `R$ ${investimento.toLocaleString("pt-BR")}`;
}