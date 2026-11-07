import oracledb from "oracledb";
import "dotenv/config";

const {
 ORACLE_HOST, ORACLE_PORT, ORACLE_SERVICE,
 ORACLE_USER, ORACLE_PASSWORD
} = process.env;

const connectString =
`${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function initPool() {
    await oracledb.createPool({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1
})};

export async function getConn() {
return oracledb.getPool().getConnection();
}

export async function closePool() {
    try {
        await oracledb.getPool().close(10);
    } 
    catch {
    }
}

// let conn;
// try {
//     conn = await getConn();
//     const result = await conn.execute(sql, binds);
//     return res.status(200).json(result.rows ?? []);
// } catch (erro) {
//     console.error(erro);
//     return res.status(500).json({mensagem: "Erro na consulta!"});
// } finally {
//     if (conn) await conn.close();
// }