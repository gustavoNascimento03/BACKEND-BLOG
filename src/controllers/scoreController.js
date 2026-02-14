const User = require("../models/User");

exports.markPostAsRead = async (req, res) => {
    try {
        const userId = req.user.id; // Vem do middleware auth
        const { postId } = req.params;

        const user = await User.findById(userId);

        // Verifica se o usuário é aluno (professores não ganham pontos)
        if (user.role !== "aluno") {
            return res
                .status(200)
                .json({ msg: "Professores não acumulam pontos." });
        }

        // Verifica se o post já foi lido
        if (user.readPosts.includes(postId)) {
            return res.status(200).json({
                msg: "Post já lido anteriormente.",
                points: user.points,
            });
        }

        // Adiciona o post à lista de lidos e soma 10 pontos
        user.readPosts.push(postId);
        user.points += 10;

        await user.save();

        res.status(200).json({
            msg: "Você ganhou 10 pontos por esta leitura! 🎉",
            points: user.points,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao processar pontuação." });
    }
};

exports.getRanking = async (req, res) => {
    try {
        // Busca apenas alunos, ordena por pontos (descendente) e limita aos top 20
        const ranking = await User.find({ role: "aluno" })
            .select("name points")
            .sort({ points: -1 })
            .limit(20);

        res.status(200).json(ranking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao gerar ranking." });
    }
};
