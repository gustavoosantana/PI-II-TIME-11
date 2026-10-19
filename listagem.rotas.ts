// Autor do arquivo: Enzo Carleti Teixeira

import { Router, Request, Response } from "express"
const rotasListagem = Router()

// Formato de cada demanda
interface Demanda {
    id: number
    titulo: string
    descricao: string
    tipo: string
    prioridade: string
    status: string
    projeto: string
    responsavel: string
    dataCriacao: string
    prazo: string
}

// Valores que podem ser usados nos filtros.
const tipos = ["Tarefa", "Defeito", "Melhoria", "Documentação"]
const prioridades = ["Crítica", "Alta", "Média", "Baixa"]
const listaStatus = ["Aberta", "Em andamento", "Em revisão", "Concluída", "Cancelada"]

// Demandas de teste
const demandas: Demanda[] = [
    { id: 1, titulo: "Exemplo 1", descricao: "Descrição do exemplo 1", tipo: "Defeito", prioridade: "Crítica", status: "Aberta", projeto: "Projeto 1", responsavel: "Responsável 1", dataCriacao: "2026-09-01", prazo: "2026-10-20" },
    { id: 2, titulo: "Exemplo 2", descricao: "Descrição do exemplo 2", tipo: "Tarefa", prioridade: "Alta", status: "Em andamento", projeto: "Projeto 1", responsavel: "Responsável 2", dataCriacao: "2026-09-03", prazo: "2026-10-30" },
    { id: 3, titulo: "Exemplo 3", descricao: "Descrição do exemplo 3", tipo: "Documentação", prioridade: "Baixa", status: "Aberta", projeto: "Projeto 2", responsavel: "", dataCriacao: "2026-09-05", prazo: "" },
    { id: 4, titulo: "Exemplo 4", descricao: "Descrição do exemplo 4", tipo: "Melhoria", prioridade: "Média", status: "Em revisão", projeto: "Projeto 3", responsavel: "Responsável 3", dataCriacao: "2026-09-08", prazo: "2026-10-22" },
    { id: 5, titulo: "Exemplo 5", descricao: "Descrição do exemplo 5", tipo: "Defeito", prioridade: "Crítica", status: "Em andamento", projeto: "Projeto 2", responsavel: "Responsável 2", dataCriacao: "2026-09-10", prazo: "2026-10-19" },
    { id: 6, titulo: "Exemplo 6", descricao: "Descrição do exemplo 6", tipo: "Melhoria", prioridade: "Baixa", status: "Concluída", projeto: "Projeto 1", responsavel: "Responsável 1", dataCriacao: "2026-09-12", prazo: "2026-09-30" },
    { id: 7, titulo: "Exemplo 7", descricao: "Descrição do exemplo 7", tipo: "Tarefa", prioridade: "Média", status: "Aberta", projeto: "Projeto 3", responsavel: "Responsável 3", dataCriacao: "2026-09-15", prazo: "2026-11-15" },
    { id: 8, titulo: "Exemplo 8", descricao: "Descrição do exemplo 8", tipo: "Documentação", prioridade: "Média", status: "Cancelada", projeto: "Projeto 3", responsavel: "", dataCriacao: "2026-09-18", prazo: "" },
    { id: 9, titulo: "Exemplo 9", descricao: "Descrição do exemplo 9", tipo: "Defeito", prioridade: "Alta", status: "Aberta", projeto: "Projeto 2", responsavel: "Responsável 1", dataCriacao: "2026-09-22", prazo: "2026-10-25" },
    { id: 10, titulo: "Exemplo 10", descricao: "Descrição do exemplo 10", tipo: "Tarefa", prioridade: "Baixa", status: "Em revisão", projeto: "Projeto 2", responsavel: "Responsável 3", dataCriacao: "2026-09-25", prazo: "2026-11-05" },
    { id: 11, titulo: "Exemplo 11", descricao: "Descrição do exemplo 11", tipo: "Melhoria", prioridade: "Alta", status: "Aberta", projeto: "Projeto 1", responsavel: "", dataCriacao: "2026-10-01", prazo: "2026-11-20" },
    { id: 12, titulo: "Exemplo 12", descricao: "Descrição do exemplo 12", tipo: "Defeito", prioridade: "Média", status: "Concluída", projeto: "Projeto 3", responsavel: "Responsável 2", dataCriacao: "2026-10-05", prazo: "2026-10-15" }
]

