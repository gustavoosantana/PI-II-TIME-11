import express, { Request, Response } from "express";
import { Router } from "express"
export const rotas = Router()

type Tipo = "Tarefa" | "Defeito" | "Melhoria" | "Documentacao";
type Prioridade = "Critica" | "Alta" | "Media" | "Baixa";

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


rotas.post("/demandas", (req: Request, res:Response) => {
    const { titulo, descricao, tipo, prioridade, projeto, data_finalizacao} = req.body;

    if (!titulo || !descricao || !tipo || !prioridade || !projeto) {
        return res.status(400).send("Os campos titulo, descricao, tipo, prioridade e projeto sao obrigatorios") 
    }

    if (tipo != "Tarefa" || "Defeito" || "Melhoria" || "Documentacao") {
        return res.status(400).send("Valor invalido para tipo")    
    }
    if(prioridade != "Critica" || "Alta" || "Media" || "Baixa") {
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

    return res.status(201).json(novaDemanda);
});


rotas.get("/projetos", (req: Request, res: Response) => {
    return res.status(201).json(projetos)
})