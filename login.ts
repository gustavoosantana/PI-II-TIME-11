import { Request, Response, Router } from 'express'
import { getConn } from './db'

const loginRotas = Router()

// Lista os usuarios cadastrados no banco (sem a senha)
loginRotas.get('/usuarios', async (_req: Request, res: Response) => {
    let conn
    try {
        conn = await getConn()
        const result = await conn.execute(
            `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil" FROM usuarios ORDER BY id`
        )
        return res.status(200).json(result.rows ?? [])
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao buscar os usuarios no banco de dados" })
    } finally {
        if (conn) await conn.close()
    }
})

// Confere e-mail e senha na tabela usuarios
loginRotas.post('/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "Email e senha são obrigatórios"
        })
    }

    let conn
    try {
        conn = await getConn()
        const result = await conn.execute(
            `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil"
             FROM usuarios WHERE LOWER(email) = LOWER(:email) AND senha = :senha`,
            { email: String(email).trim(), senha: String(senha) }
        )
        const usuarioEncontrado = result.rows?.[0]

        if (!usuarioEncontrado) {
            return res.status(401).json({ mensagem: "Email ou senha incorretos" })
        }

        return res.status(200).json(usuarioEncontrado)
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao consultar o banco de dados" })
    } finally {
        if (conn) await conn.close()
    }
})

export { loginRotas }
export default loginRotas;
