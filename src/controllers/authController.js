const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuários
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res
                .status(400)
                .json({ msg: "Por favor, preencha todos os campos." });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "Usuário já existe" });
        }

        user = new User({ name, email, password, role });

        // Criptografia da senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { id: user.id, role: user.role };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            },
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor ao registrar");
    }
};

// Lista usuários
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar usuários" });
    }
};

// Login (CORRIGIDO PARA O FRONTEND)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Credenciais Inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Credenciais Inválidas" });
        }

        const payload = { id: user.id, role: user.role };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                // AQUI ESTA A MUDANÇA: Retornamos token E o usuário
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                });
            },
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor ao logar");
    }
};

// ATUALIZAR USUÁRIO (CORRIGIDO HASH DE SENHA)
exports.updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.params.id;

        let updateData = { name, email };

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true },
        ).select("-password");

        if (!user)
            return res.status(404).json({ msg: "Usuário não encontrado" });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar perfil" });
    }
};

// EXCLUIR USUÁRIO
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        res.status(200).json({ msg: "Usuário excluído com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao excluir usuário" });
    }
};

// MEU PERFIL (USADO NO FRONTEND)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user)
            return res.status(404).json({ error: "Usuário não encontrado." });
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar perfil." });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // 1. Validação
        if (!name || !email || !role) {
            return res.status(400).json({ msg: "Preencha todos os campos." });
        }

        // 2. Verifica se já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "E-mail já cadastrado." });
        }

        // 3. Cria o usuário com senha padrão
        // (Em um app real, aqui enviaríamos um e-mail de convite)
        const password = "123"; // Senha temporária

        const newUser = new User({
            name,
            email,
            password, // O Model vai criptografar isso antes de salvar?
            role,
        });

        // 4. Criptografar a senha manualmente (se o seu Model não fizer via pre-save hook)
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        res.status(201).json({
            msg: `Usuário criado com sucesso! Senha temporária: ${password}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao convidar usuário." });
    }
};
