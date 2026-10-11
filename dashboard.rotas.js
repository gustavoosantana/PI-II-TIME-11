// Autor: José Gabriel Bedani
// Rota responsável por retornar os dados do Dashboard na Reunião 4.

import { Router } from "express"

export const rotasDashboard = Router()

// Dados temporários para testar a rota do dashboard.
// Depois podem ser substituídos pelos dados compartilhados da equipe.
const demandas = [
    {
        id: 1,
        titulo: "Erro no sistema de login",
        tipo: "Defeito",
        prioridade: "Crítica",
        status: "Aberta",
        prazo: "2026-10-13"
    },
    {
        id: 2,
        titulo: "Atualizar documentação",
        tipo: "Documentação",
        prioridade: "Média",
        status: "Em andamento",
        prazo: "2026-10-15"
    },
    {
        id: 3,
        titulo: "Criar tela de cadastro",
        tipo: "Tarefa",
        prioridade: "Alta",
        status: "Concluída",
        prazo: "2026-10-20"
    },
    {
        id: 4,
        titulo: "Melhorar desempenho",
        tipo: "Melhoria",
        prioridade: "Baixa",
        status: "Em revisão",
        prazo: "2026-10-18"
    },
    {
        id: 5,
        titulo: "Falha no cadastro",
        tipo: "Defeito",
        prioridade: "Crítica",
        status: "Em andamento",
        prazo: "2026-10-12"
    }
]

rotasDashboard.get("/dashboard", (req, res) => {

    const total = demandas.length

    const porStatus = {
        aberta: demandas.filter(d => d.status === "Aberta").length,
        emAndamento: demandas.filter(d => d.status === "Em andamento").length,
        emRevisao: demandas.filter(d => d.status === "Em revisão").length,
        concluida: demandas.filter(d => d.status === "Concluída").length,
        cancelada: demandas.filter(d => d.status === "Cancelada").length
    }

    const porPrioridade = {
        critica: demandas.filter(d => d.prioridade === "Crítica").length,
        alta: demandas.filter(d => d.prioridade === "Alta").length,
        media: demandas.filter(d => d.prioridade === "Média").length,
        baixa: demandas.filter(d => d.prioridade === "Baixa").length
    }

    const porTipo = {
        tarefa: demandas.filter(d => d.tipo === "Tarefa").length,
        defeito: demandas.filter(d => d.tipo === "Defeito").length,
        melhoria: demandas.filter(d => d.tipo === "Melhoria").length,
        documentacao: demandas.filter(d => d.tipo === "Documentação").length
    }

    // Consideramos "em aberto" tudo que ainda não foi concluído ou cancelado.
    const criticasEmAberto = demandas.filter(d =>
        d.prioridade === "Crítica" &&
        d.status !== "Concluída" &&
        d.status !== "Cancelada"
    )

    // Nesta versão, usamos a data atual e consideramos próximo do prazo
    // tudo que vence em até 7 dias.
    const hoje = new Date()
    const limite = new Date()
    limite.setDate(hoje.getDate() + 7)

    const proximasDoPrazo = demandas.filter(d => {
        const prazo = new Date(d.prazo)

        return prazo >= hoje &&
               prazo <= limite &&
               d.status !== "Concluída" &&
               d.status !== "Cancelada"
    })

    return res.status(200).json({
        total,
        porStatus,
        porPrioridade,
        porTipo,
        criticasEmAberto,
        proximasDoPrazo
    })

})