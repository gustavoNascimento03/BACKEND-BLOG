const express = require("express");
const cors = require("cors"); // Para permitir que o Frontend/Mobile acesse o Back
const routes = require("./routes/routes");

const app = express();

// Middlewares Globais
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições
app.use(cors()); // Libera acesso de outras origens

// Rotas da Aplicação
app.use("/", routes);

app.get("/", (req, res) => {
    res.send("API Tech Challenge Fase 4 rodando!");
});

module.exports = app;
