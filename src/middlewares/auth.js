const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Acesso negado" });

    try {
        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET || "secret",
        );

        // CORREÇÃO AQUI:
        // 1. Salvamos o payload inteiro em req.user (para o isProfessor ler a role)
        req.user = decoded;

        // 2. Mantemos o req.userId para compatibilidade com seus controllers antigos
        req.userId = decoded.id;

        next();
    } catch (e) {
        res.status(400).json({ msg: "Token inválido" });
    }
};

exports.isProfessor = (req, res, next) => {
    // Agora req.user existe porque definimos no auth acima
    if (!req.user || req.user.role !== "professor") {
        return res.status(403).json({ msg: "Acesso restrito a professores" });
    }
    next();
};
