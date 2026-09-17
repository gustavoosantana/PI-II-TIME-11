const form_busca = document.querySelector("#form_busca");
const campo_busca = document.querySelector(".pesquisa");
const erro_busca = document.querySelector("#erro_busca");
const sem_resultado = document.querySelector("#sem_resultado");
const linhas = document.querySelectorAll("tbody tr");
const total = document.querySelector(".total");

form_busca.addEventListener("submit", (e) => {
    e.preventDefault()

    const termo = campo_busca.value.trim()


    erro_busca.style.display = "none"

    // campo obrigatório
    if (termo === "") {
        erro_busca.textContent = "Digite um termo para buscar."
        erro_busca.style.display = "flex"
        return
    }

    // mínimo de caracteres
    if (termo.length < 2) {
        erro_busca.textContent = "Digite pelo menos 2 caracteres."
        erro_busca.style.display = "flex"
        return
    }

    // máximo de caracteres
    if (termo.length > 60) {
        erro_busca.textContent = "Digite no máximo 60 caracteres."
        erro_busca.style.display = "flex"
        return
    }

    // passou nas validações: filtra a tabela
    let encontradas = 0

    linhas.forEach((linha) => {
        if (linha.textContent.toLowerCase().includes(termo.toLowerCase())) {
            linha.style.display = ""
            encontradas++
        } else {
            linha.style.display = "none"
        }
    })

    total.textContent = "Total de demandas: " + encontradas

    if (encontradas === 0) {
        sem_resultado.style.display = "flex"
    } else {
        sem_resultado.style.display = "none"
    }
})

// quando apagar a busca, volta a mostrar todas as demandas
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
