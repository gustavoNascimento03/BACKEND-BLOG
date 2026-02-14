const TeacherNote = require("../models/TeacherNote");

// GET /teacher/notes
exports.getNotes = async (req, res) => {
    try {
        if (req.user.role !== "Professor") {
            return res
                .status(403)
                .json({ msg: "Acesso negado. Área restrita aos professores." });
        }

        const notes = await TeacherNote.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar notas dos professores");
    }
};

// POST /teacher/notes
exports.createNote = async (req, res) => {
    try {
        const { content } = req.body;

        if (req.user.role !== "Professor") {
            return res.status(403).json({
                msg: "Apenas professores podem criar notas nesta área.",
            });
        }

        if (!content) {
            return res
                .status(400)
                .json({ msg: "O conteúdo da nota é obrigatório." });
        }

        const newNote = new TeacherNote({
            content,
            author: req.user.id,
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao criar nota");
    }
};

// DELETE /teacher/notes/:id
exports.deleteNote = async (req, res) => {
    try {
        if (req.user.role !== "Professor") {
            return res.status(403).json({ msg: "Ação não permitida." });
        }

        const note = await TeacherNote.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ msg: "Nota não encontrada" });
        }

        await note.deleteOne();
        res.json({ msg: "Nota removida com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao deletar nota");
    }
};
