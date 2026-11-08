// Autor do arquivo: Enzo Carleti Teixeira

// Elementos usados no código
const form_busca = document.querySelector("#form_busca");
const campo_busca = document.querySelector(".pesquisa");
const erro_busca = document.querySelector("#erroBusca");
const sem_resultado = document.querySelector("#sem_resultado");
const corpo_tabela = document.querySelector("tbody");
const total = document.querySelector(".total");
const filtros = document.querySelectorAll(".filtro");

// Transforma "2026-10-20" em "20/10/2026"
function formatarData(data) {
    const partes = data.split("-")
    return partes[2] + "/" + partes[1] + "/" + partes[0]
}

// Cria uma célula com o texto informado e coloca na linha da tabela
function adicionarCelula(linha, texto) {
    const celula = document.createElement("td")
    celula.textContent = texto
    linha.appendChild(celula)
}

// Mostra na tabela as demandas que vieram da API
function mostrarDemandas(demandas) {
    corpo_tabela.innerHTML = ""

    demandas.forEach((demanda) => {
        const linha = document.createElement("tr")

        adicionarCelula(linha, demanda.titulo)
        adicionarCelula(linha, demanda.tipo)
        adicionarCelula(linha, demanda.prioridade)
        adicionarCelula(linha, demanda.status)
        adicionarCelula(linha, demanda.projeto)
        adicionarCelula(linha, demanda.responsavel || "Sem responsável")
        adicionarCelula(linha, formatarData(demanda.dataCriacao))

        // Demanda sem prazo mostra um aviso no lugar da data
        if (demanda.prazo) {
            adicionarCelula(linha, formatarData(demanda.prazo))
        } else {
            adicionarCelula(linha, "Sem prazo")
        }

        // Link que abre os detalhes desta demanda pelo id dela
        const celula_link = document.createElement("td")
        const link = document.createElement("a")
        link.href = "detalhes.demanda.html?id=" + demanda.id
        link.textContent = "Detalhes"
        celula_link.appendChild(link)
        linha.appendChild(celula_link)

        corpo_tabela.appendChild(linha)
    })

    // Atualiza o contador de demandas em baixo da tabela
    total.textContent = "Total de demandas: " + demandas.length

    // Faz com que o aviso apareça caso não tenha resultados
    if (demandas.length === 0) {
        sem_resultado.style.display = "flex"
    } else {
        sem_resultado.style.display = "none"
    }
}

// Mostra a mensagem de erro e tira a busca do usuario
function mostrarErro(mensagem) {
    erro_busca.textContent = mensagem
    erro_busca.style.display = "flex"
    corpo_tabela.innerHTML = ""
    total.textContent = ""
    sem_resultado.style.display = "none"
}

// Chama a API com a busca, os filtros e a ordenação escolhidos
async function carregarDemandas() {

    // Esconde a mensagem de erro da tentativa anterior
    erro_busca.style.display = "none"

    // Monta os parâmetros da URL, por exemplo: status=Aberta&busca=login
    const parametros = new URLSearchParams()

    // Só vai para a URL o que foi preenchido
    const termo = campo_busca.value.trim()
    if (termo !== "") {
        parametros.append("busca", termo)
    }

    // O name de cada campo é o nome do parâmetro que a API espera
    filtros.forEach((filtro) => {
        if (filtro.value.trim() !== "") {
            parametros.append(filtro.name, filtro.value.trim())
        }
    })

    try {
        const resposta = await fetch("/demandas?" + parametros.toString())
        const dados = await resposta.json()

        // Se a API devolveu erro (ex: 400), mostra a mensagem dela na tela
        if (!resposta.ok) {
            mostrarErro("Erro " + resposta.status + ": " + dados.erro)
            return
        }

        mostrarDemandas(dados.demandas)

    } catch (erro) {
        // Erro se o servidor naõ estiver ligado
        mostrarErro("Não foi possível conectar ao servidor.")
    }
}

// Executa quando algo é buscado
form_busca.addEventListener("submit", (e) => {

    // Cancela o envio do padrão pra nao recarregar a página
    e.preventDefault()

    // Pega o texto digitado e remove os espaços do começo e do fim
    const termo = campo_busca.value.trim()

    // Esconde a mensagem de erro da tentativa anterior
    erro_busca.style.display = "none"

    // Vai parar a função caso algo não seja validado
    if (termo === "") {
        erro_busca.textContent = "Digite um termo para buscar."
        erro_busca.style.display = "flex"
        return
    }

    // Validação de mínimo de caracteres
    if (termo.length < 2) {
        erro_busca.textContent = "Digite pelo menos 2 caracteres."
        erro_busca.style.display = "flex"
        return
    }

    // Validação do maximo de caracteres
    if (termo.length > 60) {
        erro_busca.textContent = "Digite no máximo 60 caracteres."
        erro_busca.style.display = "flex"
        return
    }

    carregarDemandas()
})

// Função para mostrar tudo depois de apagarem a busca das demandas 
campo_busca.addEventListener("input", () => {
    if (campo_busca.value === "") {
        carregarDemandas()
    }
})

// Quando um filtro ou a ordenação muda, busca as demandas de novo
filtros.forEach((filtro) => {
    filtro.addEventListener("change", carregarDemandas)
})

// Busca as demandas assim que a página abre
carregarDemandas()
