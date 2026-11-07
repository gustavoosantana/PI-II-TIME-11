import express, { Request, Response } from "express";
import { Router } from "express"
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

let usuarios: Usuario[] = [{nome: "Pedrinho"}, {nome:"joazinho"}, {nome: "guzinho"}]
let projetos: Projeto[] = [{nome: "projeto1", responsavel: usuarios[0]},{nome: "projeto2", responsavel: usuarios[1]},
    {nome:"projeto3", responsavel: usuarios[2]}];


rotas.post("/demandas", async (req: Request, res:Response) => {
    const { titulo, descricao, tipo, prioridade, projeto, data_finalizacao} = req.body;

    if (!titulo || !descricao || !tipo || !prioridade || !projeto) {
        return res.status(400).send("Os campos titulo, descricao, tipo, prioridade e projeto sao obrigatorios") 
    }

    if (!["Tarefa", "Defeito", "Melhoria", "Documentacao"].includes(tipo)) {
        return res.status(400).send("Valor invalido para tipo")    
    }
    if (!["Critica", "Alta", "Media", "Baixa"].includes(prioridade)) {
        return res.status(400).send("Valor invalido para prioridade")   
    }

    let dataConvertida: Date | null = null;
    
    if (data_finalizacao) {
        dataConvertida = new Date(data_finalizacao);

        if (isNaN(dataConvertida.getTime())) {
            return res.status(400).send("A data nao e valida");
        }
    }
    const projetoExiste = projetos.find(p => p.nome === projeto.nome);

    if (!projetoExiste) {
        return res.status(400).send("O projeto informado nao existe");
    }

    const usuarioExiste = usuarios.find(u => u.nome === projetoExiste.responsavel.nome)

    if(!usuarioExiste) {
        return res.status(400).send("O responsavel informado nao existe")
    }


    const novaDemanda: Demanda = {
        titulo: titulo,
        descricao: descricao,
        tipo: tipo,
        prioridade: prioridade,
        projeto: projeto,
        data_criacao: new Date(),
        data_finalizacao: dataConvertida
    };
    let conn;
    try {
        conn = await getConn();
        const result = await conn.execute("INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao) VALUES (:titulo, :descricao, :tipo, :prioridade, 'Aberta', :id_projeto, :id_responsavel, :prazo_finalizacao, SYSDATE, SYSDATE)",
             {novaDemanda}, { autoCommit: true });
        return res.status(200).json(result.rows ?? []);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({mensagem: "Erro na consulta!"});
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


// let conn;
// try {
//     conn = await getConn();
//     const result = await conn.execute(sql, binds);
//     return res.status(200).json(result.rows ?? []);
// } catch (erro) {
//     console.error(erro);
//     return res.status(500).json({mensagem: "Erro na consulta!"});
// } finally {
//     if (conn) await conn.close();
// }

"INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao) VALUES (:titulo, :descricao, :tipo, :prioridade, 'Aberta', :id_projeto, :id_responsavel, :prazo_finalizacao, SYSDATE, SYSDATE)"