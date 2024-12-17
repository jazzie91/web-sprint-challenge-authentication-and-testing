const request = require('supertest');
const server = require('../server'); 
const db = require('../db'); 

beforeAll(async () => {
  
  await db.migrate.latest();
});

beforeEach(async () => {
  
  await db('users').truncate();
});

afterAll(async () => {
  
  await db.destroy();
});

describe('Auth Endpoints', () => {
  const testUser = { username: 'testUser1', password: 'testPass123' };

  describe('[POST] /api/auth/register', () => {
    it('should respond with 201 and the new user on success', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', testUser.username);
    });

    it('should respond with 400 when username is already taken', async () => {
      
      await request(server).post('/api/auth/register').send(testUser);
      const res = await request(server).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Username already taken');
    });

    it('should respond with 400 when username or password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testUser1' }); 

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Username and password required');
    });
  });

  describe('[POST] /api/auth/login', () => {
    beforeEach(async () => {
      
      await request(server).post('/api/auth/register').send(testUser);
    });

    it('should respond with 200 and a token on successful login', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', `Welcome, ${testUser.username}`);
      expect(res.body).toHaveProperty('token');
    });

    it('should respond with 401 for invalid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should respond with 400 when username or password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: testUser.username }); 

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Username and password required');
    });
  });
});
