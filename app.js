import express from 'express'

// Rotas da tela de Detalhes da Demanda - Gabriel Lopes Londe Rodrigues
import { rotas as rotasDetalhes } from './detalhes.demanda.rotas.js'

// Importa as rotas responsáveis pelo Dashboard
import { rotasDashboard } from "./dashboard.rotas.js"


const app = express()

// Permite ler o JSON que as telas enviam nas requisicoes
app.use(express.json())

// Entrega os arquivos HTML, CSS e JS da pasta pages
app.use(express.static('pages'))

// Liga as rotas da tela de Detalhes da Demanda
app.use(rotasDetalhes)

// Adiciona as rotas do Dashboard ao servidor
app.use(rotasDashboard)

app.listen(3000, () => {
    console.log("Servidor aberto!")
})


app.get("/", (req, res) => {
    res.send("Inicio")
})


