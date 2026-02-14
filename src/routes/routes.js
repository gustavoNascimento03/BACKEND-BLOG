const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const scoreController = require("../controllers/scoreController");
const teacherController = require("../controllers/teacherController");
const User = require("../models/User");
const { auth, isProfessor } = require("../middlewares/auth");

// --- Rota de Teste para o Postman (Sem proteção para facilitar teste) ---
router.get("/debug/users", async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); // Busca todos exceto a senha
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});

// --- Rotas de Autenticação ---
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/invite", auth, isProfessor, authController.inviteUser);

// Rotas de usuários (usando o middleware de autenticação importado)
router.get("/users", auth, authController.getAllUsers);
router.get("/users/me", auth, authController.getMe);
router.put("/users/:id", auth, authController.updateUser);
router.delete("/users/:id", auth, authController.deleteUser);

// --- Rotas de Posts (Blog) ---
router.get("/posts", auth, postController.getAll);
router.post("/posts", auth, isProfessor, postController.create);
router.get("/posts/:id", auth, postController.getById);
router.put("/posts/:id", auth, postController.update);
router.delete("/posts/:id", auth, postController.delete);

// --- Rotas de Pontuação (Gamification) ---
if (scoreController && scoreController.markPostAsRead) {
    router.post("/score/read/:postId", auth, scoreController.markPostAsRead);
    router.get("/score/ranking", auth, scoreController.getRanking);
}

// --- Rotas da Área dos Professores ---
if (teacherController && teacherController.getNotes) {
    router.get("/teacher/notes", auth, teacherController.getNotes);
    router.post("/teacher/notes", auth, teacherController.createNote);
    router.delete("/teacher/notes/:id", auth, teacherController.deleteNote);
}

module.exports = router;
