const express = require("express");
const router = express.Router();
const { auth, isProfessor } = require("../middlewares/auth");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const scoreController = require("../controllers/scoreController");
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middlewares/auth");

// --- Rotas de Autenticação ---
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/users", authMiddleware, authController.getAllUsers); // Protegido
router.put("/users/:id", authMiddleware, authController.updateUser);
router.delete("/users/:id", authMiddleware, authController.deleteUser);

// --- Rotas de Posts (Blog) ---
router.get("/posts", authMiddleware, postController.getAll);
router.get("/posts/:id", authMiddleware, postController.getById);
router.post("/posts", authMiddleware, postController.create);
router.put("/posts/:id", authMiddleware, postController.update);
router.delete("/posts/:id", authMiddleware, postController.delete);

// --- Rotas de Pontuação (Gamification) ---
// Verifica se o controller foi importado corretamente antes de usar
if (scoreController && scoreController.markPostAsRead) {
    router.post(
        "/score/read/:postId",
        authMiddleware,
        scoreController.markPostAsRead,
    );
    router.get("/score/ranking", authMiddleware, scoreController.getRanking);
} else {
    console.error("ERRO: scoreController não carregado corretamente.");
}

// --- Rotas da Área dos Professores (Privado) ---
if (teacherController && teacherController.getNotes) {
    router.get("/teacher/notes", authMiddleware, teacherController.getNotes);
    router.post("/teacher/notes", authMiddleware, teacherController.createNote);
    router.delete(
        "/teacher/notes/:id",
        authMiddleware,
        teacherController.deleteNote,
    );
} else {
    console.error("ERRO: teacherController não carregado corretamente.");
}

module.exports = router;
