// Autor do arquivo: Enzo Carleti Teixeira

import { Router, Request, Response } from "express"
import { getConn } from "./db"
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

// Consulta que busca as demandas no banco.
// Os JOIN trazem o nome do projeto e do responsável, que ficam em outras tabelas.
// É LEFT JOIN no responsável porque a demanda pode estar sem responsável.
// O TO_CHAR transforma as datas em texto no formato 2026-10-20.
const SQL_DEMANDAS = `
    SELECT d.id AS "id",
           d.titulo AS "titulo",
           d.descricao AS "descricao",
           d.tipo AS "tipo",
           d.prioridade AS "prioridade",
           d.status AS "status",
           p.nome AS "projeto",
           u.nome AS "responsavel",
           TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
           TO_CHAR(d.prazo_finalizacao, 'YYYY-MM-DD') AS "prazo"
    FROM demandas d
    JOIN projetos p ON p.id = d.id_projeto
    LEFT JOIN usuarios u ON u.id = d.id_responsavel
    ORDER BY d.id
`

// Lista as demandas. Aceita filtros, busca e ordenação pela URL, por exemplo:
// EXEMPLOS: /demandas?status=Aberta&prioridade=Alta
// /demandas?busca=exemplo
// /demandas?ordenarPor=prazo&ordem=desc
rotasListagem.get("/demandas", async (req: Request, res: Response) => {

    // Pega os valores que vieram na URL
    const status = req.query.status as string
    const prioridade = req.query.prioridade as string
    const tipo = req.query.tipo as string
    const responsavel = req.query.responsavel as string
    const projeto = req.query.projeto as string
    const busca = req.query.busca as string
    const ordenarPor = req.query.ordenarPor as string
    const ordem = req.query.ordem as string

    // Busca as demandas no banco de dados
    let resultado: Demanda[] = []
    let conn
    try {
        conn = await getConn()
        const consulta = await conn.execute(SQL_DEMANDAS)
        resultado = (consulta.rows ?? []) as Demanda[]
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ erro: "Erro ao buscar as demandas no banco de dados" })
    } finally {
        if (conn) await conn.close()
    }

    // No banco, o campo vazio vem como null. Troca por "" porque os filtros e a ordenação usam texto.
    resultado.forEach((d) => {
        if (!d.responsavel) {
            d.responsavel = ""
        }
        if (!d.prazo) {
            d.prazo = ""
        }
    })

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
