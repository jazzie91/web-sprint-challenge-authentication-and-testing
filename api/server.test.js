const request = require('supertest');
const app = require('./server'); 

let token = ''; 

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword' });
    expect(response.status).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  it('should log in and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });
    expect(response.status).toBe(200);
    token = response.body.token; 
  });
});

describe('Jokes Routes', () => {
  it('should return jokes if authenticated', async () => {
    const response = await request(app)
      .get('/api/jokes')
      .set('Authorization', token); 
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0); 
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/api/jokes');
    expect(response.status).toBe(401);
  });
});
