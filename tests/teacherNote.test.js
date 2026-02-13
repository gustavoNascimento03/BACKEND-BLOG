const teacherController = require("../src/controllers/teacherController");
const TeacherNote = require("../src/models/teacherNote");

jest.mock("../src/models/teacherNote");

describe("Teacher Controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    describe("getNotes", () => {
        it("deve retornar notas se o usuário for Professor", async () => {
            req.user = { role: "Professor" };

            const mockNotes = [{ content: "Reunião dia 10" }];
            const mockChain = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockNotes),
            };
            TeacherNote.find.mockReturnValue(mockChain);

            await teacherController.getNotes(req, res);

            expect(TeacherNote.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockNotes);
        });

        it("deve bloquear acesso de Alunos", async () => {
            req.user = { role: "Aluno" };

            await teacherController.getNotes(req, res);

            expect(TeacherNote.find).not.toHaveBeenCalled(); // Não deve nem tentar buscar no banco
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe("createNote", () => {
        it("deve criar nota com sucesso", async () => {
            req.user = { id: "prof1", role: "Professor" };
            req.body = { content: "Lembrete importante" };

            // Mock do construtor e do método save
            const saveMock = jest.fn().mockResolvedValue({
                _id: "note1",
                content: "Lembrete importante",
            });
            TeacherNote.mockImplementation(() => ({
                save: saveMock,
            }));

            await teacherController.createNote(req, res);

            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("deve impedir aluno de criar nota", async () => {
            req.user = { role: "Aluno" };
            req.body = { content: "Tentativa de hack" };

            await teacherController.createNote(req, res);

            expect(TeacherNote).not.toHaveBeenCalled(); // Não deve instanciar o model
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
