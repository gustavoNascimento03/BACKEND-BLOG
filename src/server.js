require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Conecta ao Banco de Dados e depois inicia o servidor
const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Falha ao iniciar o servidor:', error);
    }
};

startServer();