const Post = require("../models/Post");

// GET /posts
exports.getAll = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = { $text: { $search: search } };
        }

        const posts = await Post.find(query).populate("author", "name");
        res.json(posts);
    } catch (err) {
        console.error("Erro em getAll:", err); // Log para debug
        res.status(500).send("Erro ao buscar posts");
    }
};

// GET /posts/:id
exports.getById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            "author",
            "name"
        );
        if (!post) return res.status(404).json({ msg: "Post não encontrado" });
        res.json(post);
    } catch (err) {
        if (err.kind === "ObjectId")
            return res.status(404).json({ msg: "Post não encontrado" });
        res.status(500).send("Erro ao buscar post");
    }
};

// POST /posts
exports.create = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Verifica se o ID do usuário chegou corretamente
        if (!req.user || !req.user.id) {
            return res.status(400).json({
                msg: "Erro de autenticação: ID do usuário não encontrado.",
            });
        }

        const newPost = new Post({
            title,
            content,
            author: req.user.id,
        });

        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        console.error("Erro ao criar post:", err); // mostrará o erro real no terminal
        res.status(500).send("Erro ao criar post");
    }
};

// PUT /posts/:id
exports.update = async (req, res) => {
    try {
        const { title, content } = req.body;
        let post = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: { title, content } },
            { new: true }
        );
        if (!post) return res.status(404).json({ msg: "Post não encontrado" });
        res.json(post);
    } catch (err) {
        if (err.kind === "ObjectId")
            return res.status(404).json({ msg: "Post não encontrado" });
        res.status(500).send("Erro ao atualizar post");
    }
};

// DELETE /posts/:id
exports.delete = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: "Post não encontrado" });

        await post.deleteOne();
        res.json({ msg: "Post removido com sucesso" });
    } catch (err) {
        if (err.kind === "ObjectId")
            return res.status(404).json({ msg: "Post não encontrado" });
        res.status(500).send("Erro ao deletar post");
    }
};
