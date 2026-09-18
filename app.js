import express from 'express'


const app = express()

app.listen(3000, () => {
    console.log("Servidor aberto!")
})


app.get("/", (req, res) => {
    res.send("Inicio")
})