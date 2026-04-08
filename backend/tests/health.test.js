const request = require('supertest');

// We test only middleware-level routes that don't touch the DB.
jest.mock('../src/config/db', () => jest.fn(() => Promise.resolve()));

const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
