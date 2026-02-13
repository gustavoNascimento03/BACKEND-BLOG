# HACKATON

Este repositório contém o Back-end da aplicação de Blogging. A API foi construída com foco em escalabilidade, segurança e testabilidade.

## 🚀 Tecnologias
O projeto utiliza uma stack moderna e robusta:

- **Linguagem:** JavaScript (ES6+)
- **Runtime:** Node.js
- **Framework:** Express (API REST)
- **Banco de Dados:** MongoDB & Mongoose (NoSQL)
- **Containerização:** Docker & Docker Compose
- **Testes:** Jest & Supertest (Cobertura > 80%)
- **Segurança:** JWT (JSON Web Tokens) e Bcrypt

## ⚙️ Como rodar o projeto

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- Docker e Docker Compose.

- (Opcional para rodar localmente sem Docker) Node.js v14+ e NPM.

### Passo a Passo

1. **Clone o repositório:**
````env
git clone [https://github.com/gustavoNascimento03/BACKEND-BLOG](https://github.com/gustavoNascimento03/BACKEND-BLOG)
````

2. Configure as variáveis de ambiente: Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/tech_challenge_blog
    JWT_SECRET=sua_chave_secreta_aqui
    ```

3. Execute o comando para subir o ambiente:

```env
docker-compose up --build
```

4.A API estará disponível em `http://localhost:3000`.

## 🧪 Como rodar os testes

Para executar a suíte de testes:

```env
# Instale as dependências (caso não tenha feito)
npm install

# Execute os testes
npm test
```

## 📝 Endpoints Principais

### A API segue os princípios RESTful. Abaixo estão as principais rotas:

🔐 Autenticação
Método | Endpoint | Descrição
`POST` | /auth/register | Cria novo usuário (Professor ou Aluno).
`POSt` | /auth/login | Autentica o usuário e retorna o Token JWT.

📰 Posts (Blog)
Método | Endpoint | Descrição | Acesso
`GET` | /posts | Lista todos os posts (Busca via ?search=termo).
`GET` | /posts/:id | Detalhes de um post.
`POST` | /posts | Cria post (Apenas Professores).
`PUT` | /posts/:id | Edita post (Apenas Professores).
`DELETE` | /posts/:id | Remove post (Apenas Professores).

🏆 Gamification & Área do Professor
Método | Endpoint | Descrição | Acesso
`POST` | /score/read/:postId | Pontua o aluno ao ler um post. | Aluno
`GET` | /score/ranking | Exibe o ranking dos alunos. | Autenticado
`GET` | /teacher/notes | Mural de recados privados. | Professor

---

## ✅ Teste Manual Final (Sanity Check)

Para garantir que tudo está integrado corretamente (Banco de Dados + API) fora do ambiente de testes automatizados:

1. No terminal, suba os containers:
````env
docker-compose up --build
````

2. Aguarde os logs de inicialização:
- `MongoDB Conectado`
- `Servidor rodando na porta 300`

3. Faça uma requisição de teste (pode usar o navegador):
- Acesse: `http://localhost:3000/`
- Resultado Esperado: Mensagem "API está funcionando!".


## 📄✒️ Autor
``Gustavo S. Nascimento``