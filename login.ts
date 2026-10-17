import express, {Request, Response} from 'express'
const app = express()
app.use(express.json())

let usuarios: Usuario[] = [
    {
    id: 1,
    email: "homemdeferrodestruidor@gmail.com",
    senha: "123",
    perfil: "Administrador"
    },
    {
    id: 2,
    email: "teste2@gmail.com",
    senha: "456",
    perfil: "Lider de Projeto"
    },
    {
    id: 3,
    email: "teste3@gmail.com",
    senha: "789",
    perfil: "Membro da equipe"
    }
]

let proximoid = 2

app.get('/usuarios',( req: Request, res: Response) => {
    const usuarioSemSenha = usuarios.map(({senha, ...resto}) => resto) 
    return res.status(200).json(usuarioSemSenha)
})


interface Usuario {
    id: number;
    email: string;
    senha: string;
    perfil: string;
}


app.post('/login', (req: Request, res: Response) => {
    const {email, senha} = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "Email e senha são obrigatórios"
        })
    }

    const usuarioEncontrado = usuarios.find(
        (user) => user.email === email && user.senha === senha 
    )

    if (!usuarioEncontrado) {
        return res.status(401).json({mensagem: "Usuario não encontrado"})
    }

    const { senha: _, ...usuarioSemSenha } = usuarioEncontrado
    return res.status(200).json(usuarioSemSenha)
})

export default app;