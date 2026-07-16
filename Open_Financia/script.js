console.log("Open Finance iniciado!");

const temaWhite = document.getElementById("temaWhite");
const temaBlack = document.getElementById("temaBlack");

temaBlack.addEventListener("click", () => {

    document.body.classList.add("dark");

});

temaWhite.addEventListener("click", () => {

    document.body.classList.remove("dark");

});
console.log(temaWhite);
console.log(temaBlack);

const saldo = 24990;
const receita = 10990;
const despesas = 4490;
const investimento = 16490;

document.getElementById("saldoTotal").innerText = 
`R$ ${saldo.toLocaleString("pt-BR")}`;

document.getElementById("receita").innerText = 
`R$ ${receita.toLocaleString("pt-BR")}`;

document.getElementById("despesas").innerText = 
`R$ ${despesas.toLocaleString("pt-BR")}`;

document.getElementById("investimento").innerText = 
`R$ ${investimento.toLocaleString("pt-BR")}`;

saldo.innerHTML = "R$ 30.000,00";