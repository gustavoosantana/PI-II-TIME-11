// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Rotas da tela de Detalhes da Demanda

import { Router } from "express"

// Um Router agrupa rotas. Ele fica neste arquivo separado para as minhas
// rotas nao precisarem ser escritas dentro do app.js, que e da equipe.
export const rotas = Router()

// Nome de quem esta usando o sistema. Quando a tela de login estiver
// ligada, este nome passa a vir de la.
const usuario = "Eduardo Martins Colmati"

// Ordem do ciclo de vida, definida no Documento de Visao. A demanda nao
// pula etapas: para ser concluida precisa passar por Em revisao.
const ordem = ["Aberta", "Em andamento", "Em revisao", "Concluida"]

// As demandas do sistema. A lista comeca vazia: tudo o que aparecer nas
// telas vai ter entrado pela rota de cadastro, POST /api/demandas.
//
// Fica em uma variavel porque o projeto ainda nao tem banco de dados, entao
// ao reiniciar o servidor a lista volta a ficar vazia.
const demandas = []
let proximoNumero = 1

// Fuso de Brasilia. Sem isso as datas saem no horario de Londres quando o
// sistema esta publicado, tres horas adiantadas.
const FUSO = "America/Sao_Paulo"

// Data e hora de agora, no formato 21/09/2026 as 14:32
function agora() {
    const d = new Date()
    return d.toLocaleDateString("pt-BR", { timeZone: FUSO }) + " as " +
           d.toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" })
}

// Tira os acentos. A tela de cadastro escreve "Em revisão" e "Concluída"
// com acento, e as regras aqui usam sem. Sem isto o status vindo de la
// seria recusado.
function semAcento(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Para quais status a demanda pode ir a partir do status atual
function proximosStatus(atual) {

    // Demanda encerrada nao muda mais de status
    if (atual === "Concluida" || atual === "Cancelada") {
        return []
    }

    return [ordem[ordem.indexOf(atual) + 1], "Cancelada"]
}

// Procura uma demanda pelo numero
function procurar(id) {
    return demandas.find((d) => d.id === Number(id))
}

// Cria uma demanda e devolve ela
function criar(dados) {
    const demanda = {
        id: proximoNumero,
        titulo: dados.titulo,
        descricao: dados.descricao,
        projeto: dados.projeto || "",
        tipo: dados.tipo || "",
        prioridade: dados.prioridade || "",
        status: dados.status || "Aberta",
        responsavel: dados.responsavel || "",
        prazo: dados.prazo || "",
        criacao: agora(),
        comentarios: [],
        historico: [{ texto: "Demanda cadastrada no sistema", autor: usuario, data: agora() }]
    }

    demandas.push(demanda)
    proximoNumero = proximoNumero + 1
    return demanda
}

/* ---------------------------------------------------------------------
   LIGACAO ENTRE A LISTAGEM E ESTA TELA

   Cada linha da listagem tem um link "Detalhes" apontando para
   produtodetalhes.html, um arquivo que nunca existiu no projeto. Como
   aquela tela nao e minha, em vez de alterar o arquivo dela eu atendo
   esse endereco aqui e redireciono para a tela de Detalhes.
   --------------------------------------------------------------------- */
rotas.get("/produtodetalhes.html", (req, res) => {
    res.redirect("/detalhes.demanda.html")
})

// Devolve todas as demandas, para a tela de listagem montar a tabela
rotas.get("/api/demandas", (req, res) => {
    res.json({ total: demandas.length, demandas: demandas })
})

// Cadastra uma demanda. Aceita nome e associado, que sao os nomes que a
// tela de cadastro ja usa para titulo e projeto.
rotas.post("/api/demandas", (req, res) => {
    const c = req.body
    const titulo = String(c.titulo || c.nome || "").trim()
    const descricao = String(c.descricao || "").trim()

    if (titulo === "") {
        return res.status(400).json({ erro: "Informe o titulo da demanda." })
    }

    if (descricao === "") {
        return res.status(400).json({ erro: "Informe a descricao da demanda." })
    }

    const status = c.status ? semAcento(c.status) : "Aberta"

    if (!ordem.includes(status) && status !== "Cancelada") {
        return res.status(400).json({ erro: "Status desconhecido: " + c.status })
    }

    const demanda = criar({
        titulo: titulo,
        descricao: descricao,
        projeto: c.projeto || c.associado,
        tipo: c.tipo,
        prioridade: c.prioridade,
        status: status,
        responsavel: c.responsavel,
        prazo: c.prazo
    })

    res.status(201).json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Envia uma demanda para a tela de Detalhes
rotas.get("/api/demanda/:id", (req, res) => {
    const demanda = procurar(req.params.id)

    if (!demanda) {

        // Mensagem diferente quando ainda nao ha nenhuma demanda, para a
        // pessoa entender que falta cadastrar e nao que houve um erro
        if (demandas.length === 0) {
            return res.status(404).json({ erro: "Nenhuma demanda cadastrada ainda." })
        }

        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Registra um comentario
rotas.post("/api/demanda/:id/comentarios", (req, res) => {
    const demanda = procurar(req.params.id)
    const texto = req.body.texto

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    // O trim remove os espacos do comeco e do fim
    if (!texto || texto.trim() === "") {
        return res.status(400).json({ erro: "Escreva o comentario antes de enviar." })
    }

    demanda.comentarios.push({ autor: usuario, data: agora(), texto: texto.trim() })

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Muda o status da demanda
rotas.patch("/api/demanda/:id/status", (req, res) => {
    const demanda = procurar(req.params.id)

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    const novo = semAcento(req.body.status || "")

    // A tela ja mostra so os botoes permitidos, mas a conferencia e feita
    // aqui tambem: quem chamar a rota por fora do navegador fica barrado
    if (!proximosStatus(demanda.status).includes(novo)) {
        return res.status(400).json({ erro: "Esta demanda nao pode passar para " + novo + "." })
    }

    demanda.historico.unshift({
        texto: "Status alterado de " + demanda.status + " para " + novo,
        autor: usuario,
        data: agora()
    })

    demanda.status = novo

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})
