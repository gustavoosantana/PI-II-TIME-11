// Autor: José Gabriel Bedani

import { Router, Request, Response } from "express"
// Dados de teste do próprio dashboard (depois serão trocados pelo banco)
import { demandas } from "./dashboard.dados"

export const rotasDashboard = Router()

// Devolve os indicadores do dashboard. Use ?dias=N para mudar o período (padrão: 7)
rotasDashboard.get("/dashboard", (req: Request, res: Response) => {
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
