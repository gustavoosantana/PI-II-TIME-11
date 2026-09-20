javascript
/*
    Autor: José Gabriel Bedani
*/



// PEGA O FILTRO E TODAS AS SEÇÕES DO DASHBOARD


const filtro = document.getElementById("filtroVisualizacao");
const secoes = document.querySelectorAll(".secao-dashboard");



// EXECUTA QUANDO O USUÁRIO MUDA A OPÇÃO DO FILTRO


filtro.addEventListener("change", function () {

    const opcaoSelecionada = filtro.value;


    // PASSA POR TODAS AS SEÇÕES DO DASHBOARD
 

    secoes.forEach(function (secao) {

        const nomeSecao = secao.getAttribute("data-secao");


        // Se escolher "Todos", mostra todas as seções
        if (opcaoSelecionada === "todos") {

            secao.style.display = "block";

        }

        // Se a seção for a escolhida, ela permanece visível
        else if (nomeSecao === opcaoSelecionada) {

            secao.style.display = "block";

        }

        // As outras seções ficam escondidas
        else {

            secao.style.display = "none";

        }

    });

});
```
