/*
    Autor: José Gabriel Bedani
*/

console.log("dashboard.js carregou");

// PEGA O FILTRO E TODAS AS SEÇÕES DO DASHBOARD
const filtro = document.getElementById("filtroVisualizacao");
const secoes = document.querySelectorAll(".secao-dashboard");

// EXECUTA QUANDO O USUÁRIO MUDA A OPÇÃO DO FILTRO
filtro.addEventListener("change", function () {

    const opcaoSelecionada = filtro.value;

    // PASSA POR TODAS AS SEÇÕES
    secoes.forEach(function (secao) {

        const nomeSecao = secao.getAttribute("data-secao");

        if (opcaoSelecionada === "todos") {
            secao.style.display = "block";
        } else if (nomeSecao === opcaoSelecionada) {
            secao.style.display = "block";
        } else {
            secao.style.display = "none";
        }

    });

});