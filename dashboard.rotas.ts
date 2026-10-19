
import { Router, Request, Response } from "express";
import { demandas } from "./listagem.rotas";

export const rotasDashboard = Router();

//Jose Gabriel Bedani

rotasDashboard.get("/dashboard", (req: Request, res: Response) => {
    const parametroDias = req.query.dias;

    const dias =
        parametroDias === undefined
            ? 7
            : typeof parametroDias === "string"
                ? Number(parametroDias)
                : NaN;

    // Valida o parâmetro dias.
    if (!Number.isInteger(dias) || dias <= 0 || dias > 365) {
        return res.status(400).json({
            erro: "O parâmetro dias deve ser um número inteiro entre 1 e 365."
        });
    }

    // Conta as demandas por status.
    const porStatus = {
        aberta: demandas.filter(d => d.status === "Aberta").length,
        emAndamento: demandas.filter(d => d.status === "Em andamento").length,
        emRevisao: demandas.filter(d => d.status === "Em revisão").length,
        concluida: demandas.filter(d => d.status === "Concluída").length,
        cancelada: demandas.filter(d => d.status === "Cancelada").length
    };

    // Conta as demandas por prioridade.
    const porPrioridade = {
        critica: demandas.filter(d => d.prioridade === "Crítica").length,
        alta: demandas.filter(d => d.prioridade === "Alta").length,
        media: demandas.filter(d => d.prioridade === "Média").length,
        baixa: demandas.filter(d => d.prioridade === "Baixa").length
    };

    // Conta as demandas por tipo.
    const porTipo = {
        tarefa: demandas.filter(d => d.tipo === "Tarefa").length,
        defeito: demandas.filter(d => d.tipo === "Defeito").length,
        melhoria: demandas.filter(d => d.tipo === "Melhoria").length,
        documentacao: demandas.filter(d => d.tipo === "Documentação").length
    };

    // Seleciona demandas críticas ainda não encerradas.
    const criticasEmAberto = demandas.filter(d =>
        d.prioridade === "Crítica" &&
        d.status !== "Concluída" &&
        d.status !== "Cancelada"
    );

    // Calcula o período de consulta dos prazos.
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + dias);

    const proximasDoPrazo = demandas.filter(d => {
        if (!d.prazo || d.status === "Concluída" || d.status === "Cancelada") {
            return false;
        }

        const prazo = new Date(`${d.prazo}T00:00:00`);

        return (
            !Number.isNaN(prazo.getTime()) &&
            prazo >= hoje &&
            prazo <= limite
        );
    });

    // Retorna os indicadores do dashboard.
    return res.status(200).json({
        total: demandas.length,
        criterioProximasDoPrazo:
            `Demandas que vencem nos próximos ${dias} dias`,
        porStatus,
        porPrioridade,
        porTipo,
        criticasEmAberto,
        proximasDoPrazo
    });
});
