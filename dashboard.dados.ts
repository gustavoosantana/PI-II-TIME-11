// Autor: José Gabriel Bedani
// Dados de teste usados só pelo Dashboard (ficam em memória).
// Quando o banco Oracle estiver pronto, este arquivo deixa de ser usado:
// a rota vai buscar as demandas no banco.

// Formato de cada demanda
export interface DemandaDashboard {
    id: number
    titulo: string
    tipo: string
    prioridade: string
    status: string
    responsavel: string
    prazo: string
}

// Demandas de teste (as mesmas 12 usadas na listagem, para os números baterem)
export const demandas: DemandaDashboard[] = [
    { id: 1, titulo: "Exemplo 1", tipo: "Defeito", prioridade: "Crítica", status: "Aberta", responsavel: "Responsável 1", prazo: "2026-10-20" },
    { id: 2, titulo: "Exemplo 2", tipo: "Tarefa", prioridade: "Alta", status: "Em andamento", responsavel: "Responsável 2", prazo: "2026-10-30" },
    { id: 3, titulo: "Exemplo 3", tipo: "Documentação", prioridade: "Baixa", status: "Aberta", responsavel: "", prazo: "" },
    { id: 4, titulo: "Exemplo 4", tipo: "Melhoria", prioridade: "Média", status: "Em revisão", responsavel: "Responsável 3", prazo: "2026-10-22" },
    { id: 5, titulo: "Exemplo 5", tipo: "Defeito", prioridade: "Crítica", status: "Em andamento", responsavel: "Responsável 2", prazo: "2026-10-19" },
    { id: 6, titulo: "Exemplo 6", tipo: "Melhoria", prioridade: "Baixa", status: "Concluída", responsavel: "Responsável 1", prazo: "2026-09-30" },
    { id: 7, titulo: "Exemplo 7", tipo: "Tarefa", prioridade: "Média", status: "Aberta", responsavel: "Responsável 3", prazo: "2026-11-15" },
    { id: 8, titulo: "Exemplo 8", tipo: "Documentação", prioridade: "Média", status: "Cancelada", responsavel: "", prazo: "" },
    { id: 9, titulo: "Exemplo 9", tipo: "Defeito", prioridade: "Alta", status: "Aberta", responsavel: "Responsável 1", prazo: "2026-10-25" },
    { id: 10, titulo: "Exemplo 10", tipo: "Tarefa", prioridade: "Baixa", status: "Em revisão", responsavel: "Responsável 3", prazo: "2026-11-05" },
    { id: 11, titulo: "Exemplo 11", tipo: "Melhoria", prioridade: "Alta", status: "Aberta", responsavel: "", prazo: "2026-11-20" },
    { id: 12, titulo: "Exemplo 12", tipo: "Defeito", prioridade: "Média", status: "Concluída", responsavel: "Responsável 2", prazo: "2026-10-15" }
]