// Lista as demandas. Aceita filtros, busca e ordenação pela URL, por exemplo:
// EXEMPLOS: /demandas?status=Aberta&prioridade=Alta
// /demandas?busca=exemplo
// /demandas?ordenarPor=prazo&ordem=desc
rotasListagem.get("/demandas", (req: Request, res: Response) => {

    // Pega os valores que vieram na URL
    const status = req.query.status as string
    const prioridade = req.query.prioridade as string
    const tipo = req.query.tipo as string
    const responsavel = req.query.responsavel as string
    const projeto = req.query.projeto as string
    const busca = req.query.busca as string
    const ordenarPor = req.query.ordenarPor as string
    const ordem = req.query.ordem as string

    // Faz uma cópia da lista pra não mudar a original.
    let resultado = [...demandas]

    // Cada filtro tira da lista as demandas que não combinam com ele.

    if (status) {
        if (!listaStatus.includes(status)) {
            return res.status(400).json({ erro: "Status inválido. Use: Aberta, Em andamento, Em revisão, Concluída ou Cancelada" })
        }
        resultado = resultado.filter((d) => d.status === status)
    }

    if (prioridade) {
        if (!prioridades.includes(prioridade)) {
            return res.status(400).json({ erro: "Prioridade inválida. Use: Crítica, Alta, Média ou Baixa" })
        }
        resultado = resultado.filter((d) => d.prioridade === prioridade)
    }

    if (tipo) {
        if (!tipos.includes(tipo)) {
            return res.status(400).json({ erro: "Tipo inválido. Use: Tarefa, Defeito, Melhoria ou Documentação" })
        }
        resultado = resultado.filter((d) => d.tipo === tipo)
    }

    // O toLowerCase deixa tudo minúsculo para não diferenciar maiúscula de minúscula
    if (responsavel) {
        resultado = resultado.filter((d) => d.responsavel.toLowerCase().includes(responsavel.toLowerCase()))
    }

    if (projeto) {
        resultado = resultado.filter((d) => d.projeto.toLowerCase().includes(projeto.toLowerCase()))
    }

    // Busca pelo título ou pela descrição.
    if (busca !== undefined) {
        const termo = busca.trim().toLowerCase()

        if (termo.length < 2 || termo.length > 60) {
            return res.status(400).json({ erro: "A busca deve ter entre 2 e 60 caracteres" })
        }

        resultado = resultado.filter((d) =>
            d.titulo.toLowerCase().includes(termo) || d.descricao.toLowerCase().includes(termo)
        )
    }

    // Ordenação
    if (ordenarPor) {

        if (ordem && ordem !== "asc" && ordem !== "desc") {
            return res.status(400).json({ erro: "Ordem inválida. Use: asc ou desc" })
        }

        // Prioridade e status usam a posição na lista
        if (ordenarPor === "prioridade") {
            resultado.sort((a, b) => prioridades.indexOf(a.prioridade) - prioridades.indexOf(b.prioridade))
        } else if (ordenarPor === "status") {
            resultado.sort((a, b) => listaStatus.indexOf(a.status) - listaStatus.indexOf(b.status))
        } else if (ordenarPor === "criacao") {
            resultado.sort((a, b) => a.dataCriacao.localeCompare(b.dataCriacao))
        } else if (ordenarPor === "prazo") {
            resultado.sort((a, b) => a.prazo.localeCompare(b.prazo))
        } else {
            return res.status(400).json({ erro: "Não é possível ordenar por esse campo. Use: prioridade, criacao, prazo ou status" })
        }

        // Se pediu ordem decrescente, inverte a lista
        if (ordem === "desc") {
            resultado.reverse()
        }

        // As demandas sem prazo ficam sempre no final da lista
        if (ordenarPor === "prazo") {
            const comPrazo = resultado.filter((d) => d.prazo !== "")
            const semPrazo = resultado.filter((d) => d.prazo === "")
            resultado = comPrazo.concat(semPrazo)
        }
    }

    // Se nenhuma demanda combinar com os filtros, devolve a lista sem nenhum campo.
    return res.status(200).json({ total: resultado.length, demandas: resultado })
})

export default rotasListagem
