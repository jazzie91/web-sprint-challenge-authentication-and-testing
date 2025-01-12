const request = require('supertest');
const server = require('./server'); 
const db = require('./db'); 
const bcrypt = require('bcryptjs'); 

const resetDatabase = () => {
  if (db.users && Array.isArray(db.users)) {
    db.users.length = 0; 
  }
};

beforeEach(() => {
  resetDatabase();
});

afterAll(() => {
  if (server && server.close) {
    server.close();
  }
});

describe('Auth Endpoints', () => {
  const testUser = { username: 'testUser1', password: 'testPass123' };

  describe('[POST] /api/auth/register', () => {
    it('should respond with 201 and the new user on success', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send(testUser);

      console.log('Server response:', res.body);

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

    it('should hash the password before storing in the database', async () => {
      await request(server).post('/api/auth/register').send(testUser);

      if (!db.users) {
        console.error('Database is not initialized');
        return;
      }

      const storedUser = db.users.find((user) => user.username === testUser.username);
      expect(storedUser).toBeDefined();
      
      
      const isPasswordHashed = await bcrypt.compare(testUser.password, storedUser.password);
      expect(isPasswordHashed).toBe(true);
    });
  });

  describe('[POST] /api/auth/login', () => {
    beforeEach(async () => {
      resetDatabase();
      await request(server).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpassword',
      });
    });

    it('should respond with 200 and a token on successful login', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpassword' });

      console.log('Response:', res.body);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Welcome, testuser');
      expect(res.body).toHaveProperty('token');
    });

    it('should respond with 401 for invalid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should respond with 400 when username or password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Username and password required');
    });

    it('should reject login attempts for non-existent users', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'unknownUser', password: 'somePassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
