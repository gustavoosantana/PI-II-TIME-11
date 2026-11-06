/*
    Autor: José Gabriel Bedani
    Tela: Dashboard
    O que faz: busca os dados na API (GET /dashboard) e mostra na tela.
*/

// PEGA OS ELEMENTOS DA PÁGINA
const filtro = document.getElementById("filtroVisualizacao");
const secoes = document.querySelectorAll(".secao-dashboard");
const selectDias = document.getElementById("diasPrazo");
const mensagemErro = document.getElementById("mensagemErro");


// COLOCA UM NÚMERO NO ELEMENTO QUE TEM O ID INFORMADO
function mostrarNumero(id, valor) {
    document.getElementById(id).textContent = valor;
}

// TRANSFORMA "2026-10-20" EM "20/10/2026"
function formatarData(data) {
    if (!data) {
        return "Sem prazo";
    }
    const partes = data.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// MOSTRA A LISTA DE DEMANDAS (críticas ou próximas do prazo) DENTRO DE UMA DIV
function mostrarDemandas(idDiv, lista, classeCard) {
    const div = document.getElementById(idDiv);
    div.innerHTML = "";

    // Se não tem nenhuma, avisa o usuário
    if (lista.length === 0) {
        div.textContent = "Nenhuma demanda encontrada.";
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const demanda = lista[i];

        const card = document.createElement("div");
        card.className = classeCard;

        const titulo = document.createElement("h3");
        titulo.textContent = demanda.titulo;

        const responsavel = document.createElement("p");
        responsavel.textContent = "Responsável: " + (demanda.responsavel || "Sem responsável");

        const prazo = document.createElement("p");
        prazo.textContent = "Prazo: " + formatarData(demanda.prazo);

        card.appendChild(titulo);
        card.appendChild(responsavel);
        card.appendChild(prazo);
        div.appendChild(card);
    }
}

// MOSTRA OS DADOS QUE VIERAM DA API NA TELA
function preencherTela(dados) {
    // Resumo por status
    mostrarNumero("total", dados.total);
    mostrarNumero("aberta", dados.porStatus.aberta);
    mostrarNumero("emAndamento", dados.porStatus.emAndamento);
    mostrarNumero("emRevisao", dados.porStatus.emRevisao);
    mostrarNumero("concluida", dados.porStatus.concluida);
    mostrarNumero("cancelada", dados.porStatus.cancelada);

    // Por prioridade
    mostrarNumero("critica", dados.porPrioridade.critica);
    mostrarNumero("alta", dados.porPrioridade.alta);
    mostrarNumero("media", dados.porPrioridade.media);
    mostrarNumero("baixa", dados.porPrioridade.baixa);

    // Por tipo
    mostrarNumero("tarefa", dados.porTipo.tarefa);
    mostrarNumero("defeito", dados.porTipo.defeito);
    mostrarNumero("melhoria", dados.porTipo.melhoria);
    mostrarNumero("documentacao", dados.porTipo.documentacao);

    // Critérios usados (explicados pela API)
    document.getElementById("criterioEmAberto").textContent = dados.criterioEmAberto;
    document.getElementById("criterioPrazo").textContent = dados.criterioProximasDoPrazo;

    // Listas de demandas
    mostrarDemandas("listaCriticas", dados.criticasEmAberto, "criticas");
    mostrarDemandas("listaPrazos", dados.proximasDoPrazo, "prazos");
}

// CHAMA A API E ATUALIZA A TELA
async function carregarDashboard() {
    // Esconde qualquer erro que estava aparecendo
    mensagemErro.hidden = true;

    try {
        const resposta = await fetch("/dashboard?dias=" + selectDias.value);
        const dados = await resposta.json();

        // Se a API devolveu erro (ex: 400), mostra a mensagem dela na tela
        if (!resposta.ok) {
            mensagemErro.textContent = "Erro " + resposta.status + ": " + dados.erro;
            mensagemErro.hidden = false;
            return;
        }

        preencherTela(dados);

    } catch (erro) {
        // Cai aqui se o servidor estiver desligado, por exemplo
        mensagemErro.textContent = "Não foi possível conectar ao servidor.";
        mensagemErro.hidden = false;
    }
}


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

// QUANDO MUDA A QUANTIDADE DE DIAS, BUSCA OS DADOS DE NOVO
selectDias.addEventListener("change", carregarDashboard);

// BUSCA OS DADOS ASSIM QUE A PÁGINA ABRE
carregarDashboard();
