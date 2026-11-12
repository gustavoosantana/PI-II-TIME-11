// Autor: José Gabriel Bedani

import { Router, Request, Response } from "express"
// Conexão com o banco Oracle (feita pela equipe em db.ts)
import { getConn } from "./db"

export const rotasDashboard = Router()

// Formato de cada demanda que vem do banco
interface DemandaDashboard {
    id: number
    titulo: string
    tipo: string
    prioridade: string
    status: string
    responsavel: string
    prazo: string
}

// Tira acentos e deixa minúsculo. Assim "Crítica" e "Critica" contam como a mesma coisa
function simplificar(texto: string): string {
    return (texto || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
}

// Busca todas as demandas no banco
async function buscarDemandas(): Promise<DemandaDashboard[]> {
    let conn
    try {
        conn = await getConn()

        // Os apelidos entre aspas deixam os nomes das colunas iguais aos da interface acima
        const resultado = await conn.execute(
            `SELECT d.id AS "id",
                    d.titulo AS "titulo",
                    d.tipo AS "tipo",
                    d.prioridade AS "prioridade",
                    d.status AS "status",
                    u.nome AS "responsavel",
                    TO_CHAR(d.prazo_finalizacao, 'YYYY-MM-DD') AS "prazo"
             FROM demandas d
             LEFT JOIN usuarios u ON u.id = d.id_responsavel`
        )

        const linhas = (resultado.rows ?? []) as any[]

        // Campo vazio no banco (NULL) vira texto vazio, que é o que a tela espera
        return linhas.map((l) => ({
            id: l.id,
            titulo: l.titulo,
            tipo: l.tipo,
            prioridade: l.prioridade,
            status: l.status,
            responsavel: l.responsavel ?? "",
            prazo: l.prazo ?? ""
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
        return res.status(500).json({
            erro: "Não foi possível consultar as demandas no banco de dados."
        })
    }

    // Conta quantas demandas têm o valor pedido naquele campo
    function contar(campo: "status" | "prioridade" | "tipo", valor: string): number {
        return demandas.filter((d) => simplificar(d[campo]) === simplificar(valor)).length
    }

    const porStatus = {
        aberta: contar("status", "Aberta"),
        emAndamento: contar("status", "Em andamento"),
        emRevisao: contar("status", "Em revisão"),
        concluida: contar("status", "Concluída"),
        cancelada: contar("status", "Cancelada")
    }

    const porPrioridade = {
        critica: contar("prioridade", "Crítica"),
        alta: contar("prioridade", "Alta"),
        media: contar("prioridade", "Média"),
        baixa: contar("prioridade", "Baixa")
    }

    const porTipo = {
        tarefa: contar("tipo", "Tarefa"),
        defeito: contar("tipo", "Defeito"),
        melhoria: contar("tipo", "Melhoria"),
        documentacao: contar("tipo", "Documentação")
    }

    // "Em aberto" = ainda não concluída nem cancelada
    function estaEncerrada(d: DemandaDashboard): boolean {
        const status = simplificar(d.status)
        return status === "concluida" || status === "cancelada"
    }

    const criticasEmAberto = demandas.filter((d) =>
        simplificar(d.prioridade) === "critica" && !estaEncerrada(d)
    )

    // "Próximas do prazo" = não encerradas, com prazo entre hoje e hoje + dias
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const limite = new Date(hoje)
    limite.setDate(limite.getDate() + dias)

    const proximasDoPrazo = demandas
        .filter((d) => {
            if (!d.prazo || estaEncerrada(d)) {
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
