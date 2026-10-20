import express, {Request, Response} from 'express'
import loginRotas from './login'
import { rotas } from './cadastro.rotas'
// Rotas da tela de Detalhes da Demanda - Gabriel Lopes Londe Rodrigues
import { rotas as rotasDetalhes } from './detalhes.demanda.rotas'

import rotasListagem from './listagem.rotas'

const app = express()

// Permite ler o JSON que as telas enviam nas requisicoes
app.use(express.json())

// Entrega os arquivos HTML, CSS e JS da pasta pages
app.use(express.static('pages'))

// Liga as rotas da tela de Detalhes da Demanda
// app.use(rotasDetalhes)

app.use(loginRotas)
app.use(rotas)
app.use(rotasListagem)
app.use(rotasDetalhes)

app.get("/", (req: Request, res: Response) => {
    res.send("Inicio")
})

app.listen(3000, () => {
    console.log("Servidor aberto!")
})
