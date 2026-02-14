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
            "name",
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
        const { title, content, category } = req.body;

        const newPost = await Post.create({
            title,
            content,
            category,
            author: req.userId,
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({ error: "Erro ao criar postagem" });
    }
};

// PUT /posts/:id
exports.update = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, category },
            { new: true },
        );

        if (!post) {
            return res.status(404).json({ msg: "Post não encontrado" });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar post" });
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
