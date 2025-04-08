const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe('auth endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    beforeEach(async () => {
      await db('users').truncate();
    });

    test('responds with 400 if username or password missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'test' }); 
      expect(res.status).toBe(400); 
      expect(res.body).toEqual({ message: 'username and password required' });
    });

    test('responds with new user on successful registration', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'test' });
      expect(res.status).toBe(201); 
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe('test');
    });
  });

  describe('[POST] /api/auth/login', () => {
    beforeEach(async () => {
      await db('users').truncate();
    });

    test('responds with token on successful login', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'test' });
      
      const resLogin = await request(server)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test' });

      expect(resLogin.status).toBe(200); 
      expect(resLogin.body).toHaveProperty('token');
      expect(resLogin.body.message).toBe('welcome, test');
    });

    test('responds with error on invalid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'wrong' });

      expect(res.status).toBe(401); 
      expect(res.body).toEqual({ message: 'invalid credentials' });
    });
  });
});

describe('jokes endpoints', () => {
  test('responds with 401 if no token provided', async () => {
    const res = await request(server).get('/api/jokes');
    expect(res.status).toBe(401); 
    expect(res.body).toEqual({ message: "token required" });
  });

  test('responds with jokes when valid token provided', async () => {
    // Register and login to get token
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'test', password: 'test' });
    
    const login = await request(server)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', login.body.token);
    
    expect(res.status).toBe(200); 
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// Sanity test to make sure jest is working
test('sanity', () => {
  expect(true).toBe(true);
});
