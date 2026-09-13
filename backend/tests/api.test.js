const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../src/config/env');

describe('Backend API Integration Tests', () => {
  let userToken = '';
  let adminToken = '';
  const testUserPassword = 'user123';
  const testAdminPassword = 'admin123';

  beforeAll(async () => {
    // Generate test password hashes dynamically for config
    config.normalUserHash = await bcrypt.hash(testUserPassword, 10);
    config.adminHash = await bcrypt.hash(testAdminPassword, 10);
    config.jwtSecret = 'test_jwt_secret_key';

    userToken = jwt.sign({ role: 'user' }, config.jwtSecret, { expiresIn: '1h' });
    adminToken = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '1h' });
  });

  describe('Health API', () => {
    it('GET /api/health should return 200 OK with server status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.server).toBe('ok');
    });
  });

  describe('Authentication API', () => {
    it('POST /api/auth/login with normal user password should return user role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: testUserPassword });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('user');
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login with admin password should return admin role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: testAdminPassword });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login with invalid password should fail with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'wrongPassword99' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Authorization & Role Security', () => {
    it('Normal user token attempting GET /api/admin/dashboard should be rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN_ADMIN_ONLY');
    });

    it('Unauthenticated request to GET /api/folders should fail with 401', async () => {
      const res = await request(app).get('/api/folders');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
