// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Rotas da tela de Detalhes da Demanda

import { Router, Request, Response } from "express"
import { getConn } from "./db"

// Um Router agrupa rotas. Ele fica neste arquivo separado para as minhas
// rotas nao precisarem ser escritas dentro do app.ts, que e da equipe.
export const rotas = Router()

// Quem fez a acao: a tela envia o id do usuario que entrou pelo login.
// Sem ele, fica o usuario 1.
function lerUsuario(req: Request) {
    const usuario = Number(req.body.id_usuario)
    return Number.isInteger(usuario) && usuario > 0 ? usuario : 1
}

// Ordem do ciclo de vida, definida no Documento de Visao. A demanda nao
// pula etapas: para ser concluida precisa passar por Em revisão.
const ordem = ["Aberta", "Em andamento", "Em revisão", "Concluída"]
const todos = [...ordem, "Cancelada"]

// Tira os acentos, para comparar "Em revisao" com "Em revisão"
function semAcento(texto: string) {
    return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "")
}

// Devolve o status escrito do jeito que fica no banco (com acento),
// aceitando o nome com ou sem acento. Devolve "" se nao existir.
function statusOficial(texto: string) {
    return todos.find((s) => semAcento(s) === semAcento(texto)) ?? ""
}

// Para quais status a demanda pode ir a partir do status atual
function proximosStatus(atual: string) {
    const status = statusOficial(atual)

    // Demanda encerrada nao muda mais de status
    if (status === "Concluída" || status === "Cancelada" || status === "") {
        return []
    }

    return [ordem[ordem.indexOf(status) + 1], "Cancelada"]
}

// Busca a demanda completa no banco: dados, comentarios e historico.
// Devolve null se o numero nao existir.
async function buscarDemanda(conn: any, id: number) {
    const dados = await conn.execute(
        `SELECT d.id AS "id",
                d.titulo AS "titulo",
                d.descricao AS "descricao",
                d.tipo AS "tipo",
                d.prioridade AS "prioridade",
                d.status AS "status",
                p.nome AS "projeto",
                u.nome AS "responsavel",
                TO_CHAR(d.data_criacao, 'DD/MM/YYYY "as" HH24:MI') AS "criacao",
                TO_CHAR(d.prazo_finalizacao, 'YYYY-MM-DD') AS "prazo"
         FROM demandas d
         JOIN projetos p ON p.id = d.id_projeto
         LEFT JOIN usuarios u ON u.id = d.id_responsavel
         WHERE d.id = :id`,
        { id }
    )

    const demanda = dados.rows?.[0]
    if (!demanda) {
        return null
    }

    const comentarios = await conn.execute(
        `SELECT NVL(u.nome, 'Sem autor') AS "autor",
                TO_CHAR(c.data_registro, 'DD/MM/YYYY "as" HH24:MI') AS "data",
                c.texto AS "texto"
         FROM comentarios c
         LEFT JOIN usuarios u ON u.id = c.id_usuario
         WHERE c.id_demanda = :id
         ORDER BY c.id`,
        { id }
    )

    // O historico vem do mais novo para o mais antigo. A criacao da
    // demanda entra no fim, como primeiro acontecimento.
    const historico = await conn.execute(
        `SELECT h.descricao AS "texto",
                NVL(u.nome, 'Sem autor') AS "autor",
                TO_CHAR(h.data_registro, 'DD/MM/YYYY "as" HH24:MI') AS "data"
         FROM historico h
         LEFT JOIN usuarios u ON u.id = h.id_usuario
         WHERE h.id_demanda = :id
         ORDER BY h.id DESC`,
        { id }
    )

    demanda.responsavel = demanda.responsavel ?? ""
    demanda.prazo = demanda.prazo ?? ""
    demanda.comentarios = comentarios.rows ?? []
    demanda.historico = [
        ...(historico.rows ?? []),
        { texto: "Demanda cadastrada no sistema", autor: "Sistema", data: demanda.criacao }
    ]

    return { demanda, proximos: proximosStatus(demanda.status) }
}

