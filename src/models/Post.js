const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Link com o Professor
    createdAt: { type: Date, default: Date.now },
});

// Índice para busca textual (Requisito: Busca de posts)
PostSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", PostSchema);
