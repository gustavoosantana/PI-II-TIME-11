// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Regras de permissao por perfil, usadas pelas rotas que alteram demandas.
//
// Administrador:    pode tudo.
// Lider de Projeto: cadastra e altera demandas dos projetos que lidera.
// Membro da Equipe: altera so as demandas em que e o responsavel.
//                   Nao cadastra demandas.
// Todos veem as demandas e podem comentar.
//
// A tela envia o id de quem entrou pelo login (id_usuario). O perfil e
// sempre lido do banco, nunca do que a tela manda.

// Busca o usuario no banco. Devolve null se nao existir.
async function buscarUsuario(conn: any, idUsuario: unknown) {
    const id = Number(idUsuario)
    if (!Number.isInteger(id) || id <= 0) {
        return null
    }
    const r = await conn.execute(
        `SELECT id AS "id", nome AS "nome", perfil AS "perfil" FROM usuarios WHERE id = :id`,
        { id }
    )
    return r.rows?.[0] ?? null
}

// Pode alterar (editar ou mudar o status) esta demanda?
// Devolve null se pode, ou a mensagem explicando por que nao pode.
export async function motivoNaoPodeAlterar(conn: any, idUsuario: unknown, idDemanda: number) {
    const usuario = await buscarUsuario(conn, idUsuario)
    if (!usuario) {
        return "Entre no sistema pela tela de login."
    }
    if (usuario.perfil === "Administrador") {
        return null
    }

    const r = await conn.execute(
        `SELECT d.id_responsavel AS "responsavel", p.id_responsavel AS "lider"
         FROM demandas d JOIN projetos p ON p.id = d.id_projeto
         WHERE d.id = :id`,
        { id: idDemanda }
    )
    const demanda = r.rows?.[0]
    if (!demanda) {
        return null // a propria rota responde que a demanda nao existe
    }

    if (usuario.perfil === "Líder de Projeto" && demanda.lider === usuario.id) {
        return null
    }
    if (demanda.responsavel === usuario.id) {
        return null
    }

    return usuario.perfil === "Líder de Projeto"
        ? "Voce so pode alterar demandas dos projetos que lidera."
        : "Voce so pode alterar as demandas em que e o responsavel."
}

// Pode cadastrar demanda neste projeto?
// Devolve null se pode, ou a mensagem explicando por que nao pode.
export async function motivoNaoPodeCadastrar(conn: any, idUsuario: unknown, idProjeto: number) {
    const usuario = await buscarUsuario(conn, idUsuario)
    if (!usuario) {
        return "Entre no sistema pela tela de login."
    }
    if (usuario.perfil === "Administrador") {
        return null
    }
    if (usuario.perfil !== "Líder de Projeto") {
        return "Somente Administrador ou Lider de Projeto cadastra demandas."
    }

    const r = await conn.execute(
        `SELECT id_responsavel AS "lider" FROM projetos WHERE id = :id`,
        { id: idProjeto }
    )
    if (r.rows?.[0]?.lider !== usuario.id) {
        return "Voce so pode cadastrar demandas nos projetos que lidera."
    }
    return null
}
