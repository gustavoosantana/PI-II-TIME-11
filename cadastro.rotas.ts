import express, { Request, Response } from "express";
import { Router } from "express"
export const rotas = Router()

type Tipo = "Tarefa" | "Defeito" | "Melhoria" | "Documentacao";
type Prioridade = "Critica" | "Alta" | "Media" | "Baixa";

interface Demanda {
    titulo: string,
    descricao: string,
    tipo: Tipo,
    prioridade: string,
    projeto: string,
    data_finalizacao: Date | null
}

interface Projeto {
    nome: string
};

let projetos: Projeto[] = [{nome: projeto1},{nome: projeto2},{nome:projeto3}];


rotas.post("/demandas", (req: Request, res:Response) => {
    const { titulo, descricao, tipo, prioridade, projeto } = req.body;

    if (!titulo | !descricao | !tipo | !prioridade | !projeto) {
        return res.status(400).send("Os campos titulo, descricao, tipo, prioridade e projeto sao obrigatorios") 
    }

    if(data_finalizacao) {
        if(!data instanceof Date && !isNaN(data.getTime())) {
            return res.status(400).send("A data nao e valida");
        }
    }

    projetos.forEach(p => {
        if(projeto === p.nome) {
            const novaDemanda: Demanda {
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                prioridade: prioridade,
                projeto: projeto
            }
            return res.status(201).json(novaDemanda);
        }
    });

    return res.status(400).send("O projeto informado nao existe")

});

