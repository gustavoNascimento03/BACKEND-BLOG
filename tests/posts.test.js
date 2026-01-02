const request = require("supertest");
const app = require("../src/app");
const dbHandler = require("./db-handler");

let teacherToken;
let studentToken;

beforeAll(async () => {
    await dbHandler.connect();
});

afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe("Posts e Permissões", () => {
    // Helper para criar usuários e pegar tokens antes dos testes
    beforeEach(async () => {
        const teacherRes = await request(app).post("/register").send({
            name: "Teacher",
            email: "teacher@school.com",
            password: "123",
            role: "professor",
        });
        teacherToken = teacherRes.body.token;

        const studentRes = await request(app).post("/register").send({
            name: "Student",
            email: "student@school.com",
            password: "123",
            role: "student",
        });
        studentToken = studentRes.body.token;
    });

    it("Professor deve conseguir criar um Post", async () => {
        const res = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                title: "Aula de React",
                content: "Conteúdo da aula...",
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe("Aula de React");
    });

    it("Aluno NÃO deve conseguir criar um Post", async () => {
        const res = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                title: "Post Invasor",
                content: "Tentando postar...",
            });

        // Espera-se 403 Forbidden (Acesso negado por regra de negócio)
        expect(res.statusCode).toEqual(403);
    });

    it("Qualquer usuário autenticado deve listar posts", async () => {
        // Professor cria post
        await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Post 1", content: "Conteúdo" });

        // Aluno tenta ler
        const res = await request(app)
            .get("/posts")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(1);
    });

    it("Busca de posts deve filtrar corretamente", async () => {
        // Cria dois posts
        await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "React Native", content: "Mobile dev" });

        await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Node.js", content: "Backend dev" });

        // Busca por "Mobile"
        const res = await request(app)
            .get("/posts?search=Mobile")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe("React Native");
    });

    it("Deve impedir exclusão de post por quem não é professor", async () => {
        // Cria post
        const postRes = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Para Deletar", content: "..." });
        const postId = postRes.body._id;

        // Aluno tenta deletar
        const deleteRes = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${studentToken}`);

        expect(deleteRes.statusCode).toEqual(403);
    });

    it("Professor deve conseguir atualizar um post (PUT)", async () => {
        // 1. Cria o post
        const post = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Titulo Antigo", content: "Conteudo" });

        const postId = post.body._id;

        // 2. Atualiza o post
        const res = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Titulo Novo", content: "Conteudo Atualizado" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe("Titulo Novo");
    });

    it("Professor deve conseguir deletar um post (DELETE)", async () => {
        // 1. Cria o post
        const post = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Para Deletar", content: "..." });

        const postId = post.body._id;

        // 2. Deleta o post
        const res = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${teacherToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.msg).toBe("Post removido com sucesso"); // Ajuste conforme a msg do seu controller
    });

    it("Deve buscar um post específico pelo ID (GET /:id)", async () => {
        // 1. Cria o post
        const post = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ title: "Post Unico", content: "..." });

        const postId = post.body._id;

        // 2. Busca pelo ID
        const res = await request(app)
            .get(`/posts/${postId}`)
            .set("Authorization", `Bearer ${studentToken}`); // Aluno pode ler

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe("Post Unico");
    });

    it("Deve retornar 404 ao tentar buscar um post inexistente", async () => {
        const fakeId = "654321654321654321654321"; // Um ID válido do MongoDB, mas que não existe no banco
        const res = await request(app)
            .get(`/posts/${fakeId}`)
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(404);
    });
});
