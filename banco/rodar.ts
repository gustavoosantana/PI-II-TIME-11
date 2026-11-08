// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Roda o banco/criar_banco.sql no Oracle configurado no .env
//
// Uso: npm run banco   (precisa estar conectado na VPN da PUC)

import { readFileSync } from "fs"
import { join } from "path"
import oracledb from "oracledb"
import "dotenv/config"

const { ORACLE_HOST, ORACLE_PORT, ORACLE_SERVICE, ORACLE_USER, ORACLE_PASSWORD } = process.env

// Separa o arquivo em comandos. Cada comando termina numa linha com "/".
// Comentarios "--" no comeco de um comando sao descartados.
function separarComandos(texto: string): string[] {
    const comandos: string[] = []
    let atual: string[] = []

    for (const linha of texto.split(/\r?\n/)) {
        if (linha.trim() === "/") {
            const comando = atual.join("\n").trim()
            if (comando !== "") {
                comandos.push(comando)
            }
            atual = []
        } else if (atual.length > 0 || (linha.trim() !== "" && !linha.trim().startsWith("--"))) {
            atual.push(linha)
        }
    }

    return comandos
}

async function main() {
    if (!ORACLE_USER || ORACLE_USER === "SEU_USUARIO" || !ORACLE_PASSWORD) {
        console.error("Preencha ORACLE_USER e ORACLE_PASSWORD no arquivo .env antes de rodar.")
        process.exit(1)
    }

    const comandos = separarComandos(readFileSync(join(process.cwd(), "banco", "criar_banco.sql"), "utf8"))

    const conn = await oracledb.getConnection({
        user: ORACLE_USER.trim(),
        password: ORACLE_PASSWORD.trim(),
        connectString: `${ORACLE_HOST?.trim()}:${ORACLE_PORT?.trim()}/${ORACLE_SERVICE?.trim()}`
    })

    try {
        for (const [i, comando] of comandos.entries()) {
            try {
                await conn.execute(comando)
            } catch (erro) {
                console.error(`Falha no comando ${i + 1}:\n${comando}\n`)
                throw erro
            }
        }
        await conn.commit()

        // Conferencia: quantas linhas ficaram em cada tabela
        for (const tabela of ["usuarios", "projetos", "demandas", "comentarios", "historico_status"]) {
            const r = await conn.execute<[number]>(`SELECT COUNT(*) FROM ${tabela}`, [], { outFormat: oracledb.OUT_FORMAT_ARRAY })
            console.log(`${tabela}: ${r.rows?.[0]?.[0]} linhas`)
        }
        console.log(`Banco criado. ${comandos.length} comandos executados.`)
    } finally {
        await conn.close()
    }
}

main().catch((erro) => {
    console.error(erro.message ?? erro)
    process.exit(1)
})
