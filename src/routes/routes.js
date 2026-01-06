const express = require("express");
const router = express.Router();
const { auth, isProfessor } = require("../middlewares/auth");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

// Autenticação
router.post("/login", authController.login);
router.post("/register", authController.register);

// Posts Públicos (Leitura)
router.get("/posts", auth, postController.getAll); // Alunos podem visualizar
router.get("/posts/:id", auth, postController.getById);

// Posts Protegidos (Escrita - Só Professores)
router.post("/posts", auth, isProfessor, postController.create);
router.put("/posts/:id", auth, isProfessor, postController.update);
router.delete("/posts/:id", auth, isProfessor, postController.delete);

// Lista de Usuários
router.get("/users", auth, isProfessor, authController.getAllUsers);
router.put("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);

module.exports = router;
