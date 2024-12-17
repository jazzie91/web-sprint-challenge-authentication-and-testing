const request = require('supertest');
const server = require('../server'); 
const db = require('../db');

beforeAll(async () => {
  await db('users').truncate(); 
});

beforeEach(async () => {
  await db('users').truncate(); 
});

describe('POST /api/auth/register', () => {
  it('should add a new user and return status 201', async () => {
    const newUser = { username: 'testuser', password: 'testpassword' };

    const res = await request(server)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  it('should return 400 when username already exists', async () => {
    const existingUser = { username: 'testuser', password: 'testpassword' };

    
    await request(server)
      .post('/api/auth/register')
      .send(existingUser);

    
    const res = await request(server)
      .post('/api/auth/register')
      .send(existingUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username already taken');
  });

  it('should return 400 if username or password is missing', async () => {
    const invalidUser = { username: '' }; 

    const res = await request(server)
      .post('/api/auth/register')
      .send(invalidUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username and password required');
  });
});
