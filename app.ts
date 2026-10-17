import express, {Request, Response} from 'express'
import loginRotas from './login'
// Rotas da tela de Detalhes da Demanda - Gabriel Lopes Londe Rodrigues
// import { rotas as rotasDetalhes } from '/detalhes.demanda.rotas.js'


const app = express()

// Permite ler o JSON que as telas enviam nas requisicoes
app.use(express.json())

// Entrega os arquivos HTML, CSS e JS da pasta pages
app.use(express.static('pages'))

// Liga as rotas da tela de Detalhes da Demanda
// app.use(rotasDetalhes)

app.use(loginRotas)

app.get("/", (req: Request, res: Response) => {
    res.send("Inicio")
})

app.listen(3000, () => {
    console.log("Servidor aberto!")
})