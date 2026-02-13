const User = require("../models/User");
const Post = require("../models/Post");

// POST /score/read/:postId
// Adiciona pontos ao aluno quando ele lê um post
exports.markPostAsRead = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id; // Vem do middleware de auth (JWT)

        // 1. Verifica se quem está tentando pontuar é um Aluno
        // (Professores não ganham pontos por ler)
        if (req.user.role !== "Aluno") {
            return res
                .status(403)
                .json({ msg: "Apenas alunos podem pontuar." });
        }

        // 2. Busca o usuário para verificar se já leu o post
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        // 3. Verifica se o post realmente existe
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post não encontrado." });
        }

        // 4. Verifica se o post já está na lista de lidos
        if (user.readPosts && user.readPosts.includes(postId)) {
            return res
                .status(400)
                .json({ msg: "Você já ganhou pontos por este post." });
        }

        // 5. Adiciona pontuação e marca post como lido
        // Cada leitura vale 10 pontos
        const POINTS_PER_READ = 10;

        user.score = (user.score || 0) + POINTS_PER_READ;
        user.readPosts.push(postId);

        await user.save();

        res.status(200).json({
            msg: `Parabéns! Você ganhou ${POINTS_PER_READ} pontos.`,
            currentScore: user.score,
        });
    } catch (err) {
        console.error("Erro ao pontuar:", err.message);
        res.status(500).json({ msg: "Erro no servidor ao computar pontos." });
    }
};

// GET /score/ranking
// Retorna os alunos com maior pontuação
exports.getRanking = async (req, res) => {
    try {
        // Busca apenas usuários com role 'Aluno', ordena por score decrescente
        // Limita ao top 10
        const topStudents = await User.find({ role: "Aluno" })
            .sort({ score: -1 })
            .limit(10)
            .select("name score"); // Traz apenas nome e pontuação

        res.status(200).json(topStudents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Erro ao buscar ranking." });
    }
};
