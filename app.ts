import express, {Request, Response} from 'express'
import loginRotas from './login'
import { rotas } from './cadastro.rotas'
// Rotas da tela de Detalhes da Demanda - Gabriel Lopes Londe Rodrigues
import { rotas as rotasDetalhes } from './detalhes.demanda.rotas'

import rotasListagem from './listagem.rotas'
// Rota GET /dashboard - José Gabriel Bedani
import { rotasDashboard } from './dashboard.rotas'
import "dotenv/config";
import { initPool, getConn, closePool } from "./db";

const PORT = Number(process.env.PORT ?? 3000);


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
app.use(rotasDashboard)

app.get("/", (req: Request, res: Response) => {
    res.send("Inicio")
})

// app.listen(3000, () => {
//     console.log("Servidor aberto!")
// })
async function encerrarServidor() {
    try {
        await closePool();
        console.log("Pool de conexões encerrado.");
        process.exit(0);
    } catch (erro) {
        console.error("Falha ao encerrar o pool:", erro);
        process.exit(1);
    }
}
async function iniciarServidor() {
    try {
        await initPool();
        app.listen(PORT, () => {
        console.log(`Servidor ativo na porta ${PORT}`);
    });
    process.on("SIGINT", encerrarServidor);
    process.on("SIGTERM", encerrarServidor);
    } catch (erro) {
        console.error("Falha ao iniciar o servidor:", erro);
        process.exit(1);
    }
}

