// Autor: José Gabriel Bedani

import { Router, Request, Response } from "express"
import { getConn } from "./db"
import { DemandaDashboard } from "./dashboard.dados"

export const rotasDashboard = Router()

// Busca as demandas no banco, no mesmo formato dos dados de teste
async function buscarDemandas(): Promise<DemandaDashboard[]> {
    let conn
    try {
        conn = await getConn()
        const resultado = await conn.execute(`
            SELECT d.id AS "id",
                   d.titulo AS "titulo",
                   d.tipo AS "tipo",
                   d.prioridade AS "prioridade",
                   d.status AS "status",
                   NVL(u.nome, ' ') AS "responsavel",
                   NVL(TO_CHAR(d.prazo_finalizacao, 'YYYY-MM-DD'), ' ') AS "prazo"
            FROM demandas d
            LEFT JOIN usuarios u ON u.id = d.id_responsavel
            ORDER BY d.id
        `)
        // O Oracle nao guarda texto vazio, por isso o NVL usa espaco e aqui volta a ser ""
        return ((resultado.rows ?? []) as DemandaDashboard[]).map((d) => ({
            ...d,
            responsavel: d.responsavel.trim(),
            prazo: d.prazo.trim()
        }))
    } finally {
        if (conn) await conn.close()
    }
}

// Devolve os indicadores do dashboard. Use ?dias=N para mudar o período (padrão: 7)
rotasDashboard.get("/dashboard", async (req: Request, res: Response) => {
    const parametro = req.query.dias

    const dias =
        parametro === undefined
            ? 7
            : typeof parametro === "string" && parametro.trim() !== ""
                ? Number(parametro)
                : NaN

    // Só aceita número inteiro de 1 a 365
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
        return res.status(400).json({
            erro: "O parâmetro dias deve ser um número inteiro entre 1 e 365."
        })
    }

    let demandas: DemandaDashboard[]
    try {
        demandas = await buscarDemandas()
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ erro: "Erro ao buscar as demandas no banco de dados." })
    }

    const porStatus = {
        aberta: demandas.filter((d) => d.status === "Aberta").length,
        emAndamento: demandas.filter((d) => d.status === "Em andamento").length,
        emRevisao: demandas.filter((d) => d.status === "Em revisão").length,
        concluida: demandas.filter((d) => d.status === "Concluída").length,
        cancelada: demandas.filter((d) => d.status === "Cancelada").length
    }

    const porPrioridade = {
        critica: demandas.filter((d) => d.prioridade === "Crítica").length,
        alta: demandas.filter((d) => d.prioridade === "Alta").length,
        media: demandas.filter((d) => d.prioridade === "Média").length,
        baixa: demandas.filter((d) => d.prioridade === "Baixa").length
    }

    const porTipo = {
        tarefa: demandas.filter((d) => d.tipo === "Tarefa").length,
        defeito: demandas.filter((d) => d.tipo === "Defeito").length,
        melhoria: demandas.filter((d) => d.tipo === "Melhoria").length,
        documentacao: demandas.filter((d) => d.tipo === "Documentação").length
    }

    // "Em aberto" = ainda não concluída nem cancelada
    const criticasEmAberto = demandas.filter((d) =>
        d.prioridade === "Crítica" &&
        d.status !== "Concluída" &&
        d.status !== "Cancelada"
    )

    // "Próximas do prazo" = não encerradas, com prazo entre hoje e hoje + dias
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const limite = new Date(hoje)
    limite.setDate(limite.getDate() + dias)

    const proximasDoPrazo = demandas
        .filter((d) => {
            if (!d.prazo || d.status === "Concluída" || d.status === "Cancelada") {
                return false
            }

            const prazo = new Date(d.prazo + "T00:00:00")
            return !Number.isNaN(prazo.getTime()) && prazo >= hoje && prazo <= limite
        })
        .sort((a, b) => a.prazo.localeCompare(b.prazo))

    return res.status(200).json({
        total: demandas.length,
        criterioEmAberto: "Demanda que ainda não foi concluída nem cancelada",
        criterioProximasDoPrazo:
            "Demandas não encerradas que vencem nos próximos " + dias + " dias",
        porStatus,
        porPrioridade,
        porTipo,
        criticasEmAberto,
        proximasDoPrazo
    })
})
