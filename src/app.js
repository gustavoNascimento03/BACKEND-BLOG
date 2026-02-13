require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");

const app = express();

// Middlewares Globais
app.use(express.json());
app.use(cors());

// Rotas da Aplicação
app.use("/", routes);

app.get("/", (req, res) => {
    res.send("API Tech Challenge Fase 4 rodando!");
});

module.exports = app;