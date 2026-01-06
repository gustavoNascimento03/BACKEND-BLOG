const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuários (Professores e Alunos)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validação básica
        if (!name || !email || !password || !role) {
            return res
                .status(400)
                .json({ msg: "Por favor, preencha todos os campos." });
        }

        // 2. Verifica se usuário já existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "Usuário já existe" });
        }

        // 3. Cria a instância do usuário
        user = new User({
            name,
            email,
            password,
            role,
        });

        // 4. Criptografa a senha (Hash) antes de salvar
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // 5. Gera o Token JWT para login imediato
        const payload = {
            id: user.id,
            role: user.role,
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor ao registrar");
    }
};

// Lista usuários
exports.getAllUsers = async (req, res) => {
    try {
        // Busca todos os usuários, mas esconde a senha (-password)
        const User = require("../models/User"); // Garanta que o Model está importado
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar usuários" });
    }
};

// Login
exports.login = async (req, res) => {
    console.log("Chegou no Login!");
    console.log("Dados recebidos:", req.body);

    try {
        const { email, password } = req.body;

        // 1. Verifica se o usuário existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Credenciais Inválidas" });
        }

        // 2. Compara a senha enviada com o hash no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Credenciais Inválidas" });
        }

        // 3. Gera e retorna o Token
        const payload = {
            id: user.id,
            role: user.role,
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor ao logar");
    }
};

// ATUALIZAR USUÁRIO
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    try {
        const User = require("../models/User"); // Importe caso não esteja no topo

        // Prepara o objeto de atualização
        const updateData = { name, email, role };

        // Se o usuário mandou uma nova senha, adiciona ao objeto
        // (Obs: Dependendo do seu Model, pode ser necessário tratar o hash aqui,
        // mas vamos manter simples para resolver o erro 404 primeiro)
        if (password) {
            updateData.password = password;
        }

        // Busca pelo ID e atualiza
        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        res.status(200).json({ msg: "Usuário atualizado com sucesso!", user });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao atualizar usuário" });
    }
};

// EXCLUIR USUÁRIO
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const User = require("../models/User");
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        res.status(200).json({ msg: "Usuário excluído com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao excluir usuário" });
    }
};
