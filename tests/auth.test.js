const request = require('supertest');
const app = require('../src/app');
const dbHandler = require('./db-handler');

// Configuração do DB
beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Autenticação', () => {
    
    it('Deve registrar um novo Professor com sucesso', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                name: 'Professor Teste',
                email: 'prof@teste.com',
                password: 'senha123',
                role: 'professor'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('Deve falhar ao registrar email duplicado', async () => {
        // Cria o primeiro
        await request(app).post('/register').send({
            name: 'User 1', email: 'dup@teste.com', password: '123', role: 'student'
        });

        // Tenta criar o segundo igual
        const res = await request(app).post('/register').send({
            name: 'User 2', email: 'dup@teste.com', password: '123', role: 'student'
        });

        expect(res.statusCode).toEqual(400); // Bad Request
    });

    it('Deve realizar login e retornar um token JWT', async () => {
        // Registra
        await request(app).post('/register').send({
            name: 'Login User', email: 'login@teste.com', password: '123', role: 'student'
        });

        // Loga
        const res = await request(app).post('/login').send({
            email: 'login@teste.com',
            password: '123'
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('Deve negar login com senha incorreta', async () => {
        await request(app).post('/register').send({
            name: 'Wrong Pass', email: 'wrong@teste.com', password: '123', role: 'student'
        });

        const res = await request(app).post('/login').send({
            email: 'wrong@teste.com',
            password: 'errada'
        });

        expect(res.statusCode).toEqual(400);
    });
});