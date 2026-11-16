import express, { Request, Response } from "express";
import { Router } from "express"
import { getConn } from "./db"
import { motivoNaoPodeAlterar, motivoNaoPodeCadastrar } from "./permissoes"
export const rotas = Router()

type Tipo = "Tarefa" | "Defeito" | "Melhoria" | "Documentação";
type Prioridade = "Crítica" | "Alta" | "Média" | "Baixa";

interface Demanda {
    titulo: string,
    descricao: string,
    tipo: Tipo,
    prioridade: Prioridade,
    projeto: Projeto,
    data_criacao: Date | null;
    data_finalizacao: Date | null
}

interface Usuario {
    nome: string
};

interface Projeto {
    nome: string,
    responsavel: Usuario
};

rotas.post("/demandas", async (req: Request, res: Response) => {
    const { titulo, descricao, tipo, prioridade, id_projeto, id_responsavel, data_finalizacao } = req.body;

    if (!titulo || !descricao || !tipo || !prioridade || !id_projeto) {
        return res.status(400).json({ mensagem: "Os campos titulo, descricao, tipo, prioridade e id_projeto sao obrigatorios" })
    }

    if (!["Tarefa", "Defeito", "Melhoria", "Documentação", "Documentacao"].includes(tipo)) {
        return res.status(400).json({ mensagem: "Valor invalido para tipo" })
    }
    if (!["Crítica", "Critica", "Alta", "Média", "Media", "Baixa"].includes(prioridade)) {
        return res.status(400).json({ mensagem: "Valor invalido para prioridade" })
    }

    let dataConvertida: Date | null = null;

    if (data_finalizacao) {
        dataConvertida = new Date(data_finalizacao);

        if (isNaN(dataConvertida.getTime())) {
            return res.status(400).json({ mensagem: "A data nao e valida" });
        }
    }

    let conn;
    try {
        conn = await getConn();

        // Confere no banco se o projeto existe
        const projeto = await conn.execute("SELECT * FROM projetos WHERE id = :id", { id: id_projeto });
        if (!projeto.rows || projeto.rows.length === 0) {
            return res.status(400).json({ mensagem: "O projeto informado nao existe" });
        }

        // Permissao por perfil (permissoes.ts)
        const semPermissao = await motivoNaoPodeCadastrar(conn, req.body.id_usuario, Number(id_projeto));
        if (semPermissao) {
            return res.status(403).json({ mensagem: semPermissao });
        }

        if (id_responsavel !== undefined && id_responsavel !== null && id_responsavel !== "") {
            const usuarioExiste = projeto.rows.find((p: any) => Number(p.ID_RESPONSAVEL) === Number(id_responsavel));
            if (!usuarioExiste) {
                return res.status(400).json({ mensagem: "Usuario não está associado nesse projeto" });
            }
        }

        // A data vai como texto AAAA-MM-DD: um Date do JavaScript e meia-noite
        // em Londres, e no horario de Brasilia viraria o dia anterior
        await conn.execute(
            "INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao) VALUES (:titulo, :descricao, :tipo, :prioridade, 'Aberta', :id_projeto, :id_responsavel, TO_DATE(:prazo_finalizacao, 'YYYY-MM-DD'), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE))",
            {
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                prioridade: prioridade,
                id_projeto: id_projeto,
                id_responsavel: id_responsavel || null,
                prazo_finalizacao: dataConvertida ? String(data_finalizacao).slice(0, 10) : null
            },
            { autoCommit: true }
        );
        return res.status(201).json({ mensagem: "Demanda cadastrada!" });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro na consulta!" });
    } finally {
        if (conn) await conn.close();
    }
});

rotas.put("/demandas/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { titulo, descricao, tipo, prioridade, id_projeto, id_responsavel, data_finalizacao, status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ mensagem: "ID da demanda invalido" });
    }

    if (!titulo || !descricao || !tipo || !prioridade || !id_projeto) {
        return res.status(400).json({ mensagem: "Os campos titulo, descricao, tipo, prioridade e id_projeto sao obrigatorios" });
    }

    if (!["Tarefa", "Defeito", "Melhoria", "Documentação", "Documentacao"].includes(tipo)) {
        return res.status(400).json({ mensagem: "Valor invalido para tipo" });
    }
    if (!["Crítica", "Critica", "Alta", "Média", "Media", "Baixa"].includes(prioridade)) {
        return res.status(400).json({ mensagem: "Valor invalido para prioridade" });
    }
    if (status !== undefined && !["Aberta", "Em andamento", "Em revisão", "Em revisao", "Concluída", "Concluida", "Cancelada"].includes(status)) {
        return res.status(400).json({ mensagem: "Valor invalido para status" });
    }

    let dataConvertida: Date | null = null;

    if (data_finalizacao) {
        dataConvertida = new Date(data_finalizacao);

        if (isNaN(dataConvertida.getTime())) {
            return res.status(400).json({ mensagem: "A data nao e valida" });
        }
    }

    let conn;
    try {
        conn = await getConn();

        // Permissao por perfil (permissoes.ts)
        const semPermissao = await motivoNaoPodeAlterar(conn, req.body.id_usuario, id);
        if (semPermissao) {
            return res.status(403).json({ mensagem: semPermissao });
        }

        const projeto = await conn.execute("SELECT id, id_responsavel FROM projetos WHERE id = :id", { id: id_projeto });
        if (!projeto.rows || projeto.rows.length === 0) {
            return res.status(400).json({ mensagem: "O projeto informado nao existe" });
        }

        // Responsavel e opcional: so valida o vinculo quando ele for informado (mesma regra do POST)
        const responsavelInformado = id_responsavel !== undefined && id_responsavel !== null && id_responsavel !== "";
        if (responsavelInformado) {
            const usuarioExiste = projeto.rows.find((p: any) => Number(p.ID_RESPONSAVEL) === Number(id_responsavel));
            if (!usuarioExiste) {
                return res.status(400).json({ mensagem: "Usuario não está associado nesse projeto" });
            }
        }

        const result = await conn.execute(
            "UPDATE demandas SET titulo = :titulo, descricao = :descricao, tipo = :tipo, prioridade = :prioridade, status = COALESCE(:status, status), id_projeto = :id_projeto, id_responsavel = COALESCE(CAST(:id_responsavel AS NUMBER), id_responsavel), prazo_finalizacao = COALESCE(TO_DATE(:prazo_finalizacao, 'YYYY-MM-DD'), prazo_finalizacao), data_atualizacao = CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) WHERE id = :id",
            {
                id,
                titulo,
                descricao,
                tipo,
                prioridade,
                status: status ?? null,
                id_projeto,
                id_responsavel: responsavelInformado ? id_responsavel : null,
                // texto AAAA-MM-DD para o prazo nao voltar um dia no horario de Brasilia
                prazo_finalizacao: dataConvertida ? String(data_finalizacao).slice(0, 10) : null
            },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ mensagem: "Demanda nao encontrada" });
        }

        return res.status(200).json({ mensagem: "Demanda atualizada!" });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro na consulta!" });
    } finally {
        if (conn) await conn.close();
    }
});


rotas.get("/projetos", async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await getConn();
        const result = await conn.execute('SELECT id AS "id", nome AS "nome", descricao AS "descricao", data_inicio AS "data_inicio", data_fim AS "data_fim", situacao AS "situacao" FROM projetos');
        return res.status(200).json(result.rows ?? []);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({mensagem: "Erro na consulta!"});
    } finally {
        if (conn) await conn.close();
    }
});
