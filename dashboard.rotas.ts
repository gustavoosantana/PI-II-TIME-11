// Autor: José Gabriel Bedani
// Rota GET /dashboard: busca as demandas no banco Oracle e devolve os números
// que a tela do dashboard (pages/dashboard.js) mostra.

import { Router, Request, Response } from "express"
// getConn pega uma conexão com o banco Oracle (arquivo db.ts, feito pela equipe)
import { getConn } from "./db"

export const rotasDashboard = Router()

// Formato de cada demanda depois de sair do banco
interface Demanda {
    id: number
    titulo: string
    tipo: string
    prioridade: string
    status: string
    responsavel: string   // nome do responsável ("" quando não tem)
    prazo: string         // no formato "2026-11-20" ("" quando não tem)
}


// ---------------------------------------------------------------
// FUNÇÕES DE APOIO
// ---------------------------------------------------------------

// Tabela de troca: cada letra com acento e a letra sem acento correspondente
const letrasSemAcento: { [letra: string]: string } = {
    "á": "a", "à": "a", "â": "a", "ã": "a",
    "é": "e", "ê": "e",
    "í": "i",
    "ó": "o", "ô": "o", "õ": "o",
    "ú": "u",
    "ç": "c"
}

// Tira os acentos e deixa tudo em minúsculo, passando letra por letra.
// Serve para "Crítica", "Critica" e "CRÍTICA" serem tratadas como a mesma coisa.
function semAcento(texto: string): string {
    const minusculo = texto.toLowerCase()
    let resultado = ""

    for (const letra of minusculo) {
        if (letra in letrasSemAcento) {
            resultado = resultado + letrasSemAcento[letra]   // troca pela letra sem acento
        } else {
            resultado = resultado + letra                    // mantém como está
        }
    }

    return resultado
}

// Compara dois textos ignorando acentos e maiúsculas
function mesmoTexto(a: string, b: string): boolean {
    return semAcento(a) === semAcento(b)
}

// Transforma uma data em texto no formato "2026-11-20"
// (o mesmo formato em que o prazo vem do banco, para dar para comparar)
function dataParaTexto(data: Date): string {
    const ano = data.getFullYear()
    let mes = String(data.getMonth() + 1)   // getMonth() vai de 0 a 11, por isso o + 1
    let dia = String(data.getDate())

    // Mês e dia precisam ter dois dígitos: "05" e não "5"
    if (mes.length === 1) {
        mes = "0" + mes
    }
    if (dia.length === 1) {
        dia = "0" + dia
    }

    return ano + "-" + mes + "-" + dia
}

// Uma demanda está encerrada quando foi concluída ou cancelada
function estaEncerrada(demanda: Demanda): boolean {
    return mesmoTexto(demanda.status, "Concluída") || mesmoTexto(demanda.status, "Cancelada")
}

// Conta quantas demandas da lista têm o status informado
function contarPorStatus(demandas: Demanda[], status: string): number {
    let quantidade = 0
    for (const demanda of demandas) {
        if (mesmoTexto(demanda.status, status)) {
            quantidade = quantidade + 1
        }
    }
    return quantidade
}

// Conta quantas demandas da lista têm a prioridade informada
function contarPorPrioridade(demandas: Demanda[], prioridade: string): number {
    let quantidade = 0
    for (const demanda of demandas) {
        if (mesmoTexto(demanda.prioridade, prioridade)) {
            quantidade = quantidade + 1
        }
    }
    return quantidade
}

// Conta quantas demandas da lista têm o tipo informado
function contarPorTipo(demandas: Demanda[], tipo: string): number {
    let quantidade = 0
    for (const demanda of demandas) {
        if (mesmoTexto(demanda.tipo, tipo)) {
            quantidade = quantidade + 1
        }
    }
    return quantidade
}


// ---------------------------------------------------------------
// BUSCA NO BANCO
// ---------------------------------------------------------------