// Le o numero da URL. Devolve null se nao for um numero valido.
function lerId(req: Request) {
    const id = Number(req.params.id)
    return Number.isInteger(id) && id > 0 ? id : null
}

/* ---------------------------------------------------------------------
   LIGACAO ENTRE A LISTAGEM E ESTA TELA

   Versoes antigas da listagem apontavam para produtodetalhes.html, um
   arquivo que nunca existiu. O endereco continua atendido aqui e manda
   para a tela de Detalhes.
   --------------------------------------------------------------------- */
rotas.get("/produtodetalhes.html", (req: Request, res: Response) => {
    res.redirect("/detalhes.demanda.html")
})

// Envia uma demanda para a tela de Detalhes
rotas.get("/api/demanda/:id", async (req: Request, res: Response) => {
    const id = lerId(req)
    if (id === null) {
        return res.status(400).json({ erro: "Numero de demanda invalido." })
    }

    let conn
    try {
        conn = await getConn()
        const resultado = await buscarDemanda(conn, id)

        if (!resultado) {
            return res.status(404).json({ erro: "Demanda nao encontrada." })
        }

        res.json(resultado)
    } catch (erro) {
        console.error(erro)
        res.status(500).json({ erro: "Erro ao buscar a demanda no banco de dados." })
    } finally {
        if (conn) await conn.close()
    }
})

// Registra um comentario
rotas.post("/api/demanda/:id/comentarios", async (req: Request, res: Response) => {
    const id = lerId(req)
    const texto = String(req.body.texto ?? "").trim()

    if (id === null) {
        return res.status(400).json({ erro: "Numero de demanda invalido." })
    }

    if (texto === "") {
        return res.status(400).json({ erro: "Escreva o comentario antes de enviar." })
    }

    if (texto.length > 500) {
        return res.status(400).json({ erro: "O comentario pode ter no maximo 500 caracteres." })
    }

    let conn
    try {
        conn = await getConn()

        if (!(await buscarDemanda(conn, id))) {
            return res.status(404).json({ erro: "Demanda nao encontrada." })
        }

        await conn.execute(
            "INSERT INTO comentarios (id_demanda, id_usuario, texto, data_registro) VALUES (:id, :usuario, :texto, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE))",
            { id, usuario: lerUsuario(req), texto },
            { autoCommit: true }
        )

        res.json(await buscarDemanda(conn, id))
    } catch (erro) {
        console.error(erro)
        res.status(500).json({ erro: "Erro ao salvar o comentario." })
    } finally {
        if (conn) await conn.close()
    }
})

// Muda o status da demanda e registra a mudanca no historico
rotas.patch("/api/demanda/:id/status", async (req: Request, res: Response) => {
    const id = lerId(req)
    const novo = statusOficial(req.body.status ?? "")

    if (id === null) {
        return res.status(400).json({ erro: "Numero de demanda invalido." })
    }

    let conn
    try {
        conn = await getConn()
        const atual = await buscarDemanda(conn, id)

        if (!atual) {
            return res.status(404).json({ erro: "Demanda nao encontrada." })
        }

        // A tela ja mostra so os botoes permitidos, mas a conferencia e feita
        // aqui tambem: quem chamar a rota por fora do navegador fica barrado
        if (!atual.proximos.includes(novo)) {
            return res.status(400).json({ erro: "Esta demanda nao pode passar para " + (req.body.status ?? "") + "." })
        }

        await conn.execute(
            "UPDATE demandas SET status = :novo, data_atualizacao = CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) WHERE id = :id",
            { novo, id }
        )
        await conn.execute(
            "INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (:id, :usuario, 'Status alterado de ' || :anterior || ' para ' || :novo, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE))",
            { id, usuario: lerUsuario(req), anterior: statusOficial(atual.demanda.status), novo }
        )
        await conn.commit()

        res.json(await buscarDemanda(conn, id))
    } catch (erro) {
        console.error(erro)
        if (conn) await conn.rollback()
        res.status(500).json({ erro: "Erro ao mudar o status." })
    } finally {
        if (conn) await conn.close()
    }
})
