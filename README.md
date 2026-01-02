# Tech Challenge - Fase 4 (Backend)

Este repositório contém o Back-end da aplicação de Blogging, desenvolvido em Node.js, para suportar o aplicativo Mobile da Fase 4.

## 🚀 Tecnologias

-   **Node.js & Express**: API REST.
-   **MongoDB & Mongoose**: Banco de dados NoSQL.
-   **Docker & Docker Compose**: Containerização.
-   **Jest & Supertest**: Testes automatizados (Cobertura > 80%).
-   **JWT**: Autenticação e Segurança.

## ⚙️ Como rodar o projeto

### Pré-requisitos

-   Docker e Docker Compose instalados.

### Passo a Passo

1. Clone o repositório.
2. Crie um arquivo `.env` na raiz com o seguinte conteúdo:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/tech_challenge_blog
    JWT_SECRET=sua_chave_secreta_aqui
    ```
3. Execute o comando para subir o ambiente:

```env
docker-compose up --build
```

4.A API estará disponível em http://localhost:3000.

## 🧪 Como rodar os testes

Para executar os testes unitários e de integração:

```env
npm test
```

## 📝 Endpoints Principais

Autenticação

-   POST /register: Cria novo usuário (Professor ou Aluno).
-   POST /login: Retorna o Token JWT.

Posts

-   GET /posts: Lista todos os posts (Busca via ?search=termo).
-   GET /posts/:id: Detalhes de um post.
-   POST /posts: Cria post (Apenas Professores).
-   PUT /posts/:id: Edita post (Apenas Professores).
-   DELETE /posts/:id: Remove post (Apenas Professores).

---

### Teste Manual Final (Sanity Check)

Seus testes automatizados garantem que a lógica funciona, mas é vital ver o servidor rodando "de verdade" via Docker.

1.  No terminal, digite:
    ```bash
    docker-compose up --build
    ```
2.  Aguarde até aparecer algo como `Servidor rodando na porta 3000` e `MongoDB Conectado`.
3.  Se der tudo certo, seu ambiente está perfeito. Pode parar com `Ctrl+C`.