// Busca todas as demandas no banco Oracle e devolve uma lista no formato Demanda
async function buscarDemandas(): Promise<Demanda[]> {
    const conexao = await getConn()

    try {
        // Os nomes entre aspas (AS "titulo") fazem o Oracle devolver as colunas
        // com esses nomes exatos, em minúsculo, iguais aos da interface Demanda.
        // LEFT JOIN usuarios: traz o nome do responsável; se não tiver, vem vazio.
        // TO_CHAR transforma a data do prazo no texto "2026-11-20".
        const resultado = await conexao.execute(
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

        const linhas = resultado.rows as any[]
        const demandas: Demanda[] = []

        // Monta a lista. Campo vazio no banco (null) vira texto vazio "",
        // que é o que a tela espera.
        for (const linha of linhas) {
            const demanda: Demanda = {
                id: linha.id,
                titulo: linha.titulo,
                tipo: linha.tipo,
                prioridade: linha.prioridade,
                status: linha.status,
                responsavel: linha.responsavel || "",
                prazo: linha.prazo || ""
            }
            demandas.push(demanda)
        }

        return demandas
    } finally {
        // O finally roda sempre, com ou sem erro: devolve a conexão para o pool
        await conexao.close()
    }
}


// ---------------------------------------------------------------
// ROTA GET /dashboard
// ---------------------------------------------------------------

// Devolve os indicadores do dashboard.
// Aceita ?dias=N para mudar o período de "próximas do prazo" (padrão: 7 dias).
rotasDashboard.get("/dashboard", async (req: Request, res: Response) => {

    // 1. Lê e valida o parâmetro "dias" da URL
    let dias = 7

    if (req.query.dias !== undefined) {
        const textoDias = String(req.query.dias).trim()

        if (textoDias === "") {
            dias = NaN   // veio vazio (?dias=), vai cair na validação abaixo
        } else {
            dias = Number(textoDias)
        }
    }

    // Só aceita número inteiro de 1 a 365. Se não for, devolve erro 400.
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
        return res.status(400).json({
            erro: "O parâmetro dias deve ser um número inteiro entre 1 e 365."
        })
    }

    // 2. Busca as demandas no banco. Se o banco falhar, devolve erro 500.
    let demandas: Demanda[]

    try {
        demandas = await buscarDemandas()
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({
            erro: "Não foi possível consultar as demandas no banco de dados."
        })
    }

    // 3. Quantidade por status
    const porStatus = {
        aberta: contarPorStatus(demandas, "Aberta"),
        emAndamento: contarPorStatus(demandas, "Em andamento"),
        emRevisao: contarPorStatus(demandas, "Em revisão"),
        concluida: contarPorStatus(demandas, "Concluída"),
        cancelada: contarPorStatus(demandas, "Cancelada")
    }

    // 4. Quantidade por prioridade
    const porPrioridade = {
        critica: contarPorPrioridade(demandas, "Crítica"),
        alta: contarPorPrioridade(demandas, "Alta"),
        media: contarPorPrioridade(demandas, "Média"),
        baixa: contarPorPrioridade(demandas, "Baixa")
    }

    // 5. Quantidade por tipo
    const porTipo = {
        tarefa: contarPorTipo(demandas, "Tarefa"),
        defeito: contarPorTipo(demandas, "Defeito"),
        melhoria: contarPorTipo(demandas, "Melhoria"),
        documentacao: contarPorTipo(demandas, "Documentação")
    }

    // 6. Demandas críticas em aberto (prioridade Crítica e ainda não encerradas)
    const criticasEmAberto: Demanda[] = []

    for (const demanda of demandas) {
        if (mesmoTexto(demanda.prioridade, "Crítica") && !estaEncerrada(demanda)) {
            criticasEmAberto.push(demanda)
        }
    }

    // 7. Demandas próximas do prazo: não encerradas, com prazo entre hoje e hoje + dias.
    // Como as datas estão no formato "2026-11-20", dá para compará-las como texto.
    const hoje = new Date()
    const limite = new Date()
    limite.setDate(hoje.getDate() + dias)

    const textoHoje = dataParaTexto(hoje)
    const textoLimite = dataParaTexto(limite)

    const proximasDoPrazo: Demanda[] = []

    for (const demanda of demandas) {
        if (demanda.prazo === "" || estaEncerrada(demanda)) {
            continue   // sem prazo ou já encerrada: pula
        }

        if (demanda.prazo >= textoHoje && demanda.prazo <= textoLimite) {
            proximasDoPrazo.push(demanda)
        }
    }

    // Ordena da data mais próxima para a mais distante
    proximasDoPrazo.sort(function (a, b) {
        if (a.prazo < b.prazo) {
            return -1
        }
        if (a.prazo > b.prazo) {
            return 1
        }
        return 0
    })

    // 8. Devolve tudo em JSON para a tela
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
