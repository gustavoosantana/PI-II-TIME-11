import express, { Request, Response } from "express";
import { Router } from "express"
import { getConn } from "./db"
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
        return res.status(400).send("Os campos titulo, descricao, tipo, prioridade e id_projeto sao obrigatorios")
    }

    if (!["Tarefa", "Defeito", "Melhoria", "Documentação", "Documentacao"].includes(tipo)) {
        return res.status(400).send("Valor invalido para tipo")
    }
    if (!["Crítica", "Critica", "Alta", "Média", "Media", "Baixa"].includes(prioridade)) {
        return res.status(400).send("Valor invalido para prioridade")
    }

    let dataConvertida: Date | null = null;

    if (data_finalizacao) {
        dataConvertida = new Date(data_finalizacao);

        if (isNaN(dataConvertida.getTime())) {
            return res.status(400).send("A data nao e valida");
        }
    }

    let conn;
    try {
        conn = await getConn();

        // Confere no banco se o projeto existe
        const projeto = await conn.execute("SELECT id FROM projetos WHERE id = :id", { id: id_projeto });
        if (!projeto.rows || projeto.rows.length === 0) {
            return res.status(400).send("O projeto informado nao existe");
        }

        await conn.execute(
            "INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao) VALUES (:titulo, :descricao, :tipo, :prioridade, 'Aberta', :id_projeto, :id_responsavel, :prazo_finalizacao, SYSDATE, SYSDATE)",
            {
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                prioridade: prioridade,
                id_projeto: id_projeto,
                id_responsavel: id_responsavel ?? null,
                prazo_finalizacao: dataConvertida
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
