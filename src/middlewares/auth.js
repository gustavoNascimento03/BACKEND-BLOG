const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Acesso negado" });

    try {
        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET || "secret"
        );

        req.user = decoded;

        next();
    } catch (e) {
        res.status(400).json({ msg: "Token inválido" });
    }
};

exports.isProfessor = (req, res, next) => {
    // Verifica se o usuário existe e se a role é professor
    if (!req.user || req.user.role !== "professor") {
        return res.status(403).json({ msg: "Acesso restrito a professores" });
    }
    next();
};
