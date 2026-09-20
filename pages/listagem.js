// Autor do arquivo: Enzo Carleti Teixeira

// Elementos usados no código
const form_busca = document.querySelector("#form_busca");
const campo_busca = document.querySelector(".pesquisa");
const erro_busca = document.querySelector("#erro_busca");
const sem_resultado = document.querySelector("#sem_resultado");
const linhas = document.querySelectorAll("tbody tr");
const total = document.querySelector(".total");

// Executa quando algo é buscado
form_busca.addEventListener("submit", (e) => {

    // Cancela o envio do padrão pra nao recarregar a página
    e.preventDefault()

    // Pega o texto digitado e remove os espaços do começo e do fim
    const termo = campo_busca.value.trim()

    // Esconde a mensagem de erro da tentativa anterior
    erro_busca.style.display = "none"

    // O return interrompe a função e impede a busca com dado inválido
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

    // Variavel que conta quantas demandas foram encontradas
    let encontradas = 0

    // Percorre as linhas da tabela e esconde as que não combinam com o que foi digitado no campo de busca e mostra as que combinam
    linhas.forEach((linha) => {
        if (linha.textContent.toLowerCase().includes(termo.toLowerCase())) {
            linha.style.display = ""
            encontradas++
        } else {
            linha.style.display = "none"
        }
    })

    // Atualiza o contador de demandas em baixo da tabela
    total.textContent = "Total de demandas: " + encontradas

    // Faz com que o aviso apareca caso não tenha sido encontrado nenhum resultado da busca
    if (encontradas === 0) {
        sem_resultado.style.display = "flex"
    } else {
        sem_resultado.style.display = "none"
    }
})

// Função que é executada quando tudo na busca é apagado e mostra todas as demandas
campo_busca.addEventListener("input", () => {

    if (campo_busca.value === "") {
        linhas.forEach((linha) => {
            linha.style.display = ""
        })

        total.textContent = "Total de demandas: " + linhas.length
        erro_busca.style.display = "none"
        sem_resultado.style.display = "none"
    }
})
