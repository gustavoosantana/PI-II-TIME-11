/*
    Autor: José Gabriel Bedani
    Tela: Dashboard
    O que faz: chama a API (GET /dashboard), recebe os números em JSON
    e coloca cada um no lugar certo do dashboard.html.
*/


// ---------------------------------------------------------------
// ELEMENTOS DA PÁGINA QUE O SCRIPT USA
// ---------------------------------------------------------------

const filtroVisualizacao = document.getElementById("filtroVisualizacao")  // select "Visualizar"
const selectDias = document.getElementById("diasPrazo")                   // select "Prazo nos próximos"
const mensagemErro = document.getElementById("mensagemErro")              // <p> vermelho de erro
const secoes = document.querySelectorAll(".secao-dashboard")              // as 5 seções do dashboard


// ---------------------------------------------------------------
// FUNÇÕES DE APOIO
// ---------------------------------------------------------------

// Coloca um número dentro do elemento que tem o id informado
function mostrarNumero(id, valor) {
    document.getElementById(id).textContent = valor
}

// Transforma "2026-10-20" em "20/10/2026". Se não tiver data, mostra "Sem prazo".
function formatarData(data) {
    if (data === "") {
        return "Sem prazo"
    }

    const partes = data.split("-")   // ["2026", "10", "20"]
    const ano = partes[0]
    const mes = partes[1]
    const dia = partes[2]

    return dia + "/" + mes + "/" + ano
}

// Mostra a mensagem de erro em vermelho no topo da página
function mostrarErro(texto) {
    mensagemErro.textContent = texto
    mensagemErro.hidden = false
}

// Esconde a mensagem de erro
function esconderErro() {
    mensagemErro.hidden = true
}

// Cria um card para cada demanda da lista e coloca dentro da div informada.
// Usado nas seções "críticas em aberto" e "próximas do prazo".
function mostrarDemandas(idDiv, lista, classeCard) {
    const div = document.getElementById(idDiv)
    div.innerHTML = ""   // limpa o que estava antes

    if (lista.length === 0) {
        div.textContent = "Nenhuma demanda encontrada."
        return
    }

    for (const demanda of lista) {
        const card = document.createElement("div")
        card.className = classeCard   // "criticas" ou "prazos" (cores no CSS)

        const titulo = document.createElement("h3")
        titulo.textContent = demanda.titulo

        const responsavel = document.createElement("p")
        if (demanda.responsavel === "") {
            responsavel.textContent = "Responsável: Sem responsável"
        } else {
            responsavel.textContent = "Responsável: " + demanda.responsavel
        }

        const prazo = document.createElement("p")
        prazo.textContent = "Prazo: " + formatarData(demanda.prazo)

        card.appendChild(titulo)
        card.appendChild(responsavel)
        card.appendChild(prazo)
        div.appendChild(card)
    }
}


// ---------------------------------------------------------------
// PREENCHE A TELA COM OS DADOS DA API
// ---------------------------------------------------------------

// Recebe o JSON que veio de GET /dashboard e coloca cada valor no HTML
function preencherTela(dados) {

    // Resumo por status (tabela)
    mostrarNumero("total", dados.total)
    mostrarNumero("aberta", dados.porStatus.aberta)
    mostrarNumero("emAndamento", dados.porStatus.emAndamento)
    mostrarNumero("emRevisao", dados.porStatus.emRevisao)
    mostrarNumero("concluida", dados.porStatus.concluida)
    mostrarNumero("cancelada", dados.porStatus.cancelada)

    // Por prioridade
    mostrarNumero("critica", dados.porPrioridade.critica)
    mostrarNumero("alta", dados.porPrioridade.alta)
    mostrarNumero("media", dados.porPrioridade.media)
    mostrarNumero("baixa", dados.porPrioridade.baixa)

    // Por tipo
    mostrarNumero("tarefa", dados.porTipo.tarefa)
    mostrarNumero("defeito", dados.porTipo.defeito)
    mostrarNumero("melhoria", dados.porTipo.melhoria)
    mostrarNumero("documentacao", dados.porTipo.documentacao)

    // Frases que explicam o critério de cada lista (vêm prontas da API)
    document.getElementById("criterioEmAberto").textContent = dados.criterioEmAberto
    document.getElementById("criterioPrazo").textContent = dados.criterioProximasDoPrazo

    // Listas de cards
    mostrarDemandas("listaCriticas", dados.criticasEmAberto, "criticas")
    mostrarDemandas("listaPrazos", dados.proximasDoPrazo, "prazos")
}


// ---------------------------------------------------------------
// CHAMA A API
// ---------------------------------------------------------------

// Busca os dados em GET /dashboard?dias=N e atualiza a tela
async function carregarDashboard() {
    esconderErro()

    try {
        const resposta = await fetch("/dashboard?dias=" + selectDias.value)
        const dados = await resposta.json()

        // A API devolveu erro (ex.: 400 ou 500): mostra a mensagem dela na tela
        if (!resposta.ok) {
            mostrarErro("Erro " + resposta.status + ": " + dados.erro)
            return
        }

        preencherTela(dados)

    } catch (erro) {
        // Cai aqui quando nem deu para falar com o servidor (ex.: servidor desligado)
        mostrarErro("Não foi possível conectar ao servidor.")
    }
}


// ---------------------------------------------------------------
// FILTRO "VISUALIZAR": mostra só a seção escolhida (ou todas)
// ---------------------------------------------------------------

// Cada <section> tem um data-secao (resumo, prioridade, tipo, criticas, prazos).
// Mostra a seção se for a escolhida, ou todas se a opção for "todos".
function mostrarSecoes() {
    const escolhida = filtroVisualizacao.value

    for (const secao of secoes) {
        const nomeSecao = secao.getAttribute("data-secao")

        if (escolhida === "todos" || nomeSecao === escolhida) {
            secao.style.display = "block"
        } else {
            secao.style.display = "none"
        }
    }
}


// ---------------------------------------------------------------
// EVENTOS E INÍCIO
// ---------------------------------------------------------------

// Quando muda a opção de "Visualizar", esconde/mostra as seções
filtroVisualizacao.addEventListener("change", mostrarSecoes)

// Quando muda a quantidade de dias, busca os dados de novo na API
selectDias.addEventListener("change", carregarDashboard)

// Busca os dados assim que a página abre
carregarDashboard()
