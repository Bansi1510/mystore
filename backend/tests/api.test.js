const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../src/config/env');

describe('Senior QA Flexible Password & Authentication Test Audit', () => {
  let userToken = '';
  let adminToken = '';
  const normalUserPass = 'ab2211';
  const adminUserPass = 'Bansi7874.,&1510';

  beforeAll(async () => {
    config.normalUserPassword = normalUserPass;
    config.normalUserHash = await bcrypt.hash(normalUserPass, 10);
    config.adminPassword = adminUserPass;
    config.adminHash = await bcrypt.hash(adminUserPass, 10);
    config.jwtSecret = 'BansiAaru1510';

    userToken = jwt.sign({ role: 'user' }, config.jwtSecret, { expiresIn: '1h' });
    adminToken = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '1h' });
  });

  describe('1. Flexible Password Authentication Scenarios', () => {
    it('POST /api/auth/login with lowercase normal password "ab2211" yields role="user"', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'ab2211' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('user');
    });

    it('POST /api/auth/login with uppercase normal password "AB2211" yields role="user"', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'AB2211' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('user');
    });

    it('POST /api/auth/login with admin password "Bansi7874.,&1510" yields role="admin"', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Bansi7874.,&1510' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
    });

    it('POST /api/auth/login with lowercase admin password "bansi7874.,&1510" yields role="admin"', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'bansi7874.,&1510' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
    });

    it('POST /api/auth/login with invalid password yields 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'completelyWrongPass99' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('2. Authorization & Admin Security Guards', () => {
    it('Normal user token accessing GET /api/admin/dashboard must be REJECTED with 403 FORBIDDEN_ADMIN_ONLY', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN_ADMIN_ONLY');
    });

    it('Admin token accessing GET /api/admin/dashboard succeeds', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
