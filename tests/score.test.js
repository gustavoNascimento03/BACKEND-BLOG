const scoreController = require("../src/controllers/scoreController");
const User = require("../src/models/User");
const Post = require("../src/models/Post");

// Mock dos Models para não acessar o banco de dados de verdade
jest.mock("../src/models/User");
jest.mock("../src/models/Post");

describe("Score Controller", () => {
    let req, res;

    beforeEach(() => {
        // Reseta os mocks antes de cada teste
        jest.clearAllMocks();

        // Mock básico de req e res
        req = {
            params: {},
            user: {}, // Será preenchido em cada teste
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe("markPostAsRead", () => {
        it("deve adicionar pontos se o usuário for aluno e post existir", async () => {
            req.params.postId = "post123";
            req.user = { id: "user1", role: "Aluno" };

            // Simula User e Post encontrados no banco
            const mockUser = {
                _id: "user1",
                role: "Aluno",
                score: 0,
                readPosts: [],
                save: jest.fn(), // Simula o método .save() do mongoose
            };

            User.findById.mockResolvedValue(mockUser);
            Post.findById.mockResolvedValue({ _id: "post123" });

            await scoreController.markPostAsRead(req, res);

            // Verificações
            expect(mockUser.score).toBe(10); // Verifica se aumentou 10 pontos
            expect(mockUser.readPosts).toContain("post123"); // Verifica se marcou como lido
            expect(mockUser.save).toHaveBeenCalled(); // Verifica se salvou no banco
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("não deve permitir que Professores ganhem pontos", async () => {
            req.user = { id: "prof1", role: "Professor" };

            await scoreController.markPostAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                msg: "Apenas alunos podem pontuar.",
            });
            expect(User.findById).not.toHaveBeenCalled();
        });

        it("não deve pontuar duas vezes pelo mesmo post", async () => {
            req.params.postId = "post123";
            req.user = { id: "user1", role: "Aluno" };

            const mockUser = {
                _id: "user1",
                readPosts: ["post123"], // Já leu este post
                save: jest.fn(),
            };

            User.findById.mockResolvedValue(mockUser);
            Post.findById.mockResolvedValue({ _id: "post123" });

            await scoreController.markPostAsRead(req, res);

            expect(mockUser.save).not.toHaveBeenCalled(); // Não deve salvar nada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringMatching(/já ganhou pontos/),
                }),
            );
        });
    });

    describe("getRanking", () => {
        it("deve retornar a lista de alunos ordenada", async () => {
            // Mock da cadeia de chamadas do Mongoose: find -> sort -> limit -> select
            const mockChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([
                    { name: "João", score: 100 },
                    { name: "Maria", score: 90 },
                ]),
            };
            User.find.mockReturnValue(mockChain);

            await scoreController.getRanking(req, res);

            expect(User.find).toHaveBeenCalledWith({ role: "Aluno" });
            expect(mockChain.sort).toHaveBeenCalledWith({ score: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.arrayContaining([{ name: "João", score: 100 }]),
            );
        });
    });
});
