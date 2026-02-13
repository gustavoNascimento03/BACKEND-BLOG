const mongoose = require("mongoose");

// Este model é separado do 'Post' para garantir que alunos
// nunca consigam buscar essas informações acidentalmente.
const TeacherNoteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("TeacherNote", TeacherNoteSchema);
